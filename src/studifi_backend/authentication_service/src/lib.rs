mod types;
mod storage;

use candid::{candid_method, Principal};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade, caller};
use ic_cdk_timers::{set_timer_interval, TimerId};
use std::time::Duration;

use types::*;
use storage::*;
use shared::*;

// Global timer for session cleanup
static mut CLEANUP_TIMER: Option<TimerId> = None;

#[init]
fn init() {
    ic_cdk::println!("Authentication Service canister initialized");
    
    // Start session cleanup timer (runs every hour)
    unsafe {
        CLEANUP_TIMER = Some(set_timer_interval(
            Duration::from_secs(SESSION_CLEANUP_INTERVAL_HOURS * 3600),
            || {
                ic_cdk::spawn(async {
                    let cleaned = with_storage_mut(|storage| storage.cleanup_expired_sessions());
                    if cleaned > 0 {
                        ic_cdk::println!("Cleaned up {} expired sessions", cleaned);
                    }
                });
            },
        ));
    }
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Authentication Service canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Authentication Service canister upgraded successfully");
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/// Create a new authentication session
#[update]
#[candid_method(update)]
async fn create_session(auth_request: AuthRequest) -> StudiFiResult<AuthResponse> {
    let caller = caller();
    
    // Verify the caller matches the requested principal
    if caller != auth_request.user_principal {
        return Err(StudiFiError::Unauthorized("Principal mismatch".to_string()));
    }
    
    // Get user's assigned roles
    let assigned_roles = with_storage(|storage| storage.get_user_roles(&auth_request.user_principal));
    
    // Filter requested roles to only include assigned ones
    let granted_roles: Vec<Role> = auth_request.requested_roles
        .into_iter()
        .filter(|role| assigned_roles.contains(role))
        .collect();
    
    if granted_roles.is_empty() {
        return Err(StudiFiError::Unauthorized("No valid roles assigned".to_string()));
    }
    
    // Determine session duration
    let duration_hours = auth_request.session_duration_hours
        .unwrap_or(DEFAULT_SESSION_DURATION_HOURS)
        .min(MAX_SESSION_DURATION_HOURS);
    
    // Create session
    let session_id = with_storage_mut(|storage| {
        let session_id = storage.next_session_id();
        let session = UserSession::new(
            session_id.clone(),
            auth_request.user_principal,
            granted_roles.clone(),
            duration_hours,
        );
        storage.create_session(session);
        
        // Log audit event
        let audit_event = AuthAuditEvent {
            event_id: storage.next_audit_id(),
            event_type: AuthEventType::SessionCreated,
            user_principal: auth_request.user_principal,
            session_id: Some(session_id.clone()),
            details: format!("Session created with roles: {:?}", granted_roles),
            timestamp: current_time(),
            ip_address: None,
        };
        storage.log_audit_event(audit_event);
        
        session_id
    });
    
    // Collect permissions for granted roles
    let permissions: Vec<Permission> = granted_roles
        .iter()
        .flat_map(|role| get_role_permissions(role))
        .collect();
    
    let response = AuthResponse {
        session_id,
        user_principal: auth_request.user_principal,
        granted_roles,
        expires_at: current_time() + (duration_hours * 60 * 60 * 1_000_000_000),
        permissions,
    };
    
    ic_cdk::println!("Created session for user: {:?}", auth_request.user_principal);
    Ok(response)
}

/// Validate a session and check permissions
#[query]
#[candid_method(query)]
fn validate_session(session_id: String, required_permission: Option<Permission>) -> StudiFiResult<UserSession> {
    let session = with_storage(|storage| storage.get_session(&session_id))
        .ok_or_else(|| StudiFiError::NotFound("Session not found".to_string()))?;
    
    if session.is_expired() {
        return Err(StudiFiError::Unauthorized("Session expired".to_string()));
    }
    
    if !session.is_active {
        return Err(StudiFiError::Unauthorized("Session inactive".to_string()));
    }
    
    // Check permission if required
    if let Some(permission) = required_permission {
        if !session.has_permission(&permission) {
            return Err(StudiFiError::Unauthorized("Insufficient permissions".to_string()));
        }
    }
    
    Ok(session)
}

/// Terminate a session
#[update]
#[candid_method(update)]
async fn terminate_session(session_id: String) -> StudiFiResult<String> {
    let caller = caller();
    
    let session = with_storage(|storage| storage.get_session(&session_id))
        .ok_or_else(|| StudiFiError::NotFound("Session not found".to_string()))?;
    
    // Only allow termination by session owner or admin
    if session.user_principal != caller {
        let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));
        if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
            return Err(StudiFiError::Unauthorized("Cannot terminate other user's session".to_string()));
        }
    }
    
    with_storage_mut(|storage| {
        storage.remove_session(&session_id);
        
        // Log audit event
        let audit_event = AuthAuditEvent {
            event_id: storage.next_audit_id(),
            event_type: AuthEventType::SessionTerminated,
            user_principal: session.user_principal,
            session_id: Some(session_id.clone()),
            details: format!("Session terminated by: {:?}", caller),
            timestamp: current_time(),
            ip_address: None,
        };
        storage.log_audit_event(audit_event);
    });
    
    Ok(format!("Session {} terminated", session_id))
}

