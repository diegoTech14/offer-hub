use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized
    NotInitialized = 2,
    /// Caller is not authorized to perform this action
    Unauthorized = 3,
    /// Invalid client ID provided
    InvalidClientId = 4,
    /// Invalid project ID provided
    InvalidProjectId = 5,
    /// Project has already been recorded
    ProjectAlreadyRecorded = 6,
    /// Invalid timestamp provided
    InvalidTimestamp = 7,
}
