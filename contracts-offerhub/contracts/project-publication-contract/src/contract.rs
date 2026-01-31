use crate::error::Error;
use crate::event::{admin_initialized, project_recorded};
use crate::storage::{
    get_admin, get_project_record_storage, has_project_record, is_initialized, set_admin,
    set_project_record,
};
use crate::types::ProjectRecord;
use crate::validation::validate_project_record;
use soroban_sdk::{Address, Env, String};

pub struct ProjectPublicationContract;

impl ProjectPublicationContract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if already initialized
        if is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }

        // Require authentication from admin
        admin.require_auth();

        // Set admin and mark as initialized
        set_admin(&env, &admin);

        // Emit event
        admin_initialized(&env, admin.clone());

        Ok(())
    }

    /// Record a project publication
    /// This function records immutable proof of when a project was published and by whom
    pub fn record_project(
        env: Env,
        caller: Address,
        client_id: Address,
        project_id: String,
        timestamp: u64,
    ) -> Result<(), Error> {
        // Require authentication
        caller.require_auth();

        // Check if contract is initialized
        if !is_initialized(&env) {
            return Err(Error::NotInitialized);
        }

        // Check if caller is admin
        let admin = get_admin(&env).ok_or(Error::NotInitialized)?;
        if caller != admin {
            return Err(Error::Unauthorized);
        }

        // Validate inputs
        validate_project_record(&env, &client_id, &project_id, timestamp)?;

        // Check if project already recorded
        if has_project_record(&env, &project_id) {
            return Err(Error::ProjectAlreadyRecorded);
        }

        // Get current ledger timestamp
        let recorded_at = env.ledger().timestamp();

        // Create project record
        let record = ProjectRecord {
            client_id: client_id.clone(),
            project_id: project_id.clone(),
            timestamp,
            recorded_at,
        };

        // Store the record
        set_project_record(&env, &project_id, &record);

        // Emit event
        project_recorded(&env, client_id, project_id, timestamp);

        Ok(())
    }

    /// Get project record by project_id
    pub fn get_project_record(env: Env, project_id: String) -> Option<ProjectRecord> {
        get_project_record_storage(&env, &project_id)
    }
}
