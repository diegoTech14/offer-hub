#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize_success() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    client.initialize(&admin);

    let key = DataKey::TaskCounter;
    let counter: u64 = env.as_contract(&contract_id, || {
        env.storage().instance().get(&key).unwrap()
    });
    assert_eq!(counter, 0);
}

#[test]
fn test_initialize_already_initialized() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    // Initialize once
    client.initialize(&admin);
    
    // Try to initialize again
    let result = client.try_initialize(&admin);
    assert_eq!(result, Err(Ok(Errors::AlreadyInitialized)));
}

#[test]
fn test_record_task_outcome_success() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();

    client.initialize(&admin);

    let project_id = String::from_str(&env, "project_001");
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");
    
    let result = client.record_task_outcome(
        &project_id,
        &freelancer_id,
        &client_id,
        &true,
    );
    
    assert_eq!(result, 1);
}

#[test]
fn test_record_task_outcome_not_initialized() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    env.mock_all_auths();
    
    let project_id = String::from_str(&env, "project_001");
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");
    
    let result = client.try_record_task_outcome(
        &project_id,
        &freelancer_id,
        &client_id,
        &true,
    );
    
    assert_eq!(result, Err(Ok(Errors::Unauthorized)));
}

#[test]
fn test_record_multiple_tasks() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");

    let task1 = client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task1, 1);

    let task2 = client.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer_id,
        &client_id,
        &false,
    );
    assert_eq!(task2, 2);

    let task3 = client.record_task_outcome(
        &String::from_str(&env, "project_003"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task3, 3);
}

#[test]
fn test_get_tasks_for_freelancer() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");

    client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );
    
    client.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer_id,
        &client_id,
        &false,
    );
 
    let tasks = client.get_tasks_for_freelancer(&freelancer_id);
    
    assert_eq!(tasks.len(), 2);
    assert_eq!(tasks.get(0).unwrap().task_id, 1);
    assert_eq!(tasks.get(0).unwrap().completed, true);
    assert_eq!(tasks.get(1).unwrap().task_id, 2);
    assert_eq!(tasks.get(1).unwrap().completed, false);
}

#[test]
fn test_get_tasks_for_client() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client_contract = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client_contract.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");

    client_contract.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );
    
    client_contract.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer_id,
        &client_id,
        &false,
    );
    

    let tasks = client_contract.get_tasks_for_client(&client_id);
    
    assert_eq!(tasks.len(), 2);
    assert_eq!(tasks.get(0).unwrap().client_id, client_id);
    assert_eq!(tasks.get(1).unwrap().client_id, client_id);
}

#[test]
fn test_get_tasks_for_nonexistent_freelancer() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let nonexistent_freelancer = String::from_str(&env, "freelancer_999");
    let tasks = client.get_tasks_for_freelancer(&nonexistent_freelancer);
    
    assert_eq!(tasks.len(), 0);
}

#[test]
fn test_get_tasks_for_nonexistent_client() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let nonexistent_client = String::from_str(&env, "client_999");
    let tasks = client.get_tasks_for_client(&nonexistent_client);
    
    assert_eq!(tasks.len(), 0);
}

#[test]
fn test_multiple_freelancers_same_client() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer1 = String::from_str(&env, "freelancer_001");
    let freelancer2 = String::from_str(&env, "freelancer_002");
    let client_id = String::from_str(&env, "client_001");

    client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer1,
        &client_id,
        &true,
    );
    
    client.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer2,
        &client_id,
        &true,
    );

    let tasks1 = client.get_tasks_for_freelancer(&freelancer1);
    assert_eq!(tasks1.len(), 1);
    assert_eq!(tasks1.get(0).unwrap().freelancer_id, freelancer1);
 
    let tasks2 = client.get_tasks_for_freelancer(&freelancer2);
    assert_eq!(tasks2.len(), 1);
    assert_eq!(tasks2.get(0).unwrap().freelancer_id, freelancer2);

    let client_tasks = client.get_tasks_for_client(&client_id);
    assert_eq!(client_tasks.len(), 2);
}

#[test]
fn test_task_record_timestamp() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");

    let timestamp_before = env.ledger().timestamp();

    client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );

    let tasks = client.get_tasks_for_freelancer(&freelancer_id);
    assert_eq!(tasks.len(), 1);
    
    let task = tasks.get(0).unwrap();
    assert!(task.timestamp >= timestamp_before);
}

