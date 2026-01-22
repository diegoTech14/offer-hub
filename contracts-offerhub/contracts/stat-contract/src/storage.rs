use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ContractStats {
    pub total_users: u64,
    pub total_transactions: u64,
    pub total_ratings: u64,
    pub total_disputes: u64,
    pub total_fees_collected: i128,
}
