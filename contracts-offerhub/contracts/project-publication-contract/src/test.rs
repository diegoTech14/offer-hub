#![cfg(test)]

use super::*;
use crate::storage::{get_project_record_storage, is_initialized};
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};

// --- Test Harness Struct ---

struct ProjectPublicationTest<'a> {
    env: Env,
    contract: ContractClient<'a>,
    contract_address: Address,
    admin: Address,
    client: Address,
    other_user: Address,
}

impl<'a> ProjectPublicationTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let contract_address = env.register(Contract, ());
        let contract = ContractClient::new(&env, &contract_address);
        let admin = Address::generate(&env);
        let client = Address::generate(&env);
        let other_user = Address::generate(&env);

        ProjectPublicationTest {
            env,
            contract,
            contract_address,
            admin,
            client,
            other_user,
        }
    }
}

// --- Tests ---

#[test]
fn test_initialize_success() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    // Verify initialization by checking storage
    test.env.as_contract(&test.contract_address, || {
        assert!(is_initialized(&test.env));
    });
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_initialize_twice_fails() {
    let test = ProjectPublicationTest::setup();

    // First initialization
    test.contract.initialize(&test.admin);

    // Second initialization should fail
    test.contract.initialize(&test.admin);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_record_project_before_initialization_fails() {
    let test = ProjectPublicationTest::setup();

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Try to record project without initialization
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );
}

#[test]
fn test_record_project_success() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Record project
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );

    // Verify stored data
    let record = test.env.as_contract(&test.contract_address, || {
        get_project_record_storage(&test.env, &project_id)
    }).unwrap();
    assert_eq!(record.client_id, test.client);
    assert_eq!(record.project_id, project_id);
    assert_eq!(record.timestamp, timestamp);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_record_project_unauthorized() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Try to record project as non-admin
    test.contract.record_project(
        &test.other_user,
        &test.client,
        &project_id,
        &timestamp,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_record_duplicate_project_fails() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Record project first time
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );

    // Try to record same project again
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );
}

#[test]
fn test_get_project_record_success() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Record project
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );

    // Retrieve project record
    let record = test.contract.get_project_record(&project_id);

    assert!(record.is_some());
    let record = record.unwrap();
    assert_eq!(record.client_id, test.client);
    assert_eq!(record.project_id, project_id);
    assert_eq!(record.timestamp, timestamp);
}

#[test]
fn test_get_project_record_not_found() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "non-existent-project");

    // Try to retrieve non-existent project
    let record = test.contract.get_project_record(&project_id);

    assert!(record.is_none());
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_record_project_invalid_project_id_too_short() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, ""); // Empty string
    let timestamp = test.env.ledger().timestamp();

    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn test_record_project_invalid_timestamp_future() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let future_timestamp = test.env.ledger().timestamp() + 1000; // Far in the future

    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &future_timestamp,
    );
}

#[test]
fn test_record_multiple_projects() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id1 = String::from_str(&test.env, "project-1");
    let project_id2 = String::from_str(&test.env, "project-2");
    let timestamp = test.env.ledger().timestamp();

    // Record first project
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id1,
        &timestamp,
    );

    // Record second project
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id2,
        &timestamp,
    );

    // Verify both records exist
    let record1 = test.contract.get_project_record(&project_id1);
    let record2 = test.contract.get_project_record(&project_id2);

    assert!(record1.is_some());
    assert!(record2.is_some());
    assert_eq!(record1.unwrap().project_id, project_id1);
    assert_eq!(record2.unwrap().project_id, project_id2);
}

#[test]
fn test_recorded_at_timestamp() {
    let test = ProjectPublicationTest::setup();

    // Initialize contract
    test.contract.initialize(&test.admin);

    let project_id = String::from_str(&test.env, "project-123");
    let timestamp = test.env.ledger().timestamp();

    // Record project
    test.contract.record_project(
        &test.admin,
        &test.client,
        &project_id,
        &timestamp,
    );

    // Verify recorded_at is set to current ledger timestamp
    let record = test.env.as_contract(&test.contract_address, || {
        get_project_record_storage(&test.env, &project_id)
    }).unwrap();
    assert!(record.recorded_at >= timestamp);
}
