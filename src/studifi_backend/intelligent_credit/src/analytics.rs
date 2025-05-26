use crate::types::*;
use crate::storage::CreditStorage;
use shared::*;

pub struct AnalyticsEngine;

impl AnalyticsEngine {
    pub fn calculate_application_stats(storage: &CreditStorage) -> ApplicationStats {
        let all_applications = storage.get_all_applications();
        
        let total_applications = all_applications.len() as u32;
        let approved_applications = all_applications.iter()
            .filter(|app| app.status == ApplicationStatus::Approved)
            .count() as u32;
        let rejected_applications = all_applications.iter()
            .filter(|app| app.status == ApplicationStatus::Rejected)
            .count() as u32;
        let pending_applications = all_applications.iter()
            .filter(|app| matches!(app.status, ApplicationStatus::Submitted | ApplicationStatus::UnderReview))
            .count() as u32;

        let credit_scores: Vec<u32> = all_applications.iter()
            .filter_map(|app| app.credit_score.as_ref().map(|cs| cs.score))
            .collect();
        let average_credit_score = if !credit_scores.is_empty() {
            credit_scores.iter().sum::<u32>() as f64 / credit_scores.len() as f64
        } else {
            0.0
        };

        let approved_amounts: Vec<Amount> = all_applications.iter()
            .filter(|app| app.status == ApplicationStatus::Approved)
            .filter_map(|app| app.loan_terms.as_ref().map(|terms| terms.approved_amount))
            .collect();
        let average_approved_amount = if !approved_amounts.is_empty() {
            approved_amounts.iter().sum::<Amount>() / approved_amounts.len() as u64
        } else {
            0
        };

        let processing_times: Vec<f64> = all_applications.iter()
            .filter_map(|app| {
                app.processed_at.map(|processed| {
                    (processed - app.created_at) as f64 / (60.0 * 60.0 * 1_000_000_000.0) // Convert to hours
                })
            })
            .collect();
        let average_processing_time_hours = if !processing_times.is_empty() {
            processing_times.iter().sum::<f64>() / processing_times.len() as f64
        } else {
            0.0
        };

        let approval_rate = if total_applications > 0 {
            approved_applications as f64 / total_applications as f64
        } else {
            0.0
        };

        ApplicationStats {
            total_applications,
            approved_applications,
            rejected_applications,
            pending_applications,
            average_credit_score,
            average_approved_amount,
            average_processing_time_hours,
            approval_rate,
        }
    }
}
