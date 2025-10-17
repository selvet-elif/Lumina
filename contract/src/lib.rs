#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TipData {
    pub sender: Address,
    pub receiver: Address,
    pub amount: u32,
    pub tx_id: BytesN<32>,
}

#[contract]
pub struct LuminaContract;

#[contractimpl]
impl LuminaContract {
    /// Send a tip and store the transaction data
    pub fn send_tip(env: &Env, sender: Address, receiver: Address, amount: u32, tx_id: BytesN<32>) -> bool {
        // Store tip data
        let tip_data = TipData {
            sender: sender.clone(),
            receiver: receiver.clone(),
            amount,
            tx_id: tx_id.clone(),
        };

        // Get storage instance
        let storage = env.storage().persistent();
        
        // Increment total tips counter
        let total_tips: u32 = storage.get(&"total_tips").unwrap_or(0);
        storage.set(&"total_tips", &(total_tips + 1));

        // Store last tipper
        storage.set(&"last_tipper", &sender);

        // Store last transaction ID
        storage.set(&"last_tx_id", &tx_id);

        // Store individual tip data using simple key
        storage.set(&total_tips, &tip_data);

        true
    }

    /// Get the total number of tips sent
    pub fn get_total_tipped(env: &Env) -> u32 {
        let storage = env.storage().persistent();
        storage.get(&"total_tips").unwrap_or(0)
    }

    /// Get the address of the last person who sent a tip
    pub fn get_last_tipper(env: &Env) -> Address {
        let storage = env.storage().persistent();
        storage.get(&"last_tipper").unwrap_or_else(|| {
            Address::from_string(&String::from_str(&env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"))
        })
    }

    /// Get the transaction ID of the last tip
    pub fn get_last_tx_id(env: &Env) -> BytesN<32> {
        let storage = env.storage().persistent();
        storage.get(&"last_tx_id").unwrap_or(BytesN::from_array(&env, &[0u8; 32]))
    }

    /// Get tip data by index
    pub fn get_tip(env: &Env, index: u32) -> TipData {
        let storage = env.storage().persistent();
        storage.get(&index).unwrap_or_else(|| TipData {
            sender: Address::from_string(&String::from_str(&env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")),
            receiver: Address::from_string(&String::from_str(&env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")),
            amount: 0,
            tx_id: BytesN::from_array(&env, &[0u8; 32]),
        })
    }
}