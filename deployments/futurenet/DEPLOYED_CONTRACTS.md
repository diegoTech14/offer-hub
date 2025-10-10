# 🎉 Contratos Desplegados en Futurenet

## ✅ 9 Contratos Desplegados Exitosamente

### Fecha de Despliegue
**10 de Octubre, 2025**

### Network
**Futurenet** - Test SDF Future Network ; October 2022

---

## 📋 Direcciones de Contratos

### Core Contracts

#### 1. User Registry Contract
**ID**: `CCNJLJQ3MVJFCH2WANRBUZUQWP5FXVAW2IFGL2ZWG6O2ZEMCAIB5KDBZ`
**Funciones**: Gestión de usuarios, verificación, perfiles

#### 2. Fee Manager Contract
**ID**: `CA4Y644PP6E4Z47RM2BNZ774RIVMLSTBNKAOJE76UEUFHQJPWWOK2WIJ`
**Funciones**: Gestión de comisiones y tarifas

---

### Publication & Rating System

#### 3. Publication Contract
**ID**: `CBWKAGSMAAVETQEQRMAWSUUUOJZSJE6RBYSMWIVHSU6YEJEHAESCUFT3`
**Funciones**: Publicación de servicios y proyectos

#### 4. Rating Contract
**ID**: `CC5PNC7RNHE4E7VWBJ7BY45GS2GPESFVDDLWVGCRHYPGJHN3JIBW6GBN`
**Funciones**: Sistema de calificaciones y reviews

#### 5. Reputation NFT Contract
**ID**: `CB6DN3QUYKFWG3C7IW7HWIOJTKTBLJHHLXJSYKMK3VM7ZKSMUNMVAMM6`
**Funciones**: NFTs de reputación basados en ratings

---

### Escrow System

#### 6. Escrow Contract
**ID**: `CAJSICKVQXMC7FJLJE7W2KIFQKJM4DTWVJ6CKVKW2CM7OZIR4O2BVPOV`
**Funciones**: Gestión de escrows y pagos por hitos
**Estado**: ✅ Redesplegado (contrato anterior tenía problemas)

#### 7. Escrow Factory Contract
**ID**: `CBAU2NA76ZKABQGUK2XJPQ5NIT5HJ3XG42H2SWWADCBXKRZD6ZH35UTF`
**Funciones**: Factory para crear múltiples escrows, operaciones batch
**Nota**: Requiere el wasm_hash del Escrow Contract en el constructor

---

### Dispute & Emergency

#### 8. Dispute Contract
**ID**: `CDX5PUEYKS3QRGRQPCRUR7EKJBXKU77HPCFISCMXSZD7A4M235FOTXXF`
**Funciones**: Resolución de disputas y arbitraje

#### 9. Emergency Contract
**ID**: `CCWSE5M2XSZU7HZ4MH6BNGLS5LOJEDCJQ7SNASOS2VINRTMRTSI3LGOE`
**Funciones**: Procedimientos de emergencia y recuperación

---

## 🔧 Configuración para el Frontend

### Archivo .env
```bash
# OfferHub Contract Addresses - Futurenet

# Core Contracts
VITE_USER_REGISTRY_CONTRACT_ID="CCNJLJQ3MVJFCH2WANRBUZUQWP5FXVAW2IFGL2ZWG6O2ZEMCAIB5KDBZ"
VITE_FEE_MANAGER_CONTRACT_ID="CA4Y644PP6E4Z47RM2BNZ774RIVMLSTBNKAOJE76UEUFHQJPWWOK2WIJ"

# Publication & Rating System
VITE_PUBLICATION_CONTRACT_ID="CBWKAGSMAAVETQEQRMAWSUUUOJZSJE6RBYSMWIVHSU6YEJEHAESCUFT3"
VITE_RATING_CONTRACT_ID="CC5PNC7RNHE4E7VWBJ7BY45GS2GPESFVDDLWVGCRHYPGJHN3JIBW6GBN"
VITE_REPUTATION_CONTRACT_ID="CB6DN3QUYKFWG3C7IW7HWIOJTKTBLJHHLXJSYKMK3VM7ZKSMUNMVAMM6"

# Escrow System
VITE_ESCROW_CONTRACT_ID="CAJSICKVQXMC7FJLJE7W2KIFQKJM4DTWVJ6CKVKW2CM7OZIR4O2BVPOV"
VITE_ESCROW_FACTORY_CONTRACT_ID="CBAU2NA76ZKABQGUK2XJPQ5NIT5HJ3XG42H2SWWADCBXKRZD6ZH35UTF"

# Dispute & Emergency
VITE_DISPUTE_CONTRACT_ID="CDX5PUEYKS3QRGRQPCRUR7EKJBXKU77HPCFISCMXSZD7A4M235FOTXXF"
VITE_EMERGENCY_CONTRACT_ID="CCWSE5M2XSZU7HZ4MH6BNGLS5LOJEDCJQ7SNASOS2VINRTMRTSI3LGOE"

# Network Configuration
VITE_SOROBAN_NETWORK="futurenet"
VITE_ADMIN_ADDRESS="GCNBMXP33TL2QPYMRTHVZOWNINZOGFJQEOPWVCYU3XDGOCH3TICREXLM"
```

