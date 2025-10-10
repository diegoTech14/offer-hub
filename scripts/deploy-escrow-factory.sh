#!/bin/bash

# Script para desplegar el Escrow Factory
set -e

echo "🚀 Deploying Escrow Factory Contract..."
echo "======================================"

# Configuración
NETWORK="futurenet"
SOURCE_ACCOUNT="admin"
WASM_FILE="/Users/kevinbrenes/offer-hub/contracts-offerhub/target/wasm32v1-none/release/escrow_factory.wasm"

# Verificar que el archivo WASM existe
if [ ! -f "$WASM_FILE" ]; then
    echo "❌ Error: WASM file not found at $WASM_FILE"
    exit 1
fi

echo "📁 WASM File: $WASM_FILE"

# Intentar desplegar con diferentes enfoques
echo "🔄 Attempting deployment..."

# Método 1: Usar stellar con --wasm
echo "Método 1: stellar contract deploy --wasm"
if stellar contract deploy --wasm "$WASM_FILE" --source-account "$SOURCE_ACCOUNT" --network "$NETWORK"; then
    echo "✅ Success with Method 1"
    exit 0
fi

# Método 2: Usar soroban con --wasm
echo "Método 2: soroban contract deploy --wasm"
if soroban contract deploy --wasm "$WASM_FILE" --source "$SOURCE_ACCOUNT" --network "$NETWORK"; then
    echo "✅ Success with Method 2"
    exit 0
fi

# Método 3: Usar stellar con --wasm-hash
echo "Método 3: stellar contract deploy --wasm-hash"
WASM_HASH="f684a1a4610390cc8c4e6e5945b9fe1e90f064974dd125b7378351860f749883"
if stellar contract deploy --wasm-hash "$WASM_HASH" --source-account "$SOURCE_ACCOUNT" --network "$NETWORK"; then
    echo "✅ Success with Method 3"
    exit 0
fi

# Método 4: Usar soroban con --wasm-hash
echo "Método 4: soroban contract deploy --wasm-hash"
if soroban contract deploy --wasm-hash "$WASM_HASH" --source "$SOURCE_ACCOUNT" --network "$NETWORK"; then
    echo "✅ Success with Method 4"
    exit 0
fi

echo "❌ All deployment methods failed"
exit 1
