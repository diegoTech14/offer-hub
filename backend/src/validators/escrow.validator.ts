import { z } from "zod";

export const initializeEscrowSchema = z.object({
  client: z.string().min(56).max(56),
  freelancer: z.string().min(56).max(56),
  amount: z.number().positive(),
  deadline: z.number().int().positive(),
});

export type InitializeEscrowInput = z.infer<typeof initializeEscrowSchema>;

export const getEscrowBalancesSchema = z.object({
  addresses: z.array(z.string().min(56)).min(1),
});

export type GetEscrowBalancesInput = z.infer<typeof getEscrowBalancesSchema>;
