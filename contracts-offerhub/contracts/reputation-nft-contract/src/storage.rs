use crate::types::{
    AchievementType, ACHIEVEMENT_LEADERBOARD, ACHIEVEMENT_PREREQUISITES, ACHIEVEMENT_STATS, ADMIN,
    MINTER, TOKEN_METADATA, TOKEN_OWNER, USER_ACHIEVEMENTS, USER_REPUTATION,
};
use crate::{Error, Metadata, TokenId};
use soroban_sdk::{Address, Bytes, BytesN, Env, Map, Vec};

pub fn save_token_owner(env: &Env, token_id: &TokenId, owner: &Address) {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().set(&key_bytes, owner);
}

pub fn get_token_owner(env: &Env, token_id: &TokenId) -> Result<Address, Error> {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    if let Some(owner) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Address>(&key_bytes)
    {
        return Ok(owner);
    }
    Err(Error::TokenDoesNotExist)
}

pub fn token_exists(env: &Env, token_id: &TokenId) -> bool {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().has(&key_bytes)
}

pub fn save_token_metadata(env: &Env, token_id: &TokenId, metadata: &Metadata) {
    let key_bytes = create_token_key(env, TOKEN_METADATA, token_id);
    env.storage().persistent().set(&key_bytes, metadata);
}

pub fn get_token_metadata(env: &Env, token_id: &TokenId) -> Result<Metadata, Error> {
    let key_bytes = create_token_key(env, TOKEN_METADATA, token_id);
    if let Some(metadata) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Metadata>(&key_bytes)
    {
        return Ok(metadata);
    }
    Err(Error::TokenDoesNotExist)
}

fn create_token_key(env: &Env, prefix: &[u8], token_id: &TokenId) -> BytesN<32> {
    let mut key_data = Bytes::new(env);
    key_data.extend_from_slice(prefix);
    key_data.extend_from_slice(&token_id.to_be_bytes());
    let hash = env.crypto().sha256(&key_data);
    BytesN::from_array(env, &hash.into())
}

pub fn save_admin(env: &Env, admin: &Address) {
    let key_bytes = create_simple_key(env, ADMIN);
    env.storage().persistent().set(&key_bytes, admin);
}

pub fn get_admin(env: &Env) -> Address {
    let key_bytes = create_simple_key(env, ADMIN);
    env.storage().persistent().get(&key_bytes).unwrap()
}

pub fn is_admin(env: &Env, address: &Address) -> bool {
    let admin = get_admin(env);
    &admin == address
}

pub fn add_minter(env: &Env, minter: &Address) {
    let key_bytes = create_simple_key(env, MINTER);
    let mut minters = get_minters(env);
    minters.set(minter.clone(), true);
    env.storage().persistent().set(&key_bytes, &minters);
}

pub fn remove_minter(env: &Env, minter: &Address) {
    let key_bytes = create_simple_key(env, MINTER);
    let mut minters = get_minters(env);
    minters.remove(minter.clone());
    env.storage().persistent().set(&key_bytes, &minters);
}

pub fn is_minter(env: &Env, address: &Address) -> bool {
    let minters = get_minters(env);
    minters.contains_key(address.clone())
}

fn get_minters(env: &Env) -> Map<Address, bool> {
    let key_bytes = create_simple_key(env, MINTER);
    env.storage()
        .persistent()
        .get(&key_bytes)
        .unwrap_or_else(|| Map::new(env))
}

fn create_simple_key(env: &Env, key_data: &[u8]) -> BytesN<32> {
    let mut key_bytes = Bytes::new(env);
    key_bytes.extend_from_slice(key_data);
    let hash = env.crypto().sha256(&key_bytes);
    BytesN::from_array(env, &hash.into())
}

const TOKEN_ID_COUNTER: &[u8] = &[4];

pub fn next_token_id(env: &Env) -> TokenId {
    let key_bytes = create_simple_key(env, TOKEN_ID_COUNTER);
    let mut counter: TokenId = env.storage().persistent().get(&key_bytes).unwrap_or(0);
    counter += 1;
    env.storage().persistent().set(&key_bytes, &counter);
    counter
}

pub fn bump_token_counter(env: &Env, minted_id: &TokenId) {
    let key_bytes = create_simple_key(env, TOKEN_ID_COUNTER);
    let mut counter: TokenId = env.storage().persistent().get(&key_bytes).unwrap_or(0);
    if *minted_id > counter {
        counter = *minted_id;
        env.storage().persistent().set(&key_bytes, &counter);
    }
}

// User achievement indexing functions
pub fn index_user_achievement(env: &Env, user: &Address, token_id: &TokenId) {
    const MAX_ACHIEVEMENTS_PER_USER: u32 = 100; // Prevent unbounded growth
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    let mut map_data: Map<Address, Vec<TokenId>> = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let mut list: Vec<TokenId> = map_data.get(user.clone()).unwrap_or_else(|| Vec::new(env));
    if list.len() >= MAX_ACHIEVEMENTS_PER_USER {
        soroban_sdk::panic_with_error!(env, Error::InvalidInput);
    }
    list.push_back(*token_id);
    map_data.set(user.clone(), list);
    env.storage().persistent().set(&key, &map_data);
}

