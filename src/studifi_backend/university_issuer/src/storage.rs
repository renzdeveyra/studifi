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
const STUDENTS_MEMORY_ID: u64 = 0;
const UNIVERSITY_CONFIG_MEMORY_ID: u64 = 1;
const CREDENTIAL_RECORDS_MEMORY_ID: u64 = 2;

// Implement Storable for Student
impl Storable for Student {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for UniversityConfig
impl Storable for UniversityConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Implement Storable for CredentialIssuanceRecord
impl Storable for CredentialIssuanceRecord {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

// Storage structure
pub struct UniversityStorage {
    pub students: StableBTreeMap<String, Student, Memory>,
    pub university_config: StableBTreeMap<String, UniversityConfig, Memory>,
    pub credential_records: StableBTreeMap<String, CredentialIssuanceRecord, Memory>,
}

impl UniversityStorage {
    pub fn new() -> Self {
        Self {
            students: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), STUDENTS_MEMORY_ID..STUDENTS_MEMORY_ID + 1)
            ),
            university_config: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), UNIVERSITY_CONFIG_MEMORY_ID..UNIVERSITY_CONFIG_MEMORY_ID + 1)
            ),
            credential_records: StableBTreeMap::init(
                RestrictedMemory::new(DefaultMemoryImpl::default(), CREDENTIAL_RECORDS_MEMORY_ID..CREDENTIAL_RECORDS_MEMORY_ID + 1)
            ),
        }
    }

    // Student operations
    pub fn get_student(&self, id: &str) -> Option<Student> {
        self.students.get(&id.to_string())
    }

    pub fn add_student(&mut self, id: String, student: Student) -> Option<Student> {
        self.students.insert(id, student)
    }

    pub fn update_student(&mut self, id: String, student: Student) -> Option<Student> {
        self.students.insert(id, student)
    }

    pub fn remove_student(&mut self, id: &str) -> Option<Student> {
        self.students.remove(&id.to_string())
    }

    pub fn get_all_students(&self) -> Vec<(String, Student)> {
        self.students.iter().collect()
    }

    pub fn get_enrolled_students(&self) -> Vec<Student> {
        self.students
            .iter()
            .filter_map(|(_, student)| {
                if student.is_enrolled {
                    Some(student)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn search_students(&self, program: Option<&str>, year: Option<u32>) -> Vec<Student> {
        self.students
            .iter()
            .filter_map(|(_, student)| {
                let mut matches = true;

                if let Some(prog) = program {
                    if !student.program.to_lowercase().contains(&prog.to_lowercase()) {
                        matches = false;
                    }
                }

                if let Some(yr) = year {
                    if student.year_of_study != yr {
                        matches = false;
                    }
                }

                if matches {
                    Some(student)
                } else {
                    None
                }
            })
            .collect()
    }

    // University configuration operations
    pub fn get_university_config(&self) -> Option<UniversityConfig> {
        self.university_config.get(&"default".to_string())
    }

    pub fn set_university_config(&mut self, config: UniversityConfig) -> Option<UniversityConfig> {
        self.university_config.insert("default".to_string(), config)
    }

    // Credential record operations
    pub fn get_credential_record(&self, id: &str) -> Option<CredentialIssuanceRecord> {
        self.credential_records.get(&id.to_string())
    }

    pub fn add_credential_record(&mut self, record: CredentialIssuanceRecord) -> Option<CredentialIssuanceRecord> {
        let id = record.id.clone();
        self.credential_records.insert(id, record)
    }

    pub fn update_credential_record(&mut self, id: String, record: CredentialIssuanceRecord) -> Option<CredentialIssuanceRecord> {
        self.credential_records.insert(id, record)
    }

    pub fn get_student_credentials(&self, student_id: &str) -> Vec<CredentialIssuanceRecord> {
        self.credential_records
            .iter()
            .filter_map(|(_, record)| {
                if record.student_id == student_id {
                    Some(record)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_all_credential_records(&self) -> Vec<(String, CredentialIssuanceRecord)> {
        self.credential_records.iter().collect()
    }

    pub fn get_valid_credentials(&self) -> Vec<CredentialIssuanceRecord> {
        self.credential_records
            .iter()
            .filter_map(|(_, record)| {
                if record.is_valid() {
                    Some(record)
                } else {
                    None
                }
            })
            .collect()
    }

    // Statistics and utility methods
    pub fn count_students(&self) -> u64 {
        self.students.len()
    }

    pub fn count_enrolled_students(&self) -> u64 {
        self.students
            .iter()
            .filter(|(_, student)| student.is_enrolled)
            .count() as u64
    }

    pub fn count_credentials_issued(&self) -> u64 {
        self.credential_records.len()
    }

    pub fn count_valid_credentials(&self) -> u64 {
        self.credential_records
            .iter()
            .filter(|(_, record)| record.is_valid())
            .count() as u64
    }

    pub fn get_programs(&self) -> Vec<String> {
        let mut programs: Vec<String> = self.students
            .iter()
            .map(|(_, student)| student.program.clone())
            .collect();
        programs.sort();
        programs.dedup();
        programs
    }

    // Cleanup operations
    pub fn cleanup_expired_credentials(&mut self) -> u32 {
        let expired_ids: Vec<String> = self.credential_records
            .iter()
            .filter_map(|(id, record)| {
                if record.is_expired() {
                    Some(id)
                } else {
                    None
                }
            })
            .collect();

        let count = expired_ids.len() as u32;
        for id in expired_ids {
            self.credential_records.remove(&id);
        }
        count
    }

    // Validation methods
    pub fn validate_student_enrollment(&self, student_id: &str) -> bool {
        self.get_student(student_id)
            .map(|student| student.is_enrolled)
            .unwrap_or(false)
    }

    pub fn can_issue_credential(&self, student_id: &str, credential_type: &str) -> bool {
        // Check if student exists and is enrolled
        if !self.validate_student_enrollment(student_id) {
            return false;
        }

        // Check if university supports this credential type
        if let Some(config) = self.get_university_config() {
            config.supports_credential(credential_type)
        } else {
            false
        }
    }
}

// Thread-local storage
thread_local! {
    static STORAGE: RefCell<UniversityStorage> = RefCell::new(UniversityStorage::new());
}

// Storage access functions
pub fn with_storage<R>(f: impl FnOnce(&UniversityStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut UniversityStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}
