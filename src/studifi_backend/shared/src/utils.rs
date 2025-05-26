use crate::types::*;
use ic_cdk::api::time;
use candid::Principal;

/// Get current timestamp in nanoseconds
pub fn current_time() -> Timestamp {
    time()
}

/// Convert nanoseconds to seconds
pub fn nanos_to_seconds(nanos: Timestamp) -> u64 {
    nanos / 1_000_000_000
}

/// Convert seconds to nanoseconds
pub fn seconds_to_nanos(seconds: u64) -> Timestamp {
    seconds * 1_000_000_000
}

/// Convert days to nanoseconds
pub fn days_to_nanos(days: u64) -> Timestamp {
    days * 24 * 60 * 60 * 1_000_000_000
}

/// Convert months to nanoseconds (approximate, 30 days per month)
pub fn months_to_nanos(months: u32) -> Timestamp {
    months as u64 * 30 * 24 * 60 * 60 * 1_000_000_000
}

/// Generate a unique ID with prefix and counter
pub fn generate_id(prefix: &str, counter: u64) -> String {
    format!("{}-{:08}", prefix, counter)
}

/// Validate email format (basic validation)
pub fn validate_email(email: &str) -> StudiFiResult<()> {
    if email.contains('@') && email.contains('.') && email.len() > 5 {
        Ok(())
    } else {
        Err(StudiFiError::InvalidInput("Invalid email format".to_string()))
    }
}

/// Validate GPA (0.0 to 4.0)
pub fn validate_gpa(gpa: f64) -> StudiFiResult<()> {
    if gpa >= 0.0 && gpa <= 4.0 {
        Ok(())
    } else {
        Err(StudiFiError::InvalidInput("GPA must be between 0.0 and 4.0".to_string()))
    }
}

/// Validate amount (positive, non-zero)
pub fn validate_amount(amount: Amount) -> StudiFiResult<()> {
    if amount > 0 {
        Ok(())
    } else {
        Err(StudiFiError::InvalidInput("Amount must be positive".to_string()))
    }
}

/// Validate percentage (0.0 to 1.0)
pub fn validate_percentage(percentage: Percentage) -> StudiFiResult<()> {
    if percentage >= 0.0 && percentage <= 1.0 {
        Ok(())
    } else {
        Err(StudiFiError::InvalidInput("Percentage must be between 0.0 and 1.0".to_string()))
    }
}

/// Calculate compound interest
pub fn calculate_compound_interest(
    principal: Amount,
    annual_rate: Percentage,
    periods_per_year: u32,
    years: f64,
) -> Amount {
    let rate_per_period = annual_rate / periods_per_year as f64;
    let total_periods = periods_per_year as f64 * years;
    let compound_factor = (1.0 + rate_per_period).powf(total_periods);
    (principal as f64 * compound_factor) as Amount
}

/// Calculate monthly payment for a loan
pub fn calculate_monthly_payment(
    principal: Amount,
    annual_rate: Percentage,
    term_months: u32,
) -> Amount {
    if annual_rate == 0.0 {
        return principal / term_months as u64;
    }
    
    let monthly_rate = annual_rate / 12.0;
    let num_payments = term_months as f64;
    let factor = (1.0 + monthly_rate).powf(num_payments);
    let payment = (principal as f64 * monthly_rate * factor) / (factor - 1.0);
    payment as Amount
}

/// Calculate remaining balance after payments
pub fn calculate_remaining_balance(
    original_principal: Amount,
    monthly_payment: Amount,
    annual_rate: Percentage,
    payments_made: u32,
) -> Amount {
    if annual_rate == 0.0 {
        return original_principal.saturating_sub(monthly_payment * payments_made as u64);
    }
    
    let monthly_rate = annual_rate / 12.0;
    let factor = (1.0 + monthly_rate).powf(payments_made as f64);
    let remaining = original_principal as f64 * factor - 
                   monthly_payment as f64 * ((factor - 1.0) / monthly_rate);
    remaining.max(0.0) as Amount
}

/// Format amount as currency string
pub fn format_currency(amount: Amount) -> String {
    format!("${:.2}", amount as f64 / 100.0)
}

/// Parse currency string to amount
pub fn parse_currency(currency_str: &str) -> StudiFiResult<Amount> {
    let cleaned = currency_str.trim_start_matches('$').replace(',', "");
    match cleaned.parse::<f64>() {
        Ok(value) => Ok((value * 100.0) as Amount),
        Err(_) => Err(StudiFiError::InvalidInput("Invalid currency format".to_string())),
    }
}

/// Check if caller is authorized (basic implementation)
pub fn check_authorization(caller: Principal, authorized_principals: &[Principal]) -> StudiFiResult<()> {
    if authorized_principals.contains(&caller) {
        Ok(())
    } else {
        Err(StudiFiError::Unauthorized("Caller not authorized".to_string()))
    }
}

/// Sanitize text input
pub fn sanitize_text(input: &str) -> String {
    input
        .trim()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace() || ".,!?-_@".contains(*c))
        .collect::<String>()
        .chars()
        .take(1000) // Limit length
        .collect()
}

/// Calculate age from timestamp
pub fn calculate_age_days(created_at: Timestamp) -> u64 {
    let now = current_time();
    if now > created_at {
        (now - created_at) / (24 * 60 * 60 * 1_000_000_000)
    } else {
        0
    }
}

/// Check if timestamp is expired
pub fn is_expired(timestamp: Timestamp, duration_nanos: Timestamp) -> bool {
    current_time() > timestamp + duration_nanos
}

/// Paginate a vector
pub fn paginate<T: Clone>(
    items: &[T],
    params: &PaginationParams,
) -> PaginatedResponse<T> {
    let total_count = items.len() as u32;
    let start = params.offset as usize;
    let end = std::cmp::min(start + params.limit as usize, items.len());
    
    let paginated_items = if start < items.len() {
        items[start..end].to_vec()
    } else {
        Vec::new()
    };
    
    PaginatedResponse::new(paginated_items, total_count, params.offset, params.limit)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email() {
        assert!(validate_email("test@example.com").is_ok());
        assert!(validate_email("invalid").is_err());
    }

    #[test]
    fn test_calculate_monthly_payment() {
        let payment = calculate_monthly_payment(100000, 0.05, 12);
        assert!(payment > 0);
    }

    #[test]
    fn test_format_currency() {
        assert_eq!(format_currency(12345), "$123.45");
    }
}
