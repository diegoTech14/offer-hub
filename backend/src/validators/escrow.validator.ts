import { z } from 'zod';

export const initializeEscrowSchema = z.object({
    client: z.string().min(56).max(56),
    freelancer: z.string().min(56).max(56),
    amount: z.number().positive(),
    deadline: z.number().int().positive()
});

export const getEscrowsByRoleSchema = z.object({
    role: z.enum(['client', 'freelancer', 'marker', 'approver', 'releaser', 'resolver', 'platformAddress']),
    roleAddress: z.string().min(56).max(56)
});

export type InitializeEscrowInput = z.infer<typeof initializeEscrowSchema>;
export type GetEscrowsByRoleInput = z.infer<typeof getEscrowsByRoleSchema>;
