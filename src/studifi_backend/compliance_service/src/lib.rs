use candid::{candid_method, Principal};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade};
use shared::*;

#[init]
fn init() {
    ic_cdk::println!("Compliance Service canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Compliance Service canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Compliance Service canister upgraded successfully");
}

#[update]
#[candid_method(update)]
fn perform_kyc_check(entity_id: Principal) -> StudiFiResult<String> {
    let record_id = generate_id("KYC", 1);
    ic_cdk::println!("Performed KYC check for: {:?}", entity_id);
    Ok(record_id)
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
