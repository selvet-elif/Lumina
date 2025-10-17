# Lumina Soroban Contract

This is a simple Soroban smart contract for the Lumina tipping dApp.

## Contract Functions

- `send_tip(sender, receiver, amount, tx_id)` - Records a tip transaction
- `get_total_tipped()` - Returns total number of tips sent
- `get_last_tipper()` - Returns address of last tipper
- `get_last_tx_id()` - Returns transaction ID of last tip
- `get_tip(index)` - Returns tip data by index

## Building the Contract

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

## Deploying to Testnet

After building, deploy using the stellar-cli:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/lumina_contract.wasm \
  --source alice \
  --network testnet \
  --alias lumina_contract
```

This will return a contract ID that you'll need to use in the frontend integration.

