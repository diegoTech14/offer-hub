/**
 * Stellar Contract IDs Configuration
 * 
 * IMPORTANT: Update these IDs after deploying your contracts.
 * 
 * To get contract IDs after deployment:
 * 1. Deploy your contracts to the Stellar network (testnet/mainnet)
 * 2. Copy the contract IDs (they start with 'C')
 * 3. Paste them here
 * 4. Run: pnpm run bindings:generate
 * 
 * Example Contract ID: CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K
 */

export const CONTRACT_IDS = {
  /**
   * Escrow Factory Contract
   * Deploys new escrow contracts for freelance projects
   */
  ESCROW_FACTORY: process.env.ESCROW_FACTORY_CONTRACT_ID || "",

  /**
   * Fee Manager Contract
   * Manages platform fees and fee distribution
   */
  FEE_MANAGER: process.env.FEE_MANAGER_CONTRACT_ID || "",

  /**
   * User Registry Contract
   * Manages user profiles and verification
   */
  USER_REGISTRY: process.env.USER_REGISTRY_CONTRACT_ID || "",
} as const;

/**
 * Validate that all contract IDs are set
 * @returns true if all IDs are configured
 */
export function validateContractIds(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!CONTRACT_IDS.ESCROW_FACTORY) {
    missing.push("ESCROW_FACTORY_CONTRACT_ID");
  }
  if (!CONTRACT_IDS.FEE_MANAGER) {
    missing.push("FEE_MANAGER_CONTRACT_ID");
  }
  if (!CONTRACT_IDS.USER_REGISTRY) {
    missing.push("USER_REGISTRY_CONTRACT_ID");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
