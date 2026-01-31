use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    /// The provided publication type is not valid or not supported
    InvalidPublicationType = 1,
    
    /// The title must be longer than the minimum required length
    TitleTooShort = 2,
    
    /// The amount provided is invalid (negative, zero, or exceeds limits)
    InvalidAmount = 3,
    
    /// The input data failed validation checks
    ValidationError = 4,
    InvalidTimestamp = 5,
    TimestampTooOld = 6,
}
