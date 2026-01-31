#![no_std]

mod contract;
mod error;
mod event;
mod storage;
#[cfg(test)]
mod test;
mod types;
mod validation;

use crate::contract::ProjectPublicationContract;
use crate::error::Error;
use crate::types::ProjectRecord;
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        ProjectPublicationContract::initialize(env, admin)
    }

    /// Record a project publication
    /// Records immutable proof of when a project was published and by whom
    pub fn record_project(
        env: Env,
        caller: Address,
        client_id: Address,
        project_id: String,
        timestamp: u64,
    ) -> Result<(), Error> {
        ProjectPublicationContract::record_project(env, caller, client_id, project_id, timestamp)
    }

    /// Retrieve a project publication record by project_id
    pub fn get_project_record(env: Env, project_id: String) -> Option<ProjectRecord> {
        ProjectPublicationContract::get_project_record(env, project_id)
    }
}
