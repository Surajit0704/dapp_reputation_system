#![cfg(test)]
use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

#[test]
fn test_give_and_get_rep() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // Give reputation from alice to bob
    client.give_rep(&alice, &bob, &10);

    // Check bob's total reputation
    assert_eq!(client.get_rep(&bob), 10);

    // Check alice's given reputation
    assert_eq!(client.get_given_rep(&alice), 10);

    // Check specific vote amount
    assert_eq!(client.get_vote(&alice, &bob), 10);
}

#[test]
fn test_multiple_votes_accumulate() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);

    // Multiple votes to bob
    client.give_rep(&alice, &bob, &5);
    client.give_rep(&charlie, &bob, &10);

    // Bob should have 15 total reputation
    assert_eq!(client.get_rep(&bob), 15);

    // Alice gave 5, Charlie gave 10
    assert_eq!(client.get_given_rep(&alice), 5);
    assert_eq!(client.get_given_rep(&charlie), 10);
}

#[test]
fn test_repeated_votes_same_pair() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // Alice gives reputation to bob multiple times
    client.give_rep(&alice, &bob, &3);
    client.give_rep(&alice, &bob, &7);

    // Bob's total should be 10
    assert_eq!(client.get_rep(&bob), 10);

    // Alice's given should be 10
    assert_eq!(client.get_given_rep(&alice), 10);

    // Vote from alice to bob should be 10
    assert_eq!(client.get_vote(&alice, &bob), 10);
}

#[test]
fn test_new_addresses_have_zero_rep() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let new_user = Address::generate(&env);

    // New addresses should have 0 reputation
    assert_eq!(client.get_rep(&new_user), 0);
    assert_eq!(client.get_given_rep(&new_user), 0);
}

#[test]
#[should_panic(expected = "cannot give rep to yourself")]
fn test_cannot_give_rep_to_self() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);

    // Should panic - cannot give reputation to self
    client.give_rep(&alice, &alice, &10);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_cannot_give_negative_rep() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // Should panic - amount must be positive
    client.give_rep(&alice, &bob, &-5);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_cannot_give_zero_rep() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // Should panic - amount must be positive
    client.give_rep(&alice, &bob, &0);
}

#[test]
fn test_permissionless_anyone_can_give_rep() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);
    let diana = Address::generate(&env);

    // Anyone can give reputation to anyone - no permission needed
    client.give_rep(&alice, &bob, &1);
    client.give_rep(&charlie, &bob, &2);
    client.give_rep(&diana, &bob, &3);

    assert_eq!(client.get_rep(&bob), 6);
    assert_eq!(client.get_given_rep(&alice), 1);
    assert_eq!(client.get_given_rep(&charlie), 2);
    assert_eq!(client.get_given_rep(&diana), 3);
}
