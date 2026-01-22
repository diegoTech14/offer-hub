use soroban_sdk::{contracttype, Address, BytesN, String, Symbol, Vec};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowCreateParams {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub fee_manager: Address,
    pub salt: BytesN<32>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct DisputeParams {
    pub escrow_id: u32,
    pub result: Symbol,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneCreateParams {
    pub escrow_id: u32,
    pub desc: String,
    pub amount: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneCreateResult {
    pub escrow_id: u32,
    pub milestone_id: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneParams {
    pub escrow_id: u32,
    pub milestone_id: u32,
}

// Escrow contract types (duplicated for factory use)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowStatus {
    Initialized,
    Funded,
    Released,
    Disputed,
    Resolved,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub description: String,
    pub amount: i128,
    pub approved: bool,
    pub released: bool,
    pub created_at: u64,
    pub approved_at: Option<u64>,
    pub released_at: Option<u64>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneHistory {
    pub milestone: Milestone,
    pub action: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowData {
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Option<Address>,
    pub token: Option<Address>,
    pub amount: i128,
    pub status: EscrowStatus,
    pub dispute_result: u32,
    pub created_at: u64,
    pub funded_at: Option<u64>,
    pub released_at: Option<u64>,
    pub disputed_at: Option<u64>,
    pub resolved_at: Option<u64>,
    pub timeout_secs: Option<u64>,
    pub milestones: Vec<Milestone>,
    pub milestone_history: Vec<MilestoneHistory>,
    pub released_amount: i128,
    pub fee_manager: Address,
    pub fee_collected: i128,
    pub net_amount: i128,
}