/// Update session activity (extend session)
#[update]
#[candid_method(update)]
async fn update_session_activity(session_id: String) -> StudiFiResult<UserSession> {
    let caller = caller();
    
    let mut session = with_storage(|storage| storage.get_session(&session_id))
        .ok_or_else(|| StudiFiError::NotFound("Session not found".to_string()))?;
    
    if session.user_principal != caller {
        return Err(StudiFiError::Unauthorized("Cannot update other user's session".to_string()));
    }
    
    if session.is_expired() {
        return Err(StudiFiError::Unauthorized("Session expired".to_string()));
    }
    
    session.update_activity();
    
    with_storage_mut(|storage| {
        storage.update_session(session_id, session.clone());
    });
    
    Ok(session)
}

// ============================================================================
// ROLE MANAGEMENT FUNCTIONS
// ============================================================================

/// Assign roles to a user (admin only)
#[update]
#[candid_method(update)]
async fn assign_roles(request: RoleAssignmentRequest) -> StudiFiResult<String> {
    let caller = caller();
    
    // Check if caller has admin permissions
    let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));
    if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
        return Err(StudiFiError::Unauthorized("Admin role required".to_string()));
    }
    
    // Prevent non-system-admins from assigning system admin role
    if request.roles.contains(&Role::SystemAdmin) && !caller_roles.contains(&Role::SystemAdmin) {
        return Err(StudiFiError::Unauthorized("SystemAdmin role required to assign SystemAdmin".to_string()));
    }
    
    with_storage_mut(|storage| {
        storage.set_user_roles(request.target_principal, request.roles.clone());
        
        // Log audit event
        let audit_event = AuthAuditEvent {
            event_id: storage.next_audit_id(),
            event_type: AuthEventType::RoleAssigned,
            user_principal: request.target_principal,
            session_id: None,
            details: format!("Roles assigned: {:?} by {:?}. Reason: {}", request.roles, caller, request.reason),
            timestamp: current_time(),
            ip_address: None,
        };
        storage.log_audit_event(audit_event);
    });
    
    Ok(format!("Roles assigned to {:?}", request.target_principal))
}

/// Get user roles
#[query]
#[candid_method(query)]
fn get_user_roles(user_principal: Principal) -> Vec<Role> {
    with_storage(|storage| storage.get_user_roles(&user_principal))
}

/// Get current caller's roles
#[query]
#[candid_method(query)]
fn get_my_roles() -> Vec<Role> {
    let caller = caller();
    with_storage(|storage| storage.get_user_roles(&caller))
}

