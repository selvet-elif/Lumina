@echo off

echo 🔨 Building Lumina contract...

cd contract

cargo build --target wasm32-unknown-unknown --release

if %errorlevel% equ 0 (
    echo ✅ Contract built successfully!
    echo 📁 Output: target/wasm32-unknown-unknown/release/lumina_contract.wasm
    echo.
    echo 🚀 To deploy to testnet, run:
    echo stellar contract deploy ^
    echo   --wasm target/wasm32-unknown-unknown/release/lumina_contract.wasm ^
    echo   --source alice ^
    echo   --network testnet ^
    echo   --alias lumina_contract
) else (
    echo ❌ Build failed!
    exit /b 1
)

