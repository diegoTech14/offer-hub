/**
 * @fileoverview Airtm Payout Client for handling external payouts
 */

import { logger } from "@/utils/logger";

export interface AirtmPayoutResponse {
    id: string;
    status: string;
    amount: number;
    currency: string;
}

export class AirtmPayoutClient {
    /**
     * Creates a payout in Airtm
     * @param withdrawalId - Internal withdrawal ID for reference
     * @param amount - Amount to payout
     * @param email - User's Airtm email
     * @returns Airtm payout response with ID
     */
    async createPayout(withdrawalId: string, amount: number, email: string): Promise<AirtmPayoutResponse> {
        logger.info(`[AirtmPayoutClient] Creating payout for withdrawal ${withdrawalId}`);

        // In a real implementation, this would call Airtm API
        // For now, we return a mock response or throw error if configured
        return {
            id: `airtm_payout_${crypto.randomUUID()}`,
            status: 'PENDING',
            amount,
            currency: 'USD'
        };
    }

    /**
     * Commits (confirms) a previously created payout in Airtm
     * @param payoutId - Airtm payout ID
     * @returns Airtm payout response
     */
    async commitPayout(payoutId: string): Promise<AirtmPayoutResponse> {
        logger.info(`[AirtmPayoutClient] Committing payout ${payoutId}`);

        return {
            id: payoutId,
            status: 'COMMITTED',
            amount: 0, // In reality, this would be the actual amount
            currency: 'USD'
        };
    }
}

export const airtmPayoutClient = new AirtmPayoutClient();
