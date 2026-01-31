use soroban_sdk::{contracttype, Address, String, Symbol};
use crate::types::PublicationState;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PublicationData {
    pub publication_type: Symbol,
    pub title: String,
    pub category: String,
    pub amount: i128,
    pub timestamp: u64,
    pub expiration: u64, // New field for expiration
    pub state: PublicationState,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    UserPostCount(Address),
    Publication(Address, u32),
}
