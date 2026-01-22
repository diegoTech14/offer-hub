use soroban_sdk::{Address, Env, Symbol};

pub fn _emit_initialized(e: &Env, admin: Address) {
    let topics = (Symbol::new(e, "Initialized"),e.ledger().timestamp() );
    e.events().publish(topics, admin);
}

pub fn _emit_task_record(e: &Env, task_counter : u64) {
    let topics = (Symbol::new(e, "Task_recorded"),e.ledger().timestamp() );
    e.events().publish(topics, task_counter);
}
