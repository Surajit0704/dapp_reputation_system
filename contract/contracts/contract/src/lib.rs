#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Reputations, // Map<Address, i128> - total reputation received
    GivenRep,    // Map<Address, i128> - total reputation given by each
    Votes,       // Map<(from, to), i128> - vote amounts between pairs
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Give reputation to another address. Fully permissionless.
    /// Anyone can call this to give reputation to any address.
    pub fn give_rep(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        assert!(from != to, "cannot give rep to yourself");

        // Update total reputation received by 'to'
        let mut reps: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Reputations)
            .unwrap_or_else(|| Map::new(&env));
        let current_rep = reps.get(to.clone()).unwrap_or(0);
        reps.set(to.clone(), current_rep + amount);
        env.storage().persistent().set(&DataKey::Reputations, &reps);

        // Update total reputation given by 'from'
        let mut given: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::GivenRep)
            .unwrap_or_else(|| Map::new(&env));
        let current_given = given.get(from.clone()).unwrap_or(0);
        given.set(from.clone(), current_given + amount);
        env.storage().persistent().set(&DataKey::GivenRep, &given);

        // Track vote amount between this pair
        let mut votes: Map<(Address, Address), i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Votes)
            .unwrap_or_else(|| Map::new(&env));
        let vote_key = (from.clone(), to.clone());
        let current_vote = votes.get(vote_key.clone()).unwrap_or(0);
        votes.set(vote_key, current_vote + amount);
        env.storage().persistent().set(&DataKey::Votes, &votes);
    }

    /// Get total reputation received by an address
    pub fn get_rep(env: Env, address: Address) -> i128 {
        let reps: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Reputations)
            .unwrap_or_else(|| Map::new(&env));
        reps.get(address).unwrap_or(0)
    }

    /// Get total reputation given by an address
    pub fn get_given_rep(env: Env, address: Address) -> i128 {
        let given: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::GivenRep)
            .unwrap_or_else(|| Map::new(&env));
        given.get(address).unwrap_or(0)
    }

    /// Get reputation given from one address to another
    pub fn get_vote(env: Env, from: Address, to: Address) -> i128 {
        let votes: Map<(Address, Address), i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Votes)
            .unwrap_or_else(|| Map::new(&env));
        votes.get((from, to)).unwrap_or(0)
    }
}

mod test;
