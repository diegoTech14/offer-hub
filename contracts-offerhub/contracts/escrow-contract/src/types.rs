use soroban_sdk::{contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowState {
    Created,
    Funded,
    Released,
    Refunded,
    Disputed,
}

impl EscrowState {
    pub fn can_transition_to(&self, next: &EscrowState) -> bool {
        use EscrowState::*;
        match (self, next) {
            (Created, Funded) => true,
            (Funded, Released) => true,
            (Funded, Refunded) => true,
            (Funded, Disputed) => true,
            (Disputed, Released) => true,
            (Disputed, Refunded) => true,
            _ => false,
        }
    }
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeResult {
    None = 0,
    ClientWins = 1,
    FreelancerWins = 2,
    Split = 3,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneHistory {
    pub milestone: Milestone,
    pub action: String,
    pub timestamp: u64,
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

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowData {
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Option<Address>,
    pub token: Option<Address>,
    pub amount: i128,
    pub state: EscrowState,
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
    pub fee_manager: Address, // Fee manager contract address
    pub fee_collected: i128,  // Total fees collected
    pub net_amount: i128,     // Amount after fees
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractConfig {
    pub min_escrow_amount: i128,          // Minimum escrow amount
    pub max_escrow_amount: i128,          // Maximum escrow amount
    pub default_timeout_days: u32,        // Default timeout in days
    pub max_milestones: u32,              // Maximum number of milestones
    pub fee_percentage: i128,             // Fee percentage (in basis points)
    pub rate_limit_calls: u32,            // Rate limit calls per window
    pub rate_limit_window_hours: u32,     // Rate limit window in hours
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowDataExport {
    pub contract_id: String,
    pub escrow_data: EscrowData,
    pub milestones: Vec<Milestone>,
    pub milestone_history: Vec<MilestoneHistory>,
    pub export_timestamp: u64,
    pub export_version: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowSummary {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub status: String,
    pub created_at: u64,
    pub milestone_count: u32,
}
