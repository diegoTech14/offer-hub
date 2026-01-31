use crate::events::{emit_admin_changed, emit_minter_added, emit_minter_removed};
use crate::storage::{
    add_minter as add_minter_storage, get_admin, is_admin, is_minter,
    remove_minter as remove_minter_storage,
};
use crate::error::Error;
use crate::types::{require_auth};
use soroban_sdk::{Address, Env};

pub fn check_admin(env: &Env, address: &Address) -> Result<(), Error> {
    if !is_admin(env, address) {
        return Err(Error::Unauthorized);
    }
    require_auth(env, address)
}

pub fn check_minter(env: &Env, address: &Address) -> Result<(), Error> {
    if !is_minter(env, address) && !is_admin(env, address) {
        return Err(Error::Unauthorized);
    }
    require_auth(env, address)
}

pub fn check_owner(env: &Env, token_owner: &Address) -> Result<(), Error> {
    require_auth(env, token_owner)
}

pub fn transfer_admin(env: &Env, caller: &Address, new_admin: &Address) -> Result<(), Error> {
    check_admin(env, caller)?;
    let old_admin = get_admin(env);
    crate::storage::save_admin(env, new_admin);
    emit_admin_changed(env, &old_admin, new_admin);
    Ok(())
}

pub fn add_minter(env: &Env, caller: &Address, minter: &Address) -> Result<(), Error> {
    check_admin(env, caller)?;
    if is_minter(env, minter) {
        return Err(Error::AlreadyMinter);
    }
    add_minter_storage(env, minter);
    emit_minter_added(env, caller, minter);
    Ok(())
}

pub fn remove_minter(env: &Env, caller: &Address, minter: &Address) -> Result<(), Error> {
    check_admin(env, caller)?;
    if !is_minter(env, minter) {
        return Err(Error::NotMinter);
    }
    remove_minter_storage(env, minter);
    emit_minter_removed(env, caller, minter);
    Ok(())
}
