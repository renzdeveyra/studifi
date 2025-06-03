use candid::Principal;
use ic_stable_structures::{
    DefaultMemoryImpl, RestrictedMemory, StableBTreeMap, Storable,
    storable::Bound,
};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::*;
use shared::*;

// Memory management for stable storage
type Memory = RestrictedMemory<DefaultMemoryImpl>;

// Define memory IDs for different data structures
const STUDENT_PROFILES_MEMORY_ID: u64 = 0;
const VERIFICATION_REQUESTS_MEMORY_ID: u64 = 1;
const UNIVERSITY_CONFIGS_MEMORY_ID: u64 = 2;

// Implement Storable for StudentProfile
impl Storable for StudentProfile {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for VerificationRequest
impl Storable for VerificationRequest {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for UniversityApiConfig
impl Storable for UniversityApiConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Storage structure
pub struct IdentityStorage {
    pub student_profiles: StableBTreeMap<Principal, StudentProfile, Memory>,
    pub verification_requests: StableBTreeMap<String, VerificationRequest, Memory>,
    pub university_configs: StableBTreeMap<String, UniversityApiConfig, Memory>,
}

impl IdentityStorage {
    pub fn new() -> Self {
        Self {
            student_profiles: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), STUDENT_PROFILES_MEMORY_ID..STUDENT_PROFILES_MEMORY_ID + 1)
            ),
            verification_requests: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), VERIFICATION_REQUESTS_MEMORY_ID..VERIFICATION_REQUESTS_MEMORY_ID + 1)
            ),
            university_configs: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), UNIVERSITY_CONFIGS_MEMORY_ID..UNIVERSITY_CONFIGS_MEMORY_ID + 1)
            ),
        }
    }

    // Student profile operations
    pub fn get_student_profile(&self, id: &Principal) -> Option<StudentProfile> {
        self.student_profiles.get(id)
    }

    pub fn insert_student_profile(&mut self, id: Principal, profile: StudentProfile) -> Option<StudentProfile> {
        self.student_profiles.insert(id, profile)
    }

    pub fn update_student_profile(&mut self, id: Principal, mut profile: StudentProfile) -> StudiFiResult<StudentProfile> {
        profile.set_updated_at(current_time());
        match self.student_profiles.insert(id, profile.clone()) {
            Some(_) => Ok(profile),
            None => Err(StudiFiError::NotFound("Student profile not found".to_string())),
        }
    }

    pub fn remove_student_profile(&mut self, id: &Principal) -> Option<StudentProfile> {
        self.student_profiles.remove(id)
    }

    pub fn get_all_student_profiles(&self) -> Vec<(Principal, StudentProfile)> {
        self.student_profiles.iter().collect()
    }

    pub fn get_verified_students(&self) -> Vec<StudentProfile> {
        self.student_profiles
            .iter()
            .filter_map(|(_, profile)| {
                if profile.is_verified {
                    Some(profile)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn search_students(&self, filters: &StudentSearchFilters) -> Vec<StudentProfile> {
        self.student_profiles
            .iter()
            .filter_map(|(_, profile)| {
                if self.matches_filters(&profile, filters) {
                    Some(profile)
                } else {
                    None
                }
            })
            .collect()
    }

    fn matches_filters(&self, profile: &StudentProfile, filters: &StudentSearchFilters) -> bool {
        if let Some(ref university) = filters.university {
            if !profile.university.to_lowercase().contains(&university.to_lowercase()) {
                return false;
            }
        }

        if let Some(ref program) = filters.program {
            if !profile.program.to_lowercase().contains(&program.to_lowercase()) {
                return false;
            }
        }

        if let Some(year) = filters.year_of_study {
            if profile.year_of_study != year {
                return false;
            }
        }

        if let Some(ref status) = filters.kyc_status {
            if profile.kyc_status != *status {
                return false;
            }
        }

        if let Some(verified) = filters.is_verified {
            if profile.is_verified != verified {
                return false;
            }
        }

        if let Some(min_gpa) = filters.min_gpa {
            if profile.gpa < min_gpa {
                return false;
            }
        }

        if let Some(max_gpa) = filters.max_gpa {
            if profile.gpa > max_gpa {
                return false;
            }
        }

        true
    }

    // Verification request operations
    pub fn get_verification_request(&self, id: &str) -> Option<VerificationRequest> {
        self.verification_requests.get(&id.to_string())
    }

    pub fn insert_verification_request(&mut self, id: String, request: VerificationRequest) -> Option<VerificationRequest> {
        self.verification_requests.insert(id, request)
    }

    pub fn remove_verification_request(&mut self, id: &str) -> Option<VerificationRequest> {
        self.verification_requests.remove(&id.to_string())
    }

    pub fn get_all_verification_requests(&self) -> Vec<(String, VerificationRequest)> {
        self.verification_requests.iter().collect()
    }

    // University configuration operations
    pub fn get_university_config(&self, university: &str) -> Option<UniversityApiConfig> {
        self.university_configs.get(&university.to_string())
    }

    pub fn insert_university_config(&mut self, university: String, config: UniversityApiConfig) -> Option<UniversityApiConfig> {
        self.university_configs.insert(university, config)
    }

    pub fn remove_university_config(&mut self, university: &str) -> Option<UniversityApiConfig> {
        self.university_configs.remove(&university.to_string())
    }

    pub fn get_all_university_configs(&self) -> Vec<(String, UniversityApiConfig)> {
        self.university_configs.iter().collect()
    }

    // Statistics
    pub fn get_verification_stats(&self) -> VerificationStats {
        let all_profiles: Vec<StudentProfile> = self.student_profiles.iter().map(|(_, profile)| profile).collect();

        let total_students = all_profiles.len() as u32;
        let verified_students = all_profiles.iter().filter(|p| p.is_verified).count() as u32;
        let pending_verifications = all_profiles.iter().filter(|p| p.kyc_status == KycStatus::Pending).count() as u32;
        let rejected_verifications = all_profiles.iter().filter(|p| p.kyc_status == KycStatus::Rejected).count() as u32;
        let expired_verifications = all_profiles.iter().filter(|p| p.kyc_status == KycStatus::Expired).count() as u32;

        // Calculate average verification time (simplified)
        let verified_profiles: Vec<&StudentProfile> = all_profiles.iter().filter(|p| p.is_verified).collect();
        let average_verification_time_hours = if !verified_profiles.is_empty() {
            let total_time: u64 = verified_profiles
                .iter()
                .map(|p| p.updated_at - p.created_at)
                .sum();
            let average_nanos = total_time / verified_profiles.len() as u64;
            (average_nanos as f64) / (60.0 * 60.0 * 1_000_000_000.0) // Convert to hours
        } else {
            0.0
        };

        VerificationStats {
            total_students,
            verified_students,
            pending_verifications,
            rejected_verifications,
            expired_verifications,
            average_verification_time_hours,
        }
    }

    // Utility methods
    pub fn count_students(&self) -> u64 {
        self.student_profiles.len()
    }

    pub fn count_verification_requests(&self) -> u64 {
        self.verification_requests.len()
    }

    pub fn count_university_configs(&self) -> u64 {
        self.university_configs.len()
    }
}

// Thread-local storage
thread_local! {
    static STORAGE: RefCell<IdentityStorage> = RefCell::new(IdentityStorage::new());
}

// Storage access functions
pub fn with_storage<R>(f: impl FnOnce(&IdentityStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut IdentityStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
