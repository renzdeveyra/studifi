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
const LOANS_MEMORY_ID: u64 = 0;
const PAYMENTS_MEMORY_ID: u64 = 1;
const TREASURY_CONFIG_MEMORY_ID: u64 = 2;
const COUNTERS_MEMORY_ID: u64 = 3;

// Implement Storable for Loan
impl Storable for Loan {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for Payment
impl Storable for Payment {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for TreasuryConfig
impl Storable for TreasuryConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Counter structure for ID generation
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct Counters {
    pub loan_counter: u64,
    pub payment_counter: u64,
}

impl Default for Counters {
    fn default() -> Self {
        Self {
            loan_counter: 1,
            payment_counter: 1,
        }
    }
}

impl Storable for Counters {
    const BOUND: Bound = Bound::Bounded {
        max_size: 100,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Storage structure
pub struct FinanceStorage {
    pub loans: StableBTreeMap<String, Loan, Memory>,
    pub payments: StableBTreeMap<String, Payment, Memory>,
    pub treasury_config: StableBTreeMap<String, TreasuryConfig, Memory>,
    pub counters: StableBTreeMap<String, Counters, Memory>,
}

impl FinanceStorage {
    pub fn new() -> Self {
        Self {
            loans: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), LOANS_MEMORY_ID..LOANS_MEMORY_ID + 1)
            ),
            payments: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), PAYMENTS_MEMORY_ID..PAYMENTS_MEMORY_ID + 1)
            ),
            treasury_config: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), TREASURY_CONFIG_MEMORY_ID..TREASURY_CONFIG_MEMORY_ID + 1)
            ),
            counters: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), COUNTERS_MEMORY_ID..COUNTERS_MEMORY_ID + 1)
            ),
        }
    }

    // Loan operations
    pub fn get_loan(&self, id: &str) -> Option<Loan> {
        self.loans.get(&id.to_string())
    }

    pub fn insert_loan(&mut self, id: String, loan: Loan) {
        self.loans.insert(id, loan);
    }

    pub fn update_loan(&mut self, id: String, loan: Loan) -> StudiFiResult<Loan> {
        match self.loans.get(&id) {
            Some(_) => {
                self.loans.insert(id, loan.clone());
                Ok(loan)
            }
            None => Err(StudiFiError::NotFound("Loan not found".to_string())),
        }
    }

    pub fn get_loans_by_student(&self, student_id: &Principal) -> Vec<Loan> {
        self.loans
            .iter()
            .filter_map(|(_, loan)| {
                if loan.student_id == *student_id {
                    Some(loan)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_all_loans(&self) -> Vec<Loan> {
        self.loans.iter().map(|(_, loan)| loan).collect()
    }

    pub fn get_active_loans(&self) -> Vec<Loan> {
        self.loans
            .iter()
            .filter_map(|(_, loan)| {
                if loan.status == LoanStatus::Active || loan.status == LoanStatus::Late {
                    Some(loan)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_overdue_loans(&self) -> Vec<Loan> {
        self.loans
            .iter()
            .filter_map(|(_, loan)| {
                if loan.is_overdue() {
                    Some(loan)
                } else {
                    None
                }
            })
            .collect()
    }

    // Payment operations
    pub fn get_payment(&self, id: &str) -> Option<Payment> {
        self.payments.get(&id.to_string())
    }

    pub fn insert_payment(&mut self, id: String, payment: Payment) {
        self.payments.insert(id, payment);
    }

    pub fn update_payment(&mut self, id: String, payment: Payment) -> StudiFiResult<Payment> {
        match self.payments.get(&id) {
            Some(_) => {
                self.payments.insert(id, payment.clone());
                Ok(payment)
            }
            None => Err(StudiFiError::NotFound("Payment not found".to_string())),
        }
    }

    pub fn get_payments_by_loan(&self, loan_id: &str) -> Vec<Payment> {
        self.payments
            .iter()
            .filter_map(|(_, payment)| {
                if payment.loan_id == loan_id {
                    Some(payment)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_payments_by_student(&self, student_id: &Principal) -> Vec<Payment> {
        self.payments
            .iter()
            .filter_map(|(_, payment)| {
                if payment.student_id == *student_id {
                    Some(payment)
                } else {
                    None
                }
            })
            .collect()
    }

    // Treasury operations
    pub fn get_treasury_config(&self) -> TreasuryConfig {
        self.treasury_config
            .get(&"default".to_string())
            .unwrap_or_else(TreasuryConfig::default)
    }

    pub fn set_treasury_config(&mut self, config: TreasuryConfig) {
        self.treasury_config.insert("default".to_string(), config);
    }

    // Counter operations
    pub fn get_next_loan_id(&mut self) -> String {
        let mut counters = self.counters
            .get(&"default".to_string())
            .unwrap_or_else(Counters::default);
        
        let id = generate_id(LOAN_PREFIX, counters.loan_counter);
        counters.loan_counter += 1;
        self.counters.insert("default".to_string(), counters);
        id
    }

    pub fn get_next_payment_id(&mut self) -> String {
        let mut counters = self.counters
            .get(&"default".to_string())
            .unwrap_or_else(Counters::default);
        
        let id = generate_id(PAYMENT_PREFIX, counters.payment_counter);
        counters.payment_counter += 1;
        self.counters.insert("default".to_string(), counters);
        id
    }

    // Statistics
    pub fn calculate_treasury_stats(&self) -> TreasuryStats {
        let all_loans = self.get_all_loans();
        let all_payments: Vec<Payment> = self.payments.iter().map(|(_, payment)| payment).collect();

        let total_loans_outstanding = all_loans
            .iter()
            .filter(|loan| loan.status == LoanStatus::Active || loan.status == LoanStatus::Late)
            .map(|loan| loan.current_balance)
            .sum();

        let total_loans_disbursed = all_loans
            .iter()
            .map(|loan| loan.original_amount)
            .sum();

        let total_payments_received = all_payments
            .iter()
            .filter(|payment| payment.status == PaymentStatus::Completed)
            .map(|payment| payment.amount)
            .sum();

        let total_interest_earned = all_payments
            .iter()
            .filter(|payment| payment.status == PaymentStatus::Completed)
            .map(|payment| payment.interest_portion)
            .sum();

        let total_defaults = all_loans
            .iter()
            .filter(|loan| loan.status == LoanStatus::Default)
            .map(|loan| loan.current_balance)
            .sum();

        let active_loan_count = all_loans
            .iter()
            .filter(|loan| loan.status == LoanStatus::Active || loan.status == LoanStatus::Late)
            .count() as u32;

        let default_rate = if !all_loans.is_empty() {
            all_loans.iter().filter(|loan| loan.status == LoanStatus::Default).count() as f64 
                / all_loans.len() as f64
        } else {
            0.0
        };

        let average_loan_size = if !all_loans.is_empty() {
            total_loans_disbursed / all_loans.len() as u64
        } else {
            0
        };

        let portfolio_yield = if total_loans_outstanding > 0 {
            total_interest_earned as f64 / total_loans_outstanding as f64
        } else {
            0.0
        };

        TreasuryStats {
            total_loans_outstanding,
            total_loans_disbursed,
            total_payments_received,
            total_interest_earned,
            total_defaults,
            active_loan_count,
            default_rate,
            average_loan_size,
            portfolio_yield,
        }
    }
}

// Thread-local storage
thread_local! {
    static STORAGE: RefCell<FinanceStorage> = RefCell::new(FinanceStorage::new());
}

// Storage access functions
pub fn with_storage<R>(f: impl FnOnce(&FinanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut FinanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
