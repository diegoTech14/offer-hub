use crate::types::ProjectRecord;
use soroban_sdk::{contracttype, symbol_short, Address, Env, String, Symbol};

pub const ADMIN: Symbol = symbol_short!("ADMIN");
pub const INITIALIZED: Symbol = symbol_short!("INIT");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    ProjectRecord(String),
}

/// Get the admin address
pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&ADMIN)
}

/// Set the admin address
pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN, admin);
    env.storage().instance().set(&INITIALIZED, &true);
}

/// Check if contract is initialized
pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&INITIALIZED)
}

/// Get project record by project_id
pub fn get_project_record_storage(env: &Env, project_id: &String) -> Option<ProjectRecord> {
    let key = DataKey::ProjectRecord(project_id.clone());
    env.storage().persistent().get(&key)
}

/// Set project record
pub fn set_project_record(env: &Env, project_id: &String, record: &ProjectRecord) {
    let key = DataKey::ProjectRecord(project_id.clone());
    env.storage().persistent().set(&key, record);
}

/// Check if project record exists
pub fn has_project_record(env: &Env, project_id: &String) -> bool {
    let key = DataKey::ProjectRecord(project_id.clone());
    env.storage().persistent().has(&key)
}
