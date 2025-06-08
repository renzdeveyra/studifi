use candid::Principal;
use ic_stable_structures::{DefaultMemoryImpl, RestrictedMemory, StableBTreeMap, Storable, storable::Bound};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::*;
use crate::community_validation::*;
use shared::current_time;

type Memory = RestrictedMemory<DefaultMemoryImpl>;

const APPLICATIONS_MEMORY_ID: u64 = 0;
const CREDIT_SCORES_MEMORY_ID: u64 = 1;
const CONFIG_MEMORY_ID: u64 = 2;
const VALIDATION_REQUESTS_MEMORY_ID: u64 = 3;
const HYBRID_SCORES_MEMORY_ID: u64 = 4;
const VALIDATOR_REPUTATION_MEMORY_ID: u64 = 5;

impl Storable for LoanApplication {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for CreditScore {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for ScoringConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for CommunityValidationRequest {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for HybridCreditScore {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for ValidatorReputation {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

pub struct CreditStorage {
    pub applications: StableBTreeMap<String, LoanApplication, Memory>,
    pub credit_scores: StableBTreeMap<Principal, CreditScore, Memory>,
    pub scoring_config: StableBTreeMap<String, ScoringConfig, Memory>,
    pub validation_requests: StableBTreeMap<String, CommunityValidationRequest, Memory>,
    pub hybrid_scores: StableBTreeMap<Principal, HybridCreditScore, Memory>,
    pub validator_reputation: StableBTreeMap<Principal, ValidatorReputation, Memory>,
    pub next_application_id: u64,
    pub next_validation_id: u64,
}

impl CreditStorage {
    pub fn new() -> Self {
        Self {
            applications: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), APPLICATIONS_MEMORY_ID..APPLICATIONS_MEMORY_ID + 1)
            ),
            credit_scores: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), CREDIT_SCORES_MEMORY_ID..CREDIT_SCORES_MEMORY_ID + 1)
            ),
            scoring_config: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), CONFIG_MEMORY_ID..CONFIG_MEMORY_ID + 1)
            ),
            validation_requests: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), VALIDATION_REQUESTS_MEMORY_ID..VALIDATION_REQUESTS_MEMORY_ID + 1)
            ),
            hybrid_scores: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), HYBRID_SCORES_MEMORY_ID..HYBRID_SCORES_MEMORY_ID + 1)
            ),
            validator_reputation: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), VALIDATOR_REPUTATION_MEMORY_ID..VALIDATOR_REPUTATION_MEMORY_ID + 1)
            ),
            next_application_id: 1,
            next_validation_id: 1,
        }
    }

    pub fn get_application(&self, id: &str) -> Option<LoanApplication> {
        self.applications.get(&id.to_string())
    }

    pub fn insert_application(&mut self, id: String, application: LoanApplication) {
        self.applications.insert(id, application);
    }

    pub fn update_application(&mut self, id: String, application: LoanApplication) {
        self.applications.insert(id, application);
    }

    pub fn get_student_applications(&self, student_id: &Principal) -> Vec<LoanApplication> {
        self.applications
            .iter()
            .filter_map(|(_, app)| {
                if app.student_id == *student_id {
                    Some(app)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_all_applications(&self) -> Vec<LoanApplication> {
        self.applications.iter().map(|(_, app)| app).collect()
    }

    pub fn search_applications(&self, filters: &ApplicationFilters) -> Vec<LoanApplication> {
        self.applications
            .iter()
            .filter_map(|(_, app)| {
                if self.matches_filters(&app, filters) {
                    Some(app)
                } else {
                    None
                }
            })
            .collect()
    }

    fn matches_filters(&self, app: &LoanApplication, filters: &ApplicationFilters) -> bool {
        if let Some(ref status) = filters.status {
            if app.status != *status {
                return false;
            }
        }

        if let Some(min_amount) = filters.min_amount {
            if app.requested_amount < min_amount {
                return false;
            }
        }

        if let Some(max_amount) = filters.max_amount {
            if app.requested_amount > max_amount {
                return false;
            }
        }

        if let Some(ref university) = filters.university {
            if !app.academic_info.university.to_lowercase().contains(&university.to_lowercase()) {
                return false;
            }
        }

        if let Some(ref program) = filters.program {
            if !app.academic_info.program.to_lowercase().contains(&program.to_lowercase()) {
                return false;
            }
        }

        if let Some(ref risk_level) = filters.risk_level {
            if let Some(ref credit_score) = app.credit_score {
                if credit_score.risk_level != *risk_level {
                    return false;
                }
            } else {
                return false;
            }
        }

        true
    }

    pub fn get_credit_score(&self, student_id: &Principal) -> Option<CreditScore> {
        self.credit_scores.get(student_id)
    }

    pub fn insert_credit_score(&mut self, student_id: Principal, score: CreditScore) {
        self.credit_scores.insert(student_id, score);
    }

    pub fn get_scoring_config(&self) -> ScoringConfig {
        self.scoring_config
            .get(&"default".to_string())
            .unwrap_or_else(ScoringConfig::default)
    }

    pub fn set_scoring_config(&mut self, config: ScoringConfig) {
        self.scoring_config.insert("default".to_string(), config);
    }

    pub fn get_next_application_id(&self) -> u64 {
        self.next_application_id
    }

    pub fn increment_application_id(&mut self) {
        self.next_application_id += 1;
    }

    // Community validation methods
    pub fn get_validation_request(&self, id: &str) -> Option<CommunityValidationRequest> {
        self.validation_requests.get(&id.to_string())
    }

    pub fn insert_validation_request(&mut self, id: String, request: CommunityValidationRequest) {
        self.validation_requests.insert(id, request);
    }

    pub fn get_validations_for_student(&self, student_id: &Principal) -> Vec<CommunityValidationRequest> {
        self.validation_requests
            .iter()
            .filter(|(_, request)| request.student_id == *student_id)
            .map(|(_, request)| request)
            .collect()
    }

    pub fn get_active_validations(&self) -> Vec<CommunityValidationRequest> {
        self.validation_requests
            .iter()
            .filter(|(_, request)| request.is_active())
            .map(|(_, request)| request)
            .collect()
    }

    pub fn get_validations_to_process(&self) -> Vec<CommunityValidationRequest> {
        let now = current_time();
        self.validation_requests
            .iter()
            .filter(|(_, request)| {
                request.status == ValidationStatus::Active && now > request.voting_ends_at
            })
            .map(|(_, request)| request)
            .collect()
    }

    pub fn get_next_validation_id(&self) -> u64 {
        self.next_validation_id
    }

    pub fn increment_validation_id(&mut self) {
        self.next_validation_id += 1;
    }

    // Hybrid score methods
    pub fn get_hybrid_score(&self, student_id: &Principal) -> Option<HybridCreditScore> {
        self.hybrid_scores.get(student_id)
    }

    pub fn insert_hybrid_score(&mut self, student_id: Principal, score: HybridCreditScore) {
        self.hybrid_scores.insert(student_id, score);
    }

    // Validator reputation methods
    pub fn get_validator_reputation(&self, validator: &Principal) -> Option<ValidatorReputation> {
        self.validator_reputation.get(validator)
    }

    pub fn insert_validator_reputation(&mut self, validator: Principal, reputation: ValidatorReputation) {
        self.validator_reputation.insert(validator, reputation);
    }

    // Statistics
    pub fn calculate_validation_stats(&self) -> CommunityValidationStats {
        let all_validations: Vec<_> = self.validation_requests.iter().map(|(_, v)| v).collect();
        let total_validations = all_validations.len() as u32;
        let active_validations = all_validations.iter()
            .filter(|v| v.is_active())
            .count() as u32;
        let completed_validations = all_validations.iter()
            .filter(|v| v.status == ValidationStatus::Completed || v.status == ValidationStatus::Applied)
            .count() as u32;

        let total_votes: u64 = all_validations.iter()
            .map(|v| v.votes.len() as u64)
            .sum();

        let unique_validators = self.validator_reputation.len() as u32;

        let average_adjustment = if completed_validations > 0 {
            let total_adjustment: i32 = all_validations.iter()
                .filter_map(|v| v.final_adjustment)
                .sum();
            total_adjustment as f64 / completed_validations as f64
        } else {
            0.0
        };

        let average_consensus_score = if !all_validations.is_empty() {
            let total_consensus: f64 = all_validations.iter()
                .filter(|v| !v.votes.is_empty())
                .map(|v| {
                    let adjustments: Vec<i32> = v.votes.iter().map(|vote| vote.adjustment_vote).collect();
                    if adjustments.len() > 1 {
                        let mean = adjustments.iter().sum::<i32>() as f64 / adjustments.len() as f64;
                        let variance = adjustments.iter()
                            .map(|&x| (x as f64 - mean).powi(2))
                            .sum::<f64>() / adjustments.len() as f64;
                        1.0 / (1.0 + variance / 100.0)
                    } else {
                        1.0
                    }
                })
                .sum();
            total_consensus / all_validations.len() as f64
        } else {
            0.0
        };

        CommunityValidationStats {
            total_validations,
            active_validations,
            completed_validations,
            average_adjustment,
            total_community_votes: total_votes,
            unique_validators,
            average_consensus_score,
        }
    }
}

thread_local! {
    static STORAGE: RefCell<CreditStorage> = RefCell::new(CreditStorage::new());
}

pub fn with_storage<R>(f: impl FnOnce(&CreditStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut CreditStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
