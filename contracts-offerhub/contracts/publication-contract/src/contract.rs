use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

use crate::error::ContractError;
use crate::event;
use crate::storage::{DataKey, PublicationData};
use crate::utils::StorageOptimizer;
use crate::validation::validate_publication;
use crate::types::PublicationState;
// Constants for time validations
const MIN_AGE: u64 = 60; // Minimum age of timestamp (1 minute)
const MAX_AGE: u64 = 604_800; // Maximum age of timestamp (7 days)
const EXPIRATION_PERIOD: u64 = 2_592_000; // Default expiration period (30 days)

#[contract]
pub struct PublicationContract;

#[contractimpl]
impl PublicationContract {
    /// Validates the timestamp against current block time with min/max constraints
    pub fn validate_timestamp(env: &Env, timestamp: u64) -> Result<(), ContractError> {
        let current_time = env.ledger().timestamp();
        if timestamp < current_time && current_time - timestamp < MIN_AGE {
            return Err(ContractError::InvalidTimestamp);
        }
        if current_time - timestamp > MAX_AGE {
            return Err(ContractError::TimestampTooOld);
        }
        Ok(())
    }

    fn check_expiration(env: &Env, publication: &mut PublicationData) {
        let current_time = env.ledger().timestamp();
        if current_time > publication.expiration && publication.state != PublicationState::Expired && publication.state != PublicationState::Completed {
            publication.state = PublicationState::Expired;
        }
    }

    /// Publishes a new service or project on-chain.
    /// This function must be called before the data is stored in any off-chain database.
    pub fn publish_internal(
        env: Env,
        user: Address,
        publication_type: Symbol,
        title: String,
        category: String,
        amount: i128,
        timestamp: u64,
    ) -> Result<u32, ContractError> {
        user.require_auth();

        // Comprehensive input validation
        validate_publication(
            &env,
            &user,
            &publication_type,
            &title,
            &category,
            amount,
            timestamp,
        )?;

        Self::validate_timestamp(&env, timestamp)?;

        // Get the next publication ID for this specific user.
        let user_post_count_key = DataKey::UserPostCount(user.clone());
        let new_id = env
            .storage()
            .instance()
            .get::<_, u32>(&user_post_count_key)
            .unwrap_or(0)
            + 1;

        // Create the publication data struct with optimized storage.
        let compressed_title = StorageOptimizer::compress_string(&env, &title);
        let compressed_category = StorageOptimizer::compress_string(&env, &category);
        let expiration = timestamp + EXPIRATION_PERIOD; // Set expiration timestamp

        let publication_data = PublicationData {
            publication_type: publication_type.clone(),
            title: compressed_title,
            category: compressed_category,
            amount,
            timestamp,
            expiration,
            state: PublicationState::Published, // Initial state
        };

        // Store the publication data on-chain, keyed by user and their unique ID.
        let publication_key = DataKey::Publication(user.clone(), new_id);
        env.storage()
            .instance()
            .set(&publication_key, &publication_data);

        // Update the user's post count.
        env.storage().instance().set(&user_post_count_key, &new_id);

        // Emit an event to notify off-chain services that a new publication has been created.
        event::publication_created(&env, user, new_id, publication_type);
        Ok(new_id)
    }

    /// This is a helper function primarily for verification and testing.
    // Removed duplicate function to avoid compilation error

    /// Retrieves a specific publication for a user and checks expiration
    pub fn get_publication_internal(env: Env, user: Address, id: u32) -> Option<PublicationData> {
        let key = DataKey::Publication(user, id);
        let mut publication: PublicationData = env.storage().instance().get(&key)?;
        Self::check_expiration(&env, &mut publication);
        env.storage().instance().set(&key, &publication); // Update state if changed
        Some(publication)
    }

    /// Public wrapper for publish_internal
    #[allow(dead_code)]
    pub fn publish(
        env: Env,
        user: Address,
        publication_type: Symbol,
        title: String,
        category: String,
        amount: i128,
        timestamp: u64,
    ) -> Result<u32, ContractError> {
        Self::publish_internal(env, user, publication_type, title, category, amount, timestamp)
    }

    /// Public wrapper for get_publication_internal
    #[allow(dead_code)]
    pub fn get_publication(env: Env, user: Address, id: u32) -> Option<PublicationData> {
        Self::get_publication_internal(env, user, id)
    }
}