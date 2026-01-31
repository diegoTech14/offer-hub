/**
 * Stellar Contract Clients Test Script
 * 
 * This script verifies that the Stellar contract client factory and bindings
 * are properly configured and can be initialized.
 * 
 * Usage:
 *   1. Ensure contracts are deployed and contract IDs are set in .env
 *   2. Ensure bindings are generated: pnpm run bindings:generate
 *   3. Run: npx ts-node -r tsconfig-paths/register src/test-stellar-clients.ts
 * 
 * Requirements:
 *   - STELLAR_BACKEND_SECRET_KEY set in .env
 *   - ESCROW_FACTORY_CONTRACT_ID set in .env
 *   - FEE_MANAGER_CONTRACT_ID set in .env
 *   - USER_REGISTRY_CONTRACT_ID set in .env
 *   - Bindings generated in packages/
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import {
  getStellarContractConfig,
  validateStellarContractConfig,
} from "./config/stellar-contracts";
import { getStellarClientFactory } from "./services/stellar";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function logSection(title: string) {
  console.log("");
  log("═".repeat(60), colors.cyan);
  log(title, colors.cyan + colors.bright);
  log("═".repeat(60), colors.cyan);
}

async function testConfiguration() {
  logSection("Testing Configuration");
  
  try {
    // Get configuration
    const config = getStellarContractConfig();
    logSuccess("Configuration loaded successfully");
    
    // Display configuration (without secrets)
    logInfo(`Network: ${config.network}`);
    logInfo(`RPC URL: ${config.rpcUrl}`);
    logInfo(`Network Passphrase: ${config.networkPassphrase.substring(0, 20)}...`);
    
    // Validate configuration
    const validation = validateStellarContractConfig(config);
    
    if (validation.valid) {
      logSuccess("Configuration validation passed");
      return true;
    } else {
      logError("Configuration validation failed:");
      validation.errors.forEach((error) => {
        logError(`  - ${error}`);
      });
      return false;
    }
  } catch (error) {
    logError(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function testClientFactory() {
  logSection("Testing Client Factory");
  
  try {
    const factory = getStellarClientFactory();
    logSuccess("Client factory instance created");
    
    // Test network config
    const networkConfig = factory.getNetworkConfig();
    logSuccess(`Network config accessible: ${networkConfig.network}`);
    
    // Test signer public key
    const publicKey = factory.getSignerPublicKey();
    logSuccess(`Signer public key: ${publicKey.substring(0, 10)}...`);
    
    return true;
  } catch (error) {
    logError(`Failed to create client factory: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function testEscrowFactoryClient() {
  logSection("Testing Escrow Factory Client");
  
  try {
    const factory = getStellarClientFactory();
    
    logInfo("Attempting to initialize Escrow Factory client...");
    const escrowClient = await factory.getEscrowFactory();
    
    if (escrowClient) {
      logSuccess("Escrow Factory client initialized successfully");
      logInfo("Client methods available:");
      
      // List available methods (if client has them)
      if (typeof escrowClient === "object") {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(escrowClient))
          .filter(name => name !== "constructor" && typeof (escrowClient as any)[name] === "function");
        
        if (methods.length > 0) {
          methods.slice(0, 5).forEach(method => {
            logInfo(`  - ${method}()`);
          });
          if (methods.length > 5) {
            logInfo(`  ... and ${methods.length - 5} more`);
          }
        }
      }
      
      return true;
    } else {
      logError("Client was initialized but is null/undefined");
      return false;
    }
  } catch (error) {
    logError(`Failed to initialize Escrow Factory client: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      logWarning("Hint: Run 'pnpm run bindings:generate' to generate the bindings");
    }
    
    return false;
  }
}

async function testFeeManagerClient() {
  logSection("Testing Fee Manager Client");
  
  try {
    const factory = getStellarClientFactory();
    
    logInfo("Attempting to initialize Fee Manager client...");
    const feeClient = await factory.getFeeManager();
    
    if (feeClient) {
      logSuccess("Fee Manager client initialized successfully");
      return true;
    } else {
      logError("Client was initialized but is null/undefined");
      return false;
    }
  } catch (error) {
    logError(`Failed to initialize Fee Manager client: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      logWarning("Hint: Run 'pnpm run bindings:generate' to generate the bindings");
    }
    
    return false;
  }
}

async function testUserRegistryClient() {
  logSection("Testing User Registry Client");
  
  try {
    const factory = getStellarClientFactory();
    
    logInfo("Attempting to initialize User Registry client...");
    const userClient = await factory.getUserRegistry();
    
    if (userClient) {
      logSuccess("User Registry client initialized successfully");
      return true;
    } else {
      logError("Client was initialized but is null/undefined");
      return false;
    }
  } catch (error) {
    logError(`Failed to initialize User Registry client: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      logWarning("Hint: Run 'pnpm run bindings:generate' to generate the bindings");
    }
    
    return false;
  }
}

async function runTests() {
  log("", colors.reset);
  log("╔════════════════════════════════════════════════════════════╗", colors.bright);
  log("║       Stellar Contract Clients Test Suite                 ║", colors.bright);
  log("╚════════════════════════════════════════════════════════════╝", colors.bright);
  
  const results = {
    configuration: false,
    clientFactory: false,
    escrowFactory: false,
    feeManager: false,
    userRegistry: false,
  };
  
  // Run tests
  results.configuration = await testConfiguration();
  
  if (results.configuration) {
    results.clientFactory = await testClientFactory();
    
    if (results.clientFactory) {
      results.escrowFactory = await testEscrowFactoryClient();
      results.feeManager = await testFeeManagerClient();
      results.userRegistry = await testUserRegistryClient();
    }
  }
  
  // Summary
  logSection("Test Summary");
  
  const tests = [
    { name: "Configuration", passed: results.configuration },
    { name: "Client Factory", passed: results.clientFactory },
    { name: "Escrow Factory Client", passed: results.escrowFactory },
    { name: "Fee Manager Client", passed: results.feeManager },
    { name: "User Registry Client", passed: results.userRegistry },
  ];
  
  tests.forEach(test => {
    if (test.passed) {
      logSuccess(`${test.name}: PASSED`);
    } else {
      logError(`${test.name}: FAILED`);
    }
  });
  
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log("");
  log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`, colors.bright);
  
  if (failedTests === 0) {
    console.log("");
    logSuccess("All tests passed! ✨");
    logInfo("Your Stellar contract client setup is working correctly.");
    logInfo("You can now use contract clients in your backend services.");
    process.exit(0);
  } else {
    console.log("");
    logError("Some tests failed. Please review the errors above.");
    logInfo("\nCommon solutions:");
    logInfo("1. Ensure contracts are deployed and contract IDs are in .env");
    logInfo("2. Run: pnpm run bindings:generate");
    logInfo("3. Check docs/STELLAR_BINDINGS.md for detailed setup guide");
    process.exit(1);
  }
}

// Run the test suite
runTests().catch(error => {
  logError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
