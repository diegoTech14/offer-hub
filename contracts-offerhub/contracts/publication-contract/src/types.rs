use soroban_sdk::{ contracttype};

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PublicationState {
    Draft,
    Published, 
    InProgress, 
    Completed, 
    Cancelled,
    Expired
}

impl PublicationState {
    pub fn can_transition_to(&self, next: &PublicationState) -> bool {
        use PublicationState::*;
        match (self, next) {
            (Draft, Published) => true,
            (Draft, Cancelled) => true,
            (Published, InProgress) => true,
            (Published, Cancelled) => true,
            (InProgress, Completed) => true,
            (InProgress, Cancelled) => true,
            _ => false,
        }
    }
}