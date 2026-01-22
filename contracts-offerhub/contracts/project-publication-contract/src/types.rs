use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProjectRecord {
    pub client_id: Address,
    pub project_id: String,
    pub timestamp: u64,
    pub recorded_at: u64,
}
