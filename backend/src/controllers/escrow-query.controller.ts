import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { getEscrowsByRoleSchema } from '../validators/escrow.validator';
import { ValidationError, InternalServerError, AppError } from '../utils/AppError';

export const getEscrowsByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationResult = getEscrowsByRoleSchema.safeParse(req.query);

        if (!validationResult.success) {
            throw new ValidationError('Validation Error', (validationResult.error as any).errors);
        }

        const { role, roleAddress } = validationResult.data;

        const apiKey = process.env.TRUSTLESSWORK_API_KEY;
        const apiUrl = process.env.TRUSTLESSWORK_API_URL || 'https://dev.api.trustlesswork.com';

        if (!apiKey) {
            throw new InternalServerError('Server Misconfiguration: Missing TrustlessWork API Key');
        }

        try {
            const response = await axios.get(
                `${apiUrl}/helper/get-escrows-by-role`,
                {
                    params: { role, roleAddress },
                    headers: { 'x-api-key': apiKey }
                }
            );

            res.json(response.data);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                throw new AppError(
                    error.response.data?.message || 'External API Error',
                    error.response.status,
                    'EXTERNAL_API_ERROR',
                    error.response.data
                );
            }
            throw new InternalServerError('Failed to fetch escrows from TrustlessWork API', error.message);
        }

    } catch (error) {
        next(error);
    }
};
