use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Errors {
   InvalidInput = 0 ,
   AlreadyInitialized =1 ,
   Unauthorized =2
}
