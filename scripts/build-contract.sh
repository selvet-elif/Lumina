#!/bin/bash

# Build script for Lumina Soroban contract

echo "🔨 Building Lumina contract..."

# Navigate to contract directory
cd contract

# Build the contract
cargo build --target wasm32-unknown-unknown --release

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    echo "📁 Output: target/wasm32-unknown-unknown/release/lumina_contract.wasm"
    echo ""
    echo "🚀 To deploy to testnet, run:"
    echo "stellar contract deploy \\"
    echo "  --wasm target/wasm32-unknown-unknown/release/lumina_contract.wasm \\"
    echo "  --source alice \\"
    echo "  --network testnet \\"
    echo "  --alias lumina_contract"
else
    echo "❌ Build failed!"
    exit 1
fi

