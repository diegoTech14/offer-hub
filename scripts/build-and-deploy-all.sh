#!/bin/bash

# Script para compilar y desplegar todos los contratos en Futurenet
set -e

echo "🚀 Building and Deploying All Contracts to Futurenet..."
echo "=========================================================="

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Crear directorio para guardar las direcciones
DEPLOY_DIR="/Users/kevinbrenes/offer-hub/deployments/futurenet"
mkdir -p "$DEPLOY_DIR"
DEPLOYMENT_FILE="$DEPLOY_DIR/contract-addresses-$(date +%Y%m%d-%H%M%S).txt"

# Array de contratos
contracts=(
  "user-registry-contract"
  "fee-manager-contract"
  "publication-contract"
  "rating-contract"
  "reputation-nft-contract"
  "escrow-contract"
  "escrow-factory"
  "dispute-contract"
  "emergency-contract"
)

# Compilar y desplegar cada contrato
for contract in "${contracts[@]}"; do
  echo -e "${BLUE}[INFO]${NC} Processing $contract..."
  
  # Compilar
  echo "  Building..."
  cd "/Users/kevinbrenes/offer-hub/contracts-offerhub/contracts/$contract"
  soroban contract build
  
  # Desplegar
  echo "  Deploying..."
  WASM_FILE="/Users/kevinbrenes/offer-hub/contracts-offerhub/target/wasm32v1-none/release/${contract//-/_}.wasm"
  CONTRACT_ID=$(soroban contract deploy \
    --wasm "$WASM_FILE" \
    --source admin \
    --network futurenet)
  
  echo -e "${GREEN}[SUCCESS]${NC} $contract deployed: $CONTRACT_ID"
  echo "$contract=$CONTRACT_ID" >> "$DEPLOYMENT_FILE"
  
  # Guardar en variable de entorno
  export "${contract//-/_}_ID=$CONTRACT_ID"
done

echo ""
echo "🎉 All contracts deployed successfully!"
echo "=========================================="
echo ""
echo "📋 Contract Addresses:"
cat "$DEPLOYMENT_FILE"
echo ""
echo "📁 Addresses saved to: $DEPLOYMENT_FILE"
echo ""

# Crear archivo .env
ENV_FILE="$DEPLOY_DIR/.env"
cat > "$ENV_FILE" << EOF
# OfferHub Contract Addresses - Deployed on $(date)
# Network: Futurenet

# Core Contracts
VITE_USER_REGISTRY_CONTRACT_ID="${user_registry_contract_ID}"
VITE_FEE_MANAGER_CONTRACT_ID="${fee_manager_contract_ID}"

# Publication & Rating System
VITE_PUBLICATION_CONTRACT_ID="${publication_contract_ID}"
VITE_RATING_CONTRACT_ID="${rating_contract_ID}"
VITE_REPUTATION_CONTRACT_ID="${reputation_nft_contract_ID}"

# Escrow System
VITE_ESCROW_CONTRACT_ID="${escrow_contract_ID}"
VITE_ESCROW_FACTORY_CONTRACT_ID="${escrow_factory_ID}"

# Dispute & Emergency
VITE_DISPUTE_CONTRACT_ID="${dispute_contract_ID}"
VITE_EMERGENCY_CONTRACT_ID="${emergency_contract_ID}"

# Network Configuration
VITE_SOROBAN_NETWORK="futurenet"
VITE_ADMIN_ADDRESS="$(soroban keys address admin)"
EOF

echo "📝 Environment file created: $ENV_FILE"
echo ""
echo "✅ Done! You can now use these contracts in your frontend."
