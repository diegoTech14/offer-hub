use soroban_sdk::{Address, Env, String, Symbol};

pub fn project_recorded(e: &Env, client_id: Address, project_id: String, timestamp: u64) {
    let topics = (Symbol::new(e, "project_recorded"), client_id, project_id);
    e.events().publish(topics, timestamp);
}

pub fn admin_initialized(e: &Env, admin: Address) {
    let topics = (Symbol::new(e, "admin_initialized"),);
    e.events().publish(topics, admin);
}
