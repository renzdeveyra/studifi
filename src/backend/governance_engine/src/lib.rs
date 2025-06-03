use candid::{candid_method};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade};
use shared::*;

#[init]
fn init() {
    ic_cdk::println!("Governance Engine canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Governance Engine canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Governance Engine canister upgraded successfully");
}

#[update]
#[candid_method(update)]
fn create_proposal(title: String, _description: String) -> StudiFiResult<String> {
    let proposal_id = generate_id("PROP", 1);
    ic_cdk::println!("Created proposal: {}", title);
    Ok(proposal_id)
}

#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    Statistics::default()
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
