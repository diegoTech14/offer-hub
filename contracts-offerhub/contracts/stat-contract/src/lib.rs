#![no_std]
pub use crate::contract::StatContract;
use crate::storage::ContractStats;
use crate::error::Error;
use soroban_sdk::{contract, contractimpl, Address, Env};

mod contract;
mod storage;
mod types;
mod error;

#[cfg(test)]
mod test;

#[contract]
pub struct StatisticsContract;

#[contractimpl]
impl StatisticsContract {
    pub fn initialize(
        env: Env,
        user_registry_id: Address,
        rating_contract_id: Address,
        escrow_id: Address,
        dispute_id: Address,
        fee_manager_id: Address,
    ) {
        StatContract::initialize(
            env,
            user_registry_id,
            rating_contract_id,
            escrow_id,
            dispute_id,
            fee_manager_id,
        )
    }
    pub fn get_contract_stats(env: Env) -> Result<ContractStats, Error> {
        StatContract::get_contract_stats(env)
    }
}
