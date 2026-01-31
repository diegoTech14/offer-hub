#![cfg(test)]

use super::*;
use crate::{contract::PublicationContractClient, error::ContractError, storage::DataKey, types::PublicationState};
use soroban_sdk::{
    testutils::{Address as _, Ledger, Events as _},
    vec, Address, Env, IntoVal, String, Symbol, TryFromVal,
};

// --- Test Harness Struct ---

struct PublicationTest<'a> {
    env: Env,
    contract: PublicationContractClient<'a>,
    user1: Address,
    user2: Address,
}

impl<'a> PublicationTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let contract_address = env.register(Contract, ());
        let contract = PublicationContractClient::new(&env, &contract_address);

        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);

        PublicationTest {
            env,
            contract,
            user1,
            user2,
        }
    }
}

// --- Tests ---

#[test]
fn test_publish_service_success() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "service");
    let title = String::from_str(&test.env, "Build a Website");
    let category = String::from_str(&test.env, "Web Development");
    let amount = 1000;
    let timestamp = test.env.ledger().timestamp();

    let id = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );

    assert_eq!(id, 1);

    // Verify event emission
    let events = test.env.events().all();
    let (contract_id, topics, data) = events.last().unwrap();

    // Construct the expected topics vector to match the event's structure.
    let expected_topics = vec![
        &test.env,
        Symbol::new(&test.env, "publication_created").into_val(&test.env),
        test.user1.clone().into_val(&test.env),
        pub_type.clone().into_val(&test.env),
    ];

    // Assert each part of the event tuple individually.
    assert_eq!(&contract_id, &test.contract.address);
    assert_eq!(topics, expected_topics);

    // Convert the event data `Val` back to a `u32` for comparison.
    let event_data_u32 = u32::try_from_val(&test.env, &data).unwrap();
    assert_eq!(event_data_u32, 1);

    // Verify stored data using the getter
    let publication = test.contract.get_publication(&test.user1, &1).unwrap();
    assert_eq!(publication.publication_type, pub_type);
    assert_eq!(publication.title, title);
    assert_eq!(publication.amount, amount);
}

#[test]
fn test_publish_project_and_user_counter() {
    let test = PublicationTest::setup();

    // First publication
    test.contract.publish(
        &test.user1,
        &Symbol::new(&test.env, "service"),
        &"First Service".into_val(&test.env),
        &"Cat A".into_val(&test.env),
        &100,
        &test.env.ledger().timestamp(),
    );

    // Second publication by the same user should increment the ID
    let id = test.contract.publish(
        &test.user1,
        &Symbol::new(&test.env, "project"),
        &"Second Project".into_val(&test.env),
        &"Cat B".into_val(&test.env),
        &200,
        &test.env.ledger().timestamp(),
    );

    assert_eq!(id, 2);

    // Verify the user's post count in storage by accessing it from within the contract's context.
    test.env.as_contract(&test.contract.address, || {
        let user_post_count_key = DataKey::UserPostCount(test.user1.clone());
        let count: u32 = test
            .env
            .storage()
            .instance()
            .get(&user_post_count_key)
            .unwrap();
        assert_eq!(count, 2);
    });
}

#[test]
fn test_multiple_users_have_separate_counters() {
    let test = PublicationTest::setup();

    // User 1's first publication
    let id1 = test.contract.publish(
        &test.user1,
        &Symbol::new(&test.env, "service"),
        &"User 1 Service".into_val(&test.env),
        &"Cat A".into_val(&test.env),
        &100,
        &test.env.ledger().timestamp(),
    );
    assert_eq!(id1, 1);

    // User 2's first publication should also have ID 1
    let id2 = test.contract.publish(
        &test.user2,
        &Symbol::new(&test.env, "project"),
        &"User 2 Project".into_val(&test.env),
        &"Cat B".into_val(&test.env),
        &200,
        &test.env.ledger().timestamp(),
    );
    assert_eq!(id2, 1);
}

