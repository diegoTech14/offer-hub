use crate::error::Error;
use soroban_sdk::{Address, Env, String};

// Validation constants
const MIN_PROJECT_ID_LENGTH: u32 = 1;
const MAX_PROJECT_ID_LENGTH: u32 = 100;
const MAX_TIMESTAMP_DIFF: u64 = 300; // 5 minutes buffer for clock skew

/// Validate client ID
pub fn validate_client_id(_client_id: &Address) -> Result<(), Error> {
    // Address validation is handled by Soroban SDK
    // Additional checks can be added here if needed
    Ok(())
}

/// Validate project ID format
pub fn validate_project_id(project_id: &String) -> Result<(), Error> {
    let len = project_id.len();
    if len < MIN_PROJECT_ID_LENGTH {
        return Err(Error::InvalidProjectId);
    }
    if len > MAX_PROJECT_ID_LENGTH {
        return Err(Error::InvalidProjectId);
    }
    Ok(())
}

/// Validate timestamp (should not be in the future, allow small buffer for clock skew)
pub fn validate_timestamp(env: &Env, timestamp: u64) -> Result<(), Error> {
    let current_time = env.ledger().timestamp();
    // Allow timestamp to be slightly in the future (clock skew buffer)
    if timestamp > current_time + MAX_TIMESTAMP_DIFF {
        return Err(Error::InvalidTimestamp);
    }
    Ok(())
}

/// Comprehensive validation for project record
pub fn validate_project_record(
    env: &Env,
    client_id: &Address,
    project_id: &String,
    timestamp: u64,
) -> Result<(), Error> {
    validate_client_id(client_id)?;
    validate_project_id(project_id)?;
    validate_timestamp(env, timestamp)?;
    Ok(())
}
