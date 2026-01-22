# Instrucciones para Ejecutar el Contrato Project Publication

Estas instrucciones te guían paso a paso para compilar, desplegar e inicializar el contrato usando **solamente comandos de `stellar-cli`**.

## Prerrequisitos

1. **Instalar Stellar CLI:**
```bash
cargo install --locked stellar-cli
```

2. **Verificar instalación:**
```bash
stellar --version
```

## Paso 1: Configurar la Red Testnet

Configura la conexión a la red de testnet de Stellar:

```bash
stellar config network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443/soroban/rpc \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Paso 2: Crear y Configurar una Cuenta Admin

1. **Generar una identidad admin:**
```bash
stellar config identity generate --global admin
```

2. **Obtener la dirección de la cuenta admin:**
```bash
stellar config identity address admin
```

Guarda esta dirección, la necesitarás para inicializar el contrato.

3. **Fondear la cuenta desde friendbot:**
```bash
curl "https://friendbot.stellar.org/?addr=$(stellar config identity address admin)"
```

Espera unos segundos para que la transacción se procese.

## Paso 3: Compilar el Contrato

Navega al directorio del contrato y compila usando Stellar CLI:

```bash
cd contracts-offerhub/contracts/project-publication-contract
stellar contract build
```

Esto compilará el contrato y generará el archivo WASM en:
`target/wasm32-unknown-unknown/release/project_publication_contract.wasm`

## Paso 4: Desplegar el Contrato

Despliega el contrato compilado a la red testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/project_publication_contract.wasm \
  --source admin \
  --network testnet
```

**Guarda el CONTRACT_ID que se muestra en la salida.** Lo necesitarás para todas las operaciones futuras.

Ejemplo de salida:
```
Contract ID: C1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCD
```

## Paso 5: Inicializar el Contrato

Inicializa el contrato con la dirección admin:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar config identity address admin)
```

Reemplaza `<CONTRACT_ID>` con el ID que obtuviste en el paso anterior.

Si todo sale bien, verás una salida exitosa sin errores.

## Paso 6: Verificar que el Contrato Funciona

### Prueba 1: Registrar un Proyecto

Registra una publicación de proyecto de prueba:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  record_project \
  --caller $(stellar config identity address admin) \
  --client_id $(stellar config identity address admin) \
  --project_id "test-project-001" \
  --timestamp $(date +%s)
```

Esto registrará un proyecto con:
- `client_id`: Tu dirección admin (puedes usar cualquier dirección Stellar válida)
- `project_id`: "test-project-001"
- `timestamp`: Timestamp actual en segundos

### Prueba 2: Obtener el Registro del Proyecto

Consulta el registro que acabas de crear:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  get_project_record \
  --project_id "test-project-001"
```

Deberías ver los datos del proyecto registrado:
- `client_id`: La dirección del cliente
- `project_id`: "test-project-001"
- `timestamp`: El timestamp que proporcionaste
- `recorded_at`: El timestamp del ledger cuando se registró

## Solución de Problemas

### Error: "Contract not found"
- Verifica que el CONTRACT_ID sea correcto
- Asegúrate de haber desplegado el contrato correctamente

### Error: "Not initialized"
- Ejecuta el paso 5 (inicialización) primero

### Error: "Already initialized"
- El contrato ya fue inicializado. No puedes inicializarlo dos veces.

### Error: "Unauthorized"
- Solo el admin puede registrar proyectos
- Verifica que estés usando `--source admin` y que la dirección admin sea correcta

### Error: "Project already recorded"
- El `project_id` que intentas usar ya existe
- Usa un `project_id` diferente

## Variables de Entorno para el Backend

Una vez que tengas el CONTRACT_ID, agrega estas variables a tu archivo `.env` del backend:

```bash
PROJECT_PUBLICATION_CONTRACT_ID=<TU_CONTRACT_ID>
STELLAR_ADMIN_SECRET_KEY=<TU_SECRET_KEY_ADMIN>
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

Para obtener tu secret key admin:
```bash
stellar config identity show admin
```

## Comandos Útiles

**Ver todas las identidades configuradas:**
```bash
stellar config identity list
```

**Ver configuración de red:**
```bash
stellar config network list
```

**Ver detalles de una identidad:**
```bash
stellar config identity show admin
```

**Obtener solo la dirección:**
```bash
stellar config identity address admin
```

---

¡Listo! Ahora tu contrato está desplegado y funcionando en la red testnet de Stellar.
