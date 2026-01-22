use soroban_sdk::{contracttype, Address, String, Vec};

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeOutcome {
    None,
    FavorFreelancer,
    FavorClient,
    Split,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum DisputeState {
    Open, 
    UnderReview (DisputeLevel), 
    Resolved, 
    Closed
}

impl DisputeState {
    pub fn can_transition_to(&self, next: &DisputeState) -> bool {
        use DisputeState::*;
        match (self, next) {
            // Start review
            (Open, UnderReview(_)) => true,
            // Escalation path
            (UnderReview(DisputeLevel::Mediation), UnderReview(DisputeLevel::Arbitration)) => true,
            // Resolution allowed from either review level
            (UnderReview(_), Resolved) => true,
            // Timeouts/administrative closure
            (Open, Closed) => true,
            (UnderReview(_), Closed) => true,
            // Finalization
            (Resolved, Closed) => true,
            _ => false
        }
    }
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeLevel {
    Mediation,
    Arbitration,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Evidence {
    pub submitter: Address,
    pub description: String,
    pub timestamp: u64,
    pub attachment_hash: Option<String>, // IPFS hash or similar
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeData {
    pub initiator: Address,
    pub reason: String,
    pub timestamp: u64,
    pub resolved: bool,
    pub outcome: DisputeOutcome,
    pub state: DisputeState,
    pub level: DisputeLevel,
    pub fee_manager: Address,
    pub dispute_amount: i128,
    pub fee_collected: i128,
    pub escrow_contract: Option<Address>, // Direct escrow integration
    pub timeout_timestamp: Option<u64>,   // Automatic resolution timeout
    pub evidence: Vec<Evidence>,
    pub mediator: Option<Address>,
    pub arbitrator: Option<Address>,
    pub resolution_timestamp: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArbitratorData {
    pub address: Address,
    pub name: String,
    pub is_active: bool,
    pub total_cases: u32,
    pub successful_resolutions: u32,
    pub added_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractConfig {
    pub default_timeout_hours: u32,       // Default dispute timeout in hours
    pub max_evidence_per_dispute: u32,    // Maximum evidence submissions per dispute
    pub mediation_timeout_hours: u32,     // Mediation timeout in hours
    pub arbitration_timeout_hours: u32,   // Arbitration timeout in hours
    pub fee_percentage: i128,             // Fee percentage (in basis points)
    pub rate_limit_calls: u32,            // Rate limit calls per window
    pub rate_limit_window_hours: u32,     // Rate limit window in hours
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeDataExport {
    pub dispute_id: u32,
    pub dispute_data: DisputeData,
    pub evidence: Vec<Evidence>,
    pub export_timestamp: u64,
    pub export_version: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeSummary {
    pub dispute_id: u32,
    pub initiator: Address,
    pub status: DisputeState,
    pub outcome: DisputeOutcome,
    pub dispute_amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AllDisputeDataExport {
    pub total_disputes: u64,
    pub dispute_summaries: Vec<DisputeSummary>,
    pub export_timestamp: u64,
    pub export_version: String,
    pub data_size_limit_reached: bool,
}


#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeInfo {
    pub dispute_id: u32,
    pub initiator: Address,
    pub reason: String,
    pub timestamp: u64,
    pub resolved: bool,
    pub outcome: String,
    pub status: String,
    pub level: String,
    pub fee_manager: Address,
    pub dispute_amount: i128,
    pub fee_collected: i128,
    pub escrow_contract: Option<Address>, // Direct escrow integration
    pub timeout_timestamp: Option<u64>,   // Automatic resolution timeout
    pub evidence: Vec<(Address, String, u64, Option<String>)>,
    pub mediator: Option<Address>,
    pub arbitrator: Option<Address>,
    pub resolution_timestamp: Option<u64>,
}