#[test]
fn test_task_record_fields() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let project_id = String::from_str(&env, "project_001");
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");
    
    client.record_task_outcome(
        &project_id,
        &freelancer_id,
        &client_id,
        &true,
    );
    
    let tasks = client.get_tasks_for_freelancer(&freelancer_id);
    let task = tasks.get(0).unwrap();
    
    assert_eq!(task.task_id, 1);
    assert_eq!(task.project_id, project_id);
    assert_eq!(task.freelancer_id, freelancer_id);
    assert_eq!(task.client_id, client_id);
    assert_eq!(task.completed, true);
    assert!(task.timestamp == 0);
}

#[test]
fn test_task_counter_increments() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");
    
    let task1 = client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task1, 1);

    let task2 = client.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task2, 2);

    let task3 = client.record_task_outcome(
        &String::from_str(&env, "project_003"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task3, 3);

    let task4 = client.record_task_outcome(
        &String::from_str(&env, "project_004"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task4, 4);

    let task5 = client.record_task_outcome(
        &String::from_str(&env, "project_005"),
        &freelancer_id,
        &client_id,
        &true,
    );
    assert_eq!(task5, 5);
}

#[test]
fn test_completed_and_failed_tasks() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");

    client.record_task_outcome(
        &String::from_str(&env, "project_001"),
        &freelancer_id,
        &client_id,
        &true,
    );

    client.record_task_outcome(
        &String::from_str(&env, "project_002"),
        &freelancer_id,
        &client_id,
        &true,
    );

    client.record_task_outcome(
        &String::from_str(&env, "project_003"),
        &freelancer_id,
        &client_id,
        &true,
    );
    
    // Record 2 failed tasks
    client.record_task_outcome(
        &String::from_str(&env, "project_004"),
        &freelancer_id,
        &client_id,
        &false,
    );

    client.record_task_outcome(
        &String::from_str(&env, "project_005"),
        &freelancer_id,
        &client_id,
        &false,
    );
    
    let tasks = client.get_tasks_for_freelancer(&freelancer_id);
    assert_eq!(tasks.len(), 5);
    
    let mut completed_count = 0;
    let mut failed_count = 0;
    
    for i in 0..tasks.len() {
        let task = tasks.get(i).unwrap();
        if task.completed {
            completed_count += 1;
        } else {
            failed_count += 1;
        }
    }
    
    assert_eq!(completed_count, 3);
    assert_eq!(failed_count, 2);
}

#[test]
fn test_authorization_required() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);

    let result = client.try_initialize(&admin);

    assert!(result.is_err());
}

#[test]
fn test_empty_strings() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
 
    let result = client.record_task_outcome(
        &String::from_str(&env, ""),
        &String::from_str(&env, ""),
        &String::from_str(&env, ""),
        &true,
    );
    
    assert_eq!(result, 1);
}

#[test]
fn test_long_strings() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let long_string = String::from_str(&env, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    
    let result = client.record_task_outcome(
        &long_string,
        &long_string,
        &long_string,
        &true,
    );
    
    assert_eq!(result, 1);
}

#[test]
fn test_stress_test_many_tasks() {
    let env = Env::default();
    let contract_id = env.register(TaskRecordContract, ());
    let client = TaskRecordContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    env.mock_all_auths();
    
    client.initialize(&admin);
    
    let freelancer_id = String::from_str(&env, "freelancer_001");
    let client_id = String::from_str(&env, "client_001");
    
    // Record 20 tasks
    client.record_task_outcome(&String::from_str(&env, "project_001"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_002"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_003"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_004"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_005"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_006"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_007"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_008"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_009"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_010"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_011"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_012"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_013"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_014"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_015"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_016"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_017"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_018"), &freelancer_id, &client_id, &false);
    client.record_task_outcome(&String::from_str(&env, "project_019"), &freelancer_id, &client_id, &true);
    client.record_task_outcome(&String::from_str(&env, "project_020"), &freelancer_id, &client_id, &false);

    let tasks = client.get_tasks_for_freelancer(&freelancer_id);
    assert_eq!(tasks.len(), 20);
}