#[test]
fn test_publish_fails_on_invalid_type() {
    let test = PublicationTest::setup();

    let result = test.contract.try_publish(
        &test.user1,
        &Symbol::new(&test.env, "invalid_type"), // Invalid type
        &"Title".into_val(&test.env),
        &"Category".into_val(&test.env),
        &100,
        &123,
    );

    assert_eq!(result, Err(Ok(ContractError::InvalidPublicationType)));
}

#[test]
fn test_publish_fails_on_short_title() {
    let test = PublicationTest::setup();

    let result = test.contract.try_publish(
        &test.user1,
        &Symbol::new(&test.env, "service"),
        &"ab".into_val(&test.env), // Title too short
        &"Category".into_val(&test.env),
        &100,
        &123,
    );

    assert_eq!(result, Err(Ok(ContractError::TitleTooShort)));
}

#[test]
fn test_publish_fails_on_negative_amount() {
    let test = PublicationTest::setup();

    let result = test.contract.try_publish(
        &test.user1,
        &Symbol::new(&test.env, "project"),
        &"Valid Title".into_val(&test.env),
        &"Category".into_val(&test.env),
        &-50, // Invalid amount
        &123,
    );

    assert_eq!(result, Err(Ok(ContractError::InvalidAmount)));
}


#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_title_too_short() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "service");
    let title = String::from_str(&test.env, "Bu");
    let category = String::from_str(&test.env, "Web Development");
    let amount = 1000;
    let timestamp = test.env.ledger().timestamp();

    let _ = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_max_len() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "service");
    let title = String::from_str(&test.env, "Build a WebsiteBuild a WebsiteBuild a WebsiteBuild a WebsiteBuild a WebsiteBuild a WebsiteBuild a WebsiteBuild a WebsiteBuild a Website");
    let category = String::from_str(&test.env, "Web Development");
    let amount = 1000;
    let timestamp = test.env.ledger().timestamp();

    let _ = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );
}



#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_min_category() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "service");
    let title = String::from_str(&test.env, "Build a Website");
    let category = String::from_str(&test.env, "");
    let amount = 1000;
    let timestamp = test.env.ledger().timestamp();

    let _ = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_max_amount_invalid_amount() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "service");
    let title = String::from_str(&test.env, "Build a website");
    let category = String::from_str(&test.env, "Web Development");
    let amount = 1_000_000_000_001;
    let timestamp = test.env.ledger().timestamp();

    let _ = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_invalid_publication_type() {
    let test = PublicationTest::setup();

    let pub_type = Symbol::new(&test.env, "none");
    let title = String::from_str(&test.env, "Build a website");
    let category = String::from_str(&test.env, "Web Development");
    let amount = 1_000;
    let timestamp = test.env.ledger().timestamp();

    let _ = test.contract.publish(
        &test.user1,
        &pub_type,
        &title,
        &category,
        &amount,
        &timestamp,
    );
}

#[test]
fn test_expiration_triggers_expired_state() {
    let test = PublicationTest::setup();
    let env = &test.env;
    let user = test.user1.clone();
    let timestamp = env.ledger().timestamp();
    let expiration_period: u64 = 2_592_000; // Default expiration period (30 days)
    
    // Publish a new publication
    let id = test.contract.publish(
        &user,
        &Symbol::new(env, "service"),
        &"Test Service".into_val(env),
        &"Category A".into_val(env),
        &100,
        &timestamp,
    );
    assert_eq!(id, 1);

    // Verify initial state is Published
    let publication = test.contract.get_publication(&user.clone(), &id).unwrap();
    assert_eq!(publication.state, PublicationState::Published);

    // Simulate expiration by advancing ledger timestamp beyond expiration
    let expiration = timestamp + expiration_period;
    env.ledger().with_mut(|l| l.timestamp = expiration + 1);

    // Retrieve publication again to trigger check_expiration
    let updated_publication = test.contract.get_publication(&user.clone(), &id).unwrap();
    assert_eq!(updated_publication.state, PublicationState::Expired);
}
