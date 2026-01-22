#[cfg(test)]
use super::*;
use soroban_sdk::{contract, contractimpl};
use soroban_sdk::{
    testutils::{Address as _},
    Address, Env, String, Vec,
};

#[contract]
pub struct MockTokenContract;

#[contractimpl]
impl MockTokenContract {
    pub fn balance(_env: Env, _addr: Address) -> i128 {
        1000
    }
    pub fn transfer(_env: Env, _from: Address, _to: Address, _amount: i128) {}
}

#[test]
fn test_get_contract_stats() {
    let env = Env::default();
    env.mock_all_auths();

    // Deploy the User Registry contract
    let user_registry_id = env.register(user_registry_contract::Contract, ());
    let user_registry_client = user_registry_contract::ContractClient::new(&env, &user_registry_id);

    // Deploy the Ecrow contract
    let escrow_id = env.register(escrow_contract::EscrowContract, ());
    let escrow_client = escrow_contract::EscrowContractClient::new(&env, &escrow_id);

    // Deploy the Rating contract
    let rating_contract_id = env.register(rating_contract::Contract, ());
    let rating_client = rating_contract::ContractClient::new(&env, &rating_contract_id);

    // Deploy the Dispute contract
    let dispute_id = env.register(dispute_contract::DisputeResolutionContract, ());
    let dispute_client = dispute_contract::DisputeResolutionContractClient::new(&env, &dispute_id);

    // Deploy the Fee Manager contract
    let fee_manager_id = env.register(fee_manager_contract::FeeManagerContract, ());
    let fee_manager_client =
        fee_manager_contract::FeeManagerContractClient::new(&env, &fee_manager_id);

    // // Deploy the statistics contract
    let stats_contract_id = env.register(StatisticsContract, ());
    let stats_client = StatisticsContractClient::new(&env, &stats_contract_id);

    /////////////////////////////////////////////////////////////    User Registry Contract

    // Initialize the statistics contract with the rating contract address
    stats_client.initialize(
        &user_registry_id,
        &rating_contract_id,
        &escrow_id,
        &dispute_id,
        &fee_manager_id,
    );

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    let admin = Address::generate(&env);

    user_registry_client.initialize_admin(&admin.clone());

    let mut users = Vec::new(&env);
    users.push_back(user1.clone());
    users.push_back(user2.clone());
    users.push_back(user3.clone());

    let metadata = String::from_str(&env, "Bulk verified");
    let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

    let _ = user_registry_client.bulk_verify_users(
        &admin.clone(),
        &users,
        &user_registry_contract::types::VerificationLevel::Premium,
        &expires_at,
        &metadata,
    );

    let total_users_count = user_registry_client.get_total_users();
    assert_eq!(total_users_count, 3);

    /////////////////////////////////////////////////////////////    Escrow Contract

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token = env.register(MockTokenContract, ());
    let amount = 500;
    let timeout = 3600; // 1 hour (minimum allowed)

    escrow_client.init_contract_full(&client, &freelancer, &arbitrator, &token, &amount, &timeout);

    // Deposit funds (should increment count)
    escrow_client.deposit_funds(&client);

    // Add milestone (should increment count)
    escrow_client.add_milestone(&client, &String::from_str(&env, "Test milestone"), &200);

    // Approve milestone (should increment count)
    escrow_client.approve_milestone(&client, &1);

    // Release milestone (should increment count)
    escrow_client.release_milestone(&freelancer, &1);

    // Release funds (should increment count)
    escrow_client.release_funds(&freelancer);

    let final_count = escrow_client.get_total_transactions();
    assert_eq!(final_count, 5);

    /////////////////////////////////////////////////////////////     Rating Contract

    // Create test data
    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let feedback = String::from_str(&env, "Great work!");
    let category = String::from_str(&env, "Quality");

    // Submit ratings
    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "w1",
                1 => "w2",
                2 => "w3",
                3 => "w4",
                _ => "w5",
            },
        );
        rating_client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    // Verify rating contract has 5 ratings
    let total_count = rating_client.get_total_rating();
    assert_eq!(total_count, 5);

    /////////////////////////////////////////////////////////////     Dispute Contract

    let admin = Address::generate(&env);
    let escrow_contract = Address::generate(&env);
    let fee_manager = Address::generate(&env);

    dispute_client.initialize(&admin, &86400_u64, &escrow_contract, &fee_manager);

    let initiator = Address::generate(&env);
    let job_id_1 = 1;
    let job_id_2 = 2;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract_addr = Some(Address::generate(&env));

    // Check initial dispute count
    let initial_count = dispute_client.get_total_disputes();
    assert_eq!(initial_count, 0);

    // Open first dispute
    dispute_client.open_dispute(
        &job_id_1,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );

    // Open second dispute
    dispute_client.open_dispute(
        &job_id_2,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );

    let count_after_first = dispute_client.get_total_disputes();
    assert_eq!(count_after_first, 2);

    /////////////////////////////////////////////////////////////     Fee Manager Contract

    let admin = Address::generate(&env);
    let platform_wallet = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize contract
    fee_manager_client.initialize(&admin, &platform_wallet);

    let fee_config = fee_manager_client.get_fee_config();
    assert_eq!(fee_config.admin, admin);
    assert_eq!(fee_config.platform_wallet, platform_wallet);
    assert_eq!(fee_config.escrow_fee_percentage, 250); // 2.5%
    assert_eq!(fee_config.dispute_fee_percentage, 500); // 5.0%
    assert_eq!(fee_config.arbitrator_fee_percentage, 300); // 3.0%

    // Add user1 as premium to test zero fees
    fee_manager_client.add_premium_user(&user1);
    fee_manager_client.collect_fee(&1000000i128, &1, &user1); // 0 fee (premium)

    // Collect dispute fee for user2 (non-premium)
    fee_manager_client.collect_fee(&2000000i128, &2, &user2); // 100,000 fee (5%)

    // Collect dispute fee for user2 (non-premium)
    fee_manager_client.collect_fee(&2000000i128, &1, &user2); // 100,000 fee (5%)

    let fees_after_second_non_premium = fee_manager_client.get_total_fees();
    assert_eq!(fees_after_second_non_premium, 150_000);

    /////////////////////////////////////////////////////////////     Get stats from statistics contract

    let stats = stats_client.get_contract_stats();

    assert_eq!(stats.total_users, 3);
    assert_eq!(stats.total_transactions, 5);
    assert_eq!(stats.total_ratings, 5);
    assert_eq!(stats.total_disputes, 2);
    assert_eq!(stats.total_fees_collected, 150_000);
}