### Archivo TypeScript
```typescript
export const CONTRACT_ADDRESSES = {
  // Core Contracts
  USER_REGISTRY: "CCNJLJQ3MVJFCH2WANRBUZUQWP5FXVAW2IFGL2ZWG6O2ZEMCAIB5KDBZ",
  FEE_MANAGER: "CA4Y644PP6E4Z47RM2BNZ774RIVMLSTBNKAOJE76UEUFHQJPWWOK2WIJ",
  
  // Publication & Rating System
  PUBLICATION: "CBWKAGSMAAVETQEQRMAWSUUUOJZSJE6RBYSMWIVHSU6YEJEHAESCUFT3",
  RATING: "CC5PNC7RNHE4E7VWBJ7BY45GS2GPESFVDDLWVGCRHYPGJHN3JIBW6GBN",
  REPUTATION: "CB6DN3QUYKFWG3C7IW7HWIOJTKTBLJHHLXJSYKMK3VM7ZKSMUNMVAMM6",
  
  // Escrow System
  ESCROW: "CAJSICKVQXMC7FJLJE7W2KIFQKJM4DTWVJ6CKVKW2CM7OZIR4O2BVPOV",
  ESCROW_FACTORY: "CBAU2NA76ZKABQGUK2XJPQ5NIT5HJ3XG42H2SWWADCBXKRZD6ZH35UTF",
  
  // Dispute & Emergency
  DISPUTE: "CDX5PUEYKS3QRGRQPCRUR7EKJBXKU77HPCFISCMXSZD7A4M235FOTXXF",
  EMERGENCY: "CCWSE5M2XSZU7HZ4MH6BNGLS5LOJEDCJQ7SNASOS2VINRTMRTSI3LGOE",
} as const;

export const NETWORK_CONFIG = {
  NETWORK: "futurenet",
  RPC_URL: "https://rpc-futurenet.stellar.org:443",
  NETWORK_PASSPHRASE: "Test SDF Future Network ; October 2022",
  ADMIN_ADDRESS: "GCNBMXP33TL2QPYMRTHVZOWNINZOGFJQEOPWVCYU3XDGOCH3TICREXLM",
} as const;
```

---

## 🚀 Cómo Usar los Contratos

### 1. Configurar tu Proyecto
Copia el contenido del archivo `.env` a tu proyecto frontend.

### 2. Importar los Hooks
```typescript
import { useOfferHub } from '@/hooks/contracts';

const { userRegistry, escrow, publication, rating, dispute } = useOfferHub();
```

### 3. Interactuar con los Contratos
```typescript
// Ejemplo: Verificar un usuario
await userRegistry.verifyUser(userAddress, verificationLevel);

// Ejemplo: Crear un escrow
await escrow.initializeEscrow(client, freelancer, amount);

// Ejemplo: Publicar un servicio
await publication.publish(user, type, title, category, amount, timestamp);
```

---

## 📝 Notas Importantes

1. **Network**: Los contratos están desplegados en **Futurenet**, no en Testnet
2. **SDK Version**: Usa `soroban-sdk = "22.0.0"` para compatibilidad
3. **Build Command**: Usa `soroban contract build` en lugar de `cargo build`
4. **Target**: Los contratos se compilan para `wasm32v1-none` en lugar de `wasm32-unknown-unknown`
5. **Escrow Factory**: Requiere el `wasm_hash` del Escrow Contract como argumento en el constructor
   - Wasm Hash del Escrow Contract: `7981095fe4572b27d9bd7dce0e3bd65127b331dbba97d008852ed445e42b4d1c`

---

## ✅ Próximos Pasos

1. ✅ Actualizar configuración del frontend con las nuevas direcciones
2. ✅ Probar interacciones con los contratos
3. ✅ Desplegar todos los 9 contratos (completado)
4. ⏳ Inicializar contratos con sus configuraciones (si es necesario)
5. ⏳ Configurar relaciones entre contratos (e.g., rating → reputation)
6. ⏳ Probar flujos completos end-to-end

---

## 🔍 Verificar Despliegue

Puedes verificar cualquier contrato con:
```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network futurenet \
  -- <FUNCTION_NAME>
```

Ejemplo:
```bash
soroban contract invoke \
  --id CCNJLJQ3MVJFCH2WANRBUZUQWP5FXVAW2IFGL2ZWG6O2ZEMCAIB5KDBZ \
  --source admin \
  --network futurenet \
  -- get_admin
```

---

## 🎉 ¡Despliegue Completado!

**¡TODOS LOS 9 CONTRATOS** de OfferHub han sido desplegados exitosamente en Futurenet y están listos para ser usados en tu aplicación frontend!

### 🔍 Solución del Problema del Escrow Factory:

El Escrow Factory requería el `wasm_hash` del Escrow Contract como argumento en su constructor `__constructor`. 

**Comando usado para desplegar:**
```bash
soroban contract deploy \
  --wasm contracts-offerhub/target/wasm32v1-none/release/escrow_factory.wasm \
  --source admin \
  --network futurenet \
  -- --wasm_hash 7981095fe4572b27d9bd7dce0e3bd65127b331dbba97d008852ed445e42b4d1c
```

Esto permite al factory crear nuevas instancias del contrato Escrow de manera eficiente.
