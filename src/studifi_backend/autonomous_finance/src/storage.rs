use candid::Principal;
use ic_stable_structures::{
    storable::Bound, DefaultMemoryImpl, RestrictedMemory, StableBTreeMap, Storable,
};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::*;
use shared::*;

// TODO:
// - Implementation with the canisters proper, as well as the others, needed, bootstrap the shit
// requirements

type Memory = RestrictedMemory<DefaultMemoryImpl>;

const LOANS_MEMORY_ID: u64 = 0;
const PAYMENTS_MEMORY_ID: u64 = 1;
const TREASURY_CONFIG_MEMORY_ID: u64 = 2;
const COUNTERS_MEMORY_ID: u64 = 3;

impl Storable for Loan {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for Payment {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl Storable for TreasuryConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

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
            .filter_map(
                |(_, loan)| {
                    if loan.is_overdue() {
                        Some(loan)
                    } else {
                        None
                    }
                },
            )
            .collect()
    }

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

    pub fn get_overdue_loans(&self) -> Vec<Loan> {
        self.loans
            .iter()
            .filter_map(
                |(_, loan)| {
                    if loan.is_overdue() {
                        Some(loan)
                    } else {
                        None
                    }
                },
            )
            .collect()
    }

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
        let all_payments: Vec<Payment> = self.payments.iter().map(|(_, payment)| payment).collect();

        let total_loans_outstanding = all_loans
            .iter()
            .filter(|loan| loan.status == LoanStatus::Active || loan.status == LoanStatus::Late)
            .map(|loan| loan.current_balance)
            .sum();

        let total_loans_disbursed = all_loans.iter().map(|loan| loan.original_amount).sum();

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
            all_loans
                .iter()
                .filter(|loan| loan.status == LoanStatus::Default)
                .count() as f64
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

thread_local! {
    static STORAGE: RefCell<FinanceStorage> = RefCell::new(FinanceStorage::new());
}

pub fn with_storage<R>(f: impl FnOnce(&FinanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut FinanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
