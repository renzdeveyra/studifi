use candid::Principal;
use ic_stable_structures::{DefaultMemoryImpl, RestrictedMemory, StableBTreeMap, Storable, storable::Bound};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::*;
use shared::*;

type Memory = RestrictedMemory<DefaultMemoryImpl>;

const APPLICATIONS_MEMORY_ID: u64 = 0;
const CREDIT_SCORES_MEMORY_ID: u64 = 1;
const CONFIG_MEMORY_ID: u64 = 2;

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

pub struct CreditStorage {
    pub applications: StableBTreeMap<String, LoanApplication, Memory>,
    pub credit_scores: StableBTreeMap<Principal, CreditScore, Memory>,
    pub scoring_config: StableBTreeMap<String, ScoringConfig, Memory>,
    pub next_application_id: u64,
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
            next_application_id: 1,
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
