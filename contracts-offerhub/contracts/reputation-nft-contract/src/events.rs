use crate::TokenId;
use soroban_sdk::{Address, Env, Symbol, Vec};

pub fn emit_minted(env: &Env, to: &Address, token_id: &TokenId) {
    let topic = Symbol::new(env, "MINTED");
    env.events().publish((topic,), (to.clone(), token_id));
}

pub fn emit_transferred(env: &Env, from: &Address, to: &Address, token_id: &TokenId) {
    let topic = Symbol::new(env, "TRANSFER");
    env.events()
        .publish((topic,), (from.clone(), to.clone(), token_id));
}

pub fn emit_admin_changed(env: &Env, old_admin: &Address, new_admin: &Address) {
    let topic = Symbol::new(env, "ADMIN");
    env.events()
        .publish((topic,), (old_admin.clone(), new_admin.clone()));
}

pub fn emit_minter_added(env: &Env, admin: &Address, minter: &Address) {
    let topic = Symbol::new(env, "ADDMINTR");
    env.events()
        .publish((topic,), (admin.clone(), minter.clone()));
}

pub fn emit_minter_removed(env: &Env, admin: &Address, minter: &Address) {
    let topic = Symbol::new(env, "REMMINTR");
    env.events()
        .publish((topic,), (admin.clone(), minter.clone()));
}

pub fn emit_achievement_minted(env: &Env, to: &Address, nft_type: &Symbol, token_id: &TokenId) {
    let topic = Symbol::new(env, "ACHIEVEMENT_MINTED");
    env.events()
        .publish((topic,), (to.clone(), nft_type.clone(), token_id));
}

pub fn emit_reputaion_contract_initiated(env: &Env, admin: &Address) {
    // Legacy (typo) topic for backward-compatibility
    let legacy = Symbol::new(env, "ReputaionNFT_Contract_Init");
    // Corrected topic
    let topic = Symbol::new(env, "ReputationNFT_Contract_Init");
    let ts = env.ledger().timestamp();
    env.events().publish((legacy, admin), ts);
    env.events().publish((topic, admin), ts);
}

// Preferred alias with correct spelling
#[allow(dead_code)]
pub fn emit_reputation_contract_initiated(env: &Env, admin: &Address) {
    emit_reputaion_contract_initiated(env, admin);
}

pub fn emit_burned(env: &Env, token_id: &TokenId, owner: &Address) {
    let topic = Symbol::new(env, "BURNED");
    env.events().publish((topic,), (owner.clone(), token_id));
}

pub fn emit_batch_minted(env: &Env, owners: Vec<Address>, token_ids: Vec<TokenId>) {
    let topic = Symbol::new(env, "BATCH_MINTED");
    env.events().publish((topic,), (owners, token_ids));
}

pub fn emit_achievement_unlocked(
    env: &Env,
    user: &Address,
    achievement_type: &Symbol,
    token_id: &TokenId,
) {
    let topic = Symbol::new(env, "ACHIEVEMENT_UNLOCKED");
    env.events()
        .publish((topic,), (user.clone(), achievement_type.clone(), token_id));
}

pub fn emit_reputation_updated(env: &Env, user: &Address, old_score: u32, new_score: u32) {
    let topic = Symbol::new(env, "REPUTATION_UPDATED");
    env.events()
        .publish((topic,), (user.clone(), old_score, new_score));
}
