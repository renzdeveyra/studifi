use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;

/// User session information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct UserSession {
    pub session_id: String,
    pub user_principal: Principal,
    pub roles: Vec<Role>,
    pub created_at: Timestamp,
    pub expires_at: Timestamp,
    pub last_activity: Timestamp,
    pub is_active: bool,
}

/// User roles in the system
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Serialize)]
pub enum Role {
    Student,
    Donor,
    University,
    CommunityValidator,
    TeamMember,
    Admin,
    SystemAdmin,
}

/// Permissions for different operations
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Serialize)]
pub enum Permission {
    // Student permissions
    CreateProfile,
    UpdateProfile,
    SubmitLoanApplication,
    MakePayment,
    ViewOwnData,
    
    // Community permissions
    ValidateCredit,
    VoteOnProposals,
    CreateProposals,
    
    // University permissions
    VerifyStudents,
    IssueCredentials,
    
    // Admin permissions
    ManageUsers,
    ViewAllData,
    ManageSystem,
    AccessAuditLogs,
    
    // System permissions
    ManageCanisters,
    SystemMaintenance,
}

/// Authentication request
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct AuthRequest {
    pub user_principal: Principal,
    pub requested_roles: Vec<Role>,
    pub session_duration_hours: Option<u64>,
}

/// Authentication response
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct AuthResponse {
    pub session_id: String,
    pub user_principal: Principal,
    pub granted_roles: Vec<Role>,
    pub expires_at: Timestamp,
    pub permissions: Vec<Permission>,
}

/// Role assignment request
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct RoleAssignmentRequest {
    pub target_principal: Principal,
    pub roles: Vec<Role>,
    pub assigned_by: Principal,
    pub reason: String,
}

/// Audit event for authentication actions
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct AuthAuditEvent {
    pub event_id: String,
    pub event_type: AuthEventType,
    pub user_principal: Principal,
    pub session_id: Option<String>,
    pub details: String,
    pub timestamp: Timestamp,
    pub ip_address: Option<String>,
}

/// Types of authentication events
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum AuthEventType {
    SessionCreated,
    SessionExpired,
    SessionTerminated,
    RoleAssigned,
    RoleRevoked,
    PermissionDenied,
    InvalidAccess,
}

/// Session statistics
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct SessionStats {
    pub total_sessions: u32,
    pub active_sessions: u32,
    pub expired_sessions: u32,
    pub total_users: u32,
    pub users_by_role: Vec<(Role, u32)>,
}

impl UserSession {
    pub fn new(
        session_id: String,
        user_principal: Principal,
        roles: Vec<Role>,
        duration_hours: u64,
    ) -> Self {
        let now = current_time();
        let expires_at = now + (duration_hours * 60 * 60 * 1_000_000_000);
        
        Self {
            session_id,
            user_principal,
            roles,
            created_at: now,
            expires_at,
            last_activity: now,
            is_active: true,
        }
    }
    
    pub fn is_expired(&self) -> bool {
        current_time() > self.expires_at
    }
    
    pub fn update_activity(&mut self) {
        self.last_activity = current_time();
    }
    
    pub fn has_role(&self, role: &Role) -> bool {
        self.roles.contains(role)
    }
    
    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.roles.iter().any(|role| role_has_permission(role, permission))
    }
}

/// Check if a role has a specific permission
pub fn role_has_permission(role: &Role, permission: &Permission) -> bool {
    match role {
        Role::Student => matches!(permission,
            Permission::CreateProfile |
            Permission::UpdateProfile |
            Permission::SubmitLoanApplication |
            Permission::MakePayment |
            Permission::ViewOwnData |
            Permission::VoteOnProposals
        ),
        Role::Donor => matches!(permission,
            Permission::ViewOwnData |
            Permission::VoteOnProposals |
            Permission::CreateProposals
        ),
        Role::University => matches!(permission,
            Permission::VerifyStudents |
            Permission::IssueCredentials |
            Permission::ViewOwnData
        ),
        Role::CommunityValidator => matches!(permission,
            Permission::ValidateCredit |
            Permission::VoteOnProposals |
            Permission::ViewOwnData
        ),
        Role::TeamMember => matches!(permission,
            Permission::ViewAllData |
            Permission::ManageUsers |
            Permission::AccessAuditLogs |
            Permission::CreateProposals |
            Permission::VoteOnProposals
        ),
        Role::Admin => matches!(permission,
            Permission::ManageUsers |
            Permission::ViewAllData |
            Permission::ManageSystem |
            Permission::AccessAuditLogs |
            Permission::CreateProposals |
            Permission::VoteOnProposals
        ),
        Role::SystemAdmin => true, // System admin has all permissions
    }
}

/// Default session duration in hours
pub const DEFAULT_SESSION_DURATION_HOURS: u64 = 24;
pub const MAX_SESSION_DURATION_HOURS: u64 = 168; // 1 week
pub const SESSION_CLEANUP_INTERVAL_HOURS: u64 = 1;
