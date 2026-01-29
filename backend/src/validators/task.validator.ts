import { z } from 'zod';

export const createTaskRecordSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  freelancer_id: z.string().uuid('Invalid freelancer ID format'),
  completed: z.boolean(),
  outcome_description: z.string().min(1).max(1000).optional()
});

export type CreateTaskRecordInput = z.infer<typeof createTaskRecordSchema>;

export const validateCreateTaskRecord = (data: unknown) => {
  return createTaskRecordSchema.safeParse(data);
};