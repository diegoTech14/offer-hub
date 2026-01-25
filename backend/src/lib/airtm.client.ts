/**
 * @fileoverview Airtm Client for interacting with Airtm API
 */

import { InternalServerError } from "../utils/AppError";

// Placeholder for Airtm Client
// In a real implementation, this would likely use axios/fetch to call Airtm API
export class AirtmUserClient {
    /**
     * Verifies if a user is eligible for withdrawals on Airtm
     * @param email - The email to check
     * @returns boolean indicating eligibility
     */
    async verifyUserEligibility(email: string): Promise<boolean> {
        try {
            // Logic to call Airtm API would go here
            // For now, we mock/stub it to return true as we don't have actual credentials/API
            // In a real app, this would probably be:
            // const response = await axios.get(...)
            // return response.data.isEligible;

            // We assume valid email format check is done before or here
            if (!email || !email.includes('@')) {
                return false;
            }

            return true;
        } catch (error: any) {
            throw new InternalServerError(`Airtm verification failed: ${error.message}`);
        }
    }
}

export const airtmUserClient = new AirtmUserClient();
