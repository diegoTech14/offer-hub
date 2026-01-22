use soroban_sdk::{contracterror};

// Error types
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EmergencyError {
    /// Contract operations are currently paused for emergency maintenance
    ContractPaused = 1,
    
    /// Caller does not have permission to perform emergency actions
    UnauthorizedAccess = 2,
    
    /// The requested emergency action is invalid or not recognized
    InvalidEmergencyAction = 3,
    
    /// No recovery request found for the specified identifier
    RecoveryRequestNotFound = 4,
    
    /// Emergency fund balance is insufficient for the requested operation
    InsufficientEmergencyFunds = 5,
    
    /// Circuit breaker has been triggered
    CircuitBreakerTriggered = 6,
}