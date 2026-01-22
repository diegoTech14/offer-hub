import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { initializeEscrowSchema } from '../validators/escrow.validator';
import { ValidationError, InternalServerError, AppError } from '../utils/AppError';

export const initializeSingleRelease = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationResult = initializeEscrowSchema.safeParse(req.body);

        if (!validationResult.success) {
            // Mapping Zod errors to the expected format if possible, or just passing them as details
            throw new ValidationError('Validation Error', (validationResult.error as any).errors);
        }

        const { client, freelancer, amount, deadline } = validationResult.data;

        const apiKey = process.env.TRUSTLESSWORK_API_KEY;
        const apiUrl = process.env.TRUSTLESSWORK_API_URL || 'https://dev.api.trustlesswork.com';

        if (!apiKey) {
            throw new InternalServerError('Server Misconfiguration: Missing TrustlessWork API Key');
        }

        try {
            const response = await axios.post(
                `${apiUrl}/deployer/single-release`,
                { client, freelancer, amount, deadline },
                { headers: { 'x-api-key': apiKey } }
            );

            res.json({ unsignedTransaction: response.data.unsignedTransaction });
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                // Forwarding external API error with its status code and message
                throw new AppError(error.response.data?.message || 'External API Error', error.response.status, 'EXTERNAL_API_ERROR', error.response.data);
            }
            throw new InternalServerError('Failed to initialize escrow with TrustlessWork API', error.message);
        }

    } catch (error) {
        next(error);
    }
};
