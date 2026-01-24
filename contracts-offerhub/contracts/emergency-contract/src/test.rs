#![cfg(test)]

use soroban_sdk::{symbol_short, testutils::{Address as _, Ledger}, vec, Address, Env};
use crate::emergency::*;


fn setup_env() -> Env {
    let env = Env::default();
    env.ledger().with_mut(|l| l.timestamp = 1000);
    env
}

fn create_contract(env: &Env) -> EmergencyContractClient<'_> {
    let contract_id = env.register(EmergencyContract, ());
    let client = EmergencyContractClient::new(env, &contract_id);
    client
}

#[test]
fn test_emergency_initialization() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EmergencyContract, ());

    // Initialize through the contract
    env.as_contract(&contract_id, || {
        EmergencyContract::initialize(&env, admin.clone());
    });

    // Get state through the contract
    let state = env.as_contract(&contract_id, || {
        EmergencyContract::get_emergency_state(&env)
    });
    assert_eq!(state.emergency_admin, admin);
    assert_eq!(state.is_paused, false);
}

#[test]
fn test_emergency_pause() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EmergencyContract, ());

    // Initialize through the contract
    env.as_contract(&contract_id, || {
        EmergencyContract::initialize(&env, admin.clone());
    });

    // Set current contract as admin for testing through contract context
    env.as_contract(&contract_id, || {
        env.storage().instance().set(
            &symbol_short!("STATE"),
            &EmergencyState {
                is_paused: false,
                emergency_admin: env.current_contract_address(),
                circuit_breaker_threshold: 10,
                suspicious_activity_count: 0,
                emergency_fund: 0,
                emergency_contacts: vec![&env, admin],
                last_emergency_check: env.ledger().timestamp(),
            },
        );
    });

    // Call emergency_pause through the contract
    env.as_contract(&contract_id, || {
        EmergencyContract::emergency_pause(&env);
    });

    // Get state through the contract
    let state = env.as_contract(&contract_id, || {
        EmergencyContract::get_emergency_state(&env)
    });
    assert_eq!(state.is_paused, true);
}


#[test]
fn test_circuit_breaker() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EmergencyContract, ());

    // Initialize through the contract
    env.as_contract(&contract_id, || {
        EmergencyContract::initialize(&env, admin.clone());
    });

    // Set current contract as admin for testing through contract context
    env.as_contract(&contract_id, || {
        env.storage().instance().set(
            &symbol_short!("STATE"),
            &EmergencyState {
                is_paused: false,
                emergency_admin: env.current_contract_address(),
                circuit_breaker_threshold: 3,
                suspicious_activity_count: 0,
                emergency_fund: 0,
                emergency_contacts: vec![&env, admin],
                last_emergency_check: env.ledger().timestamp(),
            },
        );
    });

    // Trigger circuit breaker multiple times through contract context
    env.as_contract(&contract_id, || {
        EmergencyContract::trigger_circuit_breaker(&env);
    });
    env.as_contract(&contract_id, || {
        EmergencyContract::trigger_circuit_breaker(&env);
    });
    env.as_contract(&contract_id, || {
        EmergencyContract::trigger_circuit_breaker(&env);
    });

    // Get state through the contract
    let state = env.as_contract(&contract_id, || {
        EmergencyContract::get_emergency_state(&env)
    });
    assert_eq!(state.is_paused, true);
}


#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_emergency_pause_unauthorized_access() {
    let env = setup_env();
    env.mock_all_auths();

    let client = create_contract(&env);
    let admin = Address::generate(&env);

    client.initialize(&admin.clone());

    client.emergency_pause();
}

#[test]
fn set_init() {
    let env = setup_env();
    env.mock_all_auths();

    let client = create_contract(&env);
    let admin = Address::generate(&env);

    client.initialize(&admin.clone());
    let state = client.get_emergency_state();
    assert_eq!(state.emergency_admin, admin);
    assert_eq!(state.is_paused, false);
}