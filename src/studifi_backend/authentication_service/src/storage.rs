use std::collections::HashMap;
use std::cell::RefCell;
use candid::Principal;
use ic_stable_structures::{DefaultMemoryImpl, RestrictedMemory, StableBTreeMap, Storable, storable::Bound};
use std::borrow::Cow;

use crate::types::*;
use shared::*;

type Memory = RestrictedMemory<DefaultMemoryImpl>;

const SESSIONS_MEMORY_ID: u64 = 0;
const USER_ROLES_MEMORY_ID: u64 = 1;
const AUDIT_EVENTS_MEMORY_ID: u64 = 2;

// Storable implementations
impl Storable for UserSession {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Wrapper type for Vec<Role> to implement Storable
#[derive(Clone, Debug)]
pub struct RoleList(pub Vec<Role>);

impl Storable for RoleList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        RoleList(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AuthAuditEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

/// Authentication storage structure
pub struct AuthStorage {
    pub sessions: StableBTreeMap<String, UserSession, Memory>,
    pub user_roles: StableBTreeMap<Principal, RoleList, Memory>,
    pub audit_events: StableBTreeMap<String, AuthAuditEvent, Memory>,
    pub session_counter: u64,
    pub audit_counter: u64,
}

impl Default for AuthStorage {
    fn default() -> Self {
        Self {
            sessions: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), SESSIONS_MEMORY_ID..SESSIONS_MEMORY_ID+1)
            ),
            user_roles: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), USER_ROLES_MEMORY_ID..USER_ROLES_MEMORY_ID+1)
            ),
            audit_events: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), AUDIT_EVENTS_MEMORY_ID..AUDIT_EVENTS_MEMORY_ID+1)
            ),
            session_counter: 0,
            audit_counter: 0,
        }
    }
}

impl AuthStorage {
    /// Create a new session
    pub fn create_session(&mut self, session: UserSession) -> String {
        let session_id = session.session_id.clone();
        self.sessions.insert(session_id.clone(), session);
        session_id
    }

    /// Get session by ID
    pub fn get_session(&self, session_id: &str) -> Option<UserSession> {
        self.sessions.get(&session_id.to_string())
    }

    /// Update session
    pub fn update_session(&mut self, session_id: String, session: UserSession) {
        self.sessions.insert(session_id, session);
    }

    /// Remove session
    pub fn remove_session(&mut self, session_id: &str) {
        self.sessions.remove(&session_id.to_string());
    }

    /// Get all active sessions for a user
    pub fn get_user_sessions(&self, user_principal: &Principal) -> Vec<UserSession> {
        self.sessions
            .iter()
            .filter(|(_, session)| &session.user_principal == user_principal && session.is_active)
            .map(|(_, session)| session)
            .collect()
    }

    /// Get all expired sessions
    pub fn get_expired_sessions(&self) -> Vec<String> {
        self.sessions
            .iter()
            .filter(|(_, session)| session.is_expired())
            .map(|(session_id, _)| session_id)
            .collect()
    }

    /// Set user roles
    pub fn set_user_roles(&mut self, user_principal: Principal, roles: Vec<Role>) {
        self.user_roles.insert(user_principal, RoleList(roles));
    }

    /// Get user roles
    pub fn get_user_roles(&self, user_principal: &Principal) -> Vec<Role> {
        self.user_roles.get(user_principal).map(|role_list| role_list.0).unwrap_or_default()
    }

    /// Add role to user
    pub fn add_user_role(&mut self, user_principal: Principal, role: Role) {
        let mut roles = self.get_user_roles(&user_principal);
        if !roles.contains(&role) {
            roles.push(role);
            self.set_user_roles(user_principal, roles);
        }
    }

    /// Remove role from user
    pub fn remove_user_role(&mut self, user_principal: Principal, role: &Role) {
        let mut roles = self.get_user_roles(&user_principal);
        roles.retain(|r| r != role);
        self.set_user_roles(user_principal, roles);
    }

    /// Log audit event
    pub fn log_audit_event(&mut self, event: AuthAuditEvent) {
        self.audit_events.insert(event.event_id.clone(), event);
        self.audit_counter += 1;
    }

    /// Get audit events for user
    pub fn get_user_audit_events(&self, user_principal: &Principal) -> Vec<AuthAuditEvent> {
        self.audit_events
            .iter()
            .filter(|(_, event)| &event.user_principal == user_principal)
            .map(|(_, event)| event)
            .collect()
    }

    /// Get recent audit events
    pub fn get_recent_audit_events(&self, limit: usize) -> Vec<AuthAuditEvent> {
        self.audit_events
            .iter()
            .rev()
            .take(limit)
            .map(|(_, event)| event)
            .collect()
    }

    /// Generate next session ID
    pub fn next_session_id(&mut self) -> String {
        self.session_counter += 1;
        generate_id("SESSION", self.session_counter)
    }

    /// Generate next audit event ID
    pub fn next_audit_id(&mut self) -> String {
        self.audit_counter += 1;
        generate_id("AUDIT", self.audit_counter)
    }

    /// Calculate session statistics
    pub fn calculate_session_stats(&self) -> SessionStats {
        let mut total_sessions = 0;
        let mut active_sessions = 0;
        let mut expired_sessions = 0;
        let mut users_set = std::collections::HashSet::new();
        let mut role_counts: HashMap<Role, u32> = HashMap::new();

        for (_, session) in self.sessions.iter() {
            total_sessions += 1;
            users_set.insert(session.user_principal);

            if session.is_expired() {
                expired_sessions += 1;
            } else if session.is_active {
                active_sessions += 1;
            }

            for role in &session.roles {
                *role_counts.entry(role.clone()).or_insert(0) += 1;
            }
        }

        let users_by_role = role_counts.into_iter().collect();

        SessionStats {
            total_sessions,
            active_sessions,
            expired_sessions,
            total_users: users_set.len() as u32,
            users_by_role,
        }
    }

    /// Clean up expired sessions
    pub fn cleanup_expired_sessions(&mut self) -> u32 {
        let expired_session_ids = self.get_expired_sessions();
        let count = expired_session_ids.len() as u32;

        for session_id in expired_session_ids {
            self.remove_session(&session_id);
        }

        count
    }
}

thread_local! {
    static STORAGE: RefCell<AuthStorage> = RefCell::new(AuthStorage::default());
}

/// Execute a function with read access to storage
pub fn with_storage<R>(f: impl FnOnce(&AuthStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

/// Execute a function with write access to storage
pub fn with_storage_mut<R>(f: impl FnOnce(&mut AuthStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