pub fn remove_user_achievement_index(env: &Env, user: &Address, token_id: &TokenId) {
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    if let Some(mut map) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
    {
        if let Some(list) = map.get(user.clone()) {
            let mut new_list: Vec<TokenId> = Vec::new(env);
            let mut i = 0u32;
            while i < list.len() {
                if let Some(v) = list.get(i) {
                    if v != *token_id {
                        new_list.push_back(v);
                    }
                }
                i += 1;
            }
            map.set(user.clone(), new_list);
            env.storage().persistent().set(&key, &map);
        }
    }
}

pub fn get_user_achievements(env: &Env, user: &Address) -> Vec<TokenId> {
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    if let Some(map) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
    {
        return map.get(user.clone()).unwrap_or_else(|| Vec::new(env));
    }
    Vec::new(env)
}

// Burn token function
pub fn burn_token(env: &Env, token_id: &TokenId) {
    let owner_key = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().remove(&owner_key);
    let meta_key = create_token_key(env, TOKEN_METADATA, token_id);
    env.storage().persistent().remove(&meta_key);
}

// Achievement statistics functions
pub fn update_achievement_stats(env: &Env, achievement_type: &AchievementType) {
    let key = create_simple_key(env, ACHIEVEMENT_STATS);
    let mut stats = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<AchievementType, u32>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let count = stats.get(*achievement_type).unwrap_or(0);
    stats.set(*achievement_type, count + 1);

    env.storage().persistent().set(&key, &stats);
}

pub fn decrement_achievement_stats(env: &Env, achievement_type: &AchievementType) {
    let key = create_simple_key(env, ACHIEVEMENT_STATS);
    let mut stats = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<AchievementType, u32>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let count = stats.get(*achievement_type).unwrap_or(0);
    if count > 0 {
        stats.set(*achievement_type, count - 1);
        env.storage().persistent().set(&key, &stats);
    }
}

pub fn get_achievement_stats(env: &Env) -> Map<AchievementType, u32> {
    let key = create_simple_key(env, ACHIEVEMENT_STATS);
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Map::new(env))
}

// Leaderboard functions
pub fn update_leaderboard(env: &Env, user: &Address) {
    let key = create_simple_key(env, ACHIEVEMENT_LEADERBOARD);
    let mut leaderboard = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, u32>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let achievements = get_user_achievements(env, user);
    leaderboard.set(user.clone(), achievements.len() as u32);

    env.storage().persistent().set(&key, &leaderboard);
}

pub fn get_leaderboard(env: &Env) -> Map<Address, u32> {
    let key = create_simple_key(env, ACHIEVEMENT_LEADERBOARD);
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Map::new(env))
}

pub fn get_user_rank(env: &Env, user: &Address) -> u32 {
    let leaderboard = get_leaderboard(env);
    let user_score = leaderboard.get(user.clone()).unwrap_or(0);

    let mut rank = 1;
    for (_, score) in leaderboard.iter() {
        if score > user_score {
            rank += 1;
        }
    }
    rank
}

// Reputation score functions
pub fn store_reputation_score(env: &Env, user: &Address, rating_average: u32, total_ratings: u32) {
    let key = create_simple_key(env, USER_REPUTATION);
    let mut reputation_map = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, (u32, u32, u64)>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let reputation_data = (rating_average, total_ratings, env.ledger().timestamp());
    reputation_map.set(user.clone(), reputation_data);
    env.storage().persistent().set(&key, &reputation_map);
}

pub fn get_reputation_score(env: &Env, user: &Address) -> Option<(u32, u32, u64)> {
    let key = create_simple_key(env, USER_REPUTATION);
    let reputation_map = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, (u32, u32, u64)>>(&key)
        .unwrap_or_else(|| Map::new(env));

    reputation_map.get(user.clone())
}

// Achievement prerequisite functions
pub fn set_achievement_prerequisite(
    env: &Env,
    achievement_type: &AchievementType,
    prerequisite: &AchievementType,
) {
    let key = create_simple_key(env, ACHIEVEMENT_PREREQUISITES);
    let mut prereq_map = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<AchievementType, AchievementType>>(&key)
        .unwrap_or_else(|| Map::new(env));

    prereq_map.set(*achievement_type, *prerequisite);
    env.storage().persistent().set(&key, &prereq_map);
}

pub fn get_achievement_prerequisite(
    env: &Env,
    achievement_type: &AchievementType,
) -> Option<AchievementType> {
    let key = create_simple_key(env, ACHIEVEMENT_PREREQUISITES);
    let prereq_map = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<AchievementType, AchievementType>>(&key)
        .unwrap_or_else(|| Map::new(env));

    prereq_map.get(*achievement_type)
}

pub fn check_achievement_prerequisite(
    env: &Env,
    user: &Address,
    achievement_type: &AchievementType,
) -> bool {
    if let Some(prerequisite) = get_achievement_prerequisite(env, achievement_type) {
        let user_achievements = get_user_achievements(env, user);
        // Check if user has any achievement of the prerequisite type
        for i in 0..user_achievements.len() {
            if let Some(token_id) = user_achievements.get(i) {
                if let Ok(metadata) = get_token_metadata(env, &token_id) {
                    if metadata.achievement_type == prerequisite {
                        return true;
                    }
                }
            }
        }
        false
    } else {
        true // No prerequisite required
    }
}