// Helper function to get all permissions for a role
fn get_role_permissions(role: &Role) -> Vec<Permission> {
    use Permission::*;
    
    match role {
        Role::Student => vec![
            CreateProfile, UpdateProfile, SubmitLoanApplication, 
            MakePayment, ViewOwnData, VoteOnProposals
        ],
        Role::Donor => vec![
            ViewOwnData, VoteOnProposals, CreateProposals
        ],
        Role::University => vec![
            VerifyStudents, IssueCredentials, ViewOwnData
        ],
        Role::CommunityValidator => vec![
            ValidateCredit, VoteOnProposals, ViewOwnData
        ],
        Role::TeamMember => vec![
            ViewAllData, ManageUsers, AccessAuditLogs, 
            CreateProposals, VoteOnProposals
        ],
        Role::Admin => vec![
            ManageUsers, ViewAllData, ManageSystem, 
            AccessAuditLogs, CreateProposals, VoteOnProposals
        ],
        Role::SystemAdmin => vec![
            CreateProfile, UpdateProfile, SubmitLoanApplication, MakePayment, ViewOwnData,
            VoteOnProposals, CreateProposals, ValidateCredit, VerifyStudents, IssueCredentials,
            ManageUsers, ViewAllData, ManageSystem, AccessAuditLogs, ManageCanisters, SystemMaintenance
        ],
    }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/// Get user sessions
#[query]
#[candid_method(query)]
fn get_user_sessions(user_principal: Principal) -> Vec<UserSession> {
    let caller = caller();

    // Users can only see their own sessions, admins can see any
    if caller != user_principal {
        let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));
        if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
            return vec![];
        }
    }

    with_storage(|storage| storage.get_user_sessions(&user_principal))
}

/// Get current caller's sessions
#[query]
#[candid_method(query)]
fn get_my_sessions() -> Vec<UserSession> {
    let caller = caller();
    with_storage(|storage| storage.get_user_sessions(&caller))
}

/// Get session statistics (admin only)
#[query]
#[candid_method(query)]
fn get_session_stats() -> StudiFiResult<SessionStats> {
    let caller = caller();
    let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));

    if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
        return Err(StudiFiError::Unauthorized("Admin role required".to_string()));
    }

    Ok(with_storage(|storage| storage.calculate_session_stats()))
}

/// Get audit events for user (admin or own events)
#[query]
#[candid_method(query)]
fn get_audit_events(user_principal: Principal, limit: Option<u32>) -> StudiFiResult<Vec<AuthAuditEvent>> {
    let caller = caller();

    // Users can only see their own audit events, admins can see any
    if caller != user_principal {
        let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));
        if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
            return Err(StudiFiError::Unauthorized("Cannot view other user's audit events".to_string()));
        }
    }

    let events = with_storage(|storage| storage.get_user_audit_events(&user_principal));
    let limit = limit.unwrap_or(100) as usize;

    Ok(events.into_iter().take(limit).collect())
}

/// Get platform statistics
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    let stats = with_storage(|storage| storage.calculate_session_stats());

    Statistics {
        total_count: stats.total_sessions,
        active_count: stats.active_sessions,
        completed_count: stats.expired_sessions,
        failed_count: 0,
        total_amount: 0,
        average_amount: 0,
    }
}

// ============================================================================
// MAINTENANCE FUNCTIONS
// ============================================================================

/// Manually clean up expired sessions (admin only)
#[update]
#[candid_method(update)]
async fn cleanup_expired_sessions() -> StudiFiResult<u32> {
    let caller = caller();
    let caller_roles = with_storage(|storage| storage.get_user_roles(&caller));

    if !caller_roles.contains(&Role::Admin) && !caller_roles.contains(&Role::SystemAdmin) {
        return Err(StudiFiError::Unauthorized("Admin role required".to_string()));
    }

    let cleaned = with_storage_mut(|storage| storage.cleanup_expired_sessions());

    ic_cdk::println!("Manually cleaned up {} expired sessions", cleaned);
    Ok(cleaned)
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
