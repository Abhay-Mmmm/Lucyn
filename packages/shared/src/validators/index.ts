import { z } from 'zod';

// ============================================
// Auth Validators
// ============================================

// Password must have: 8+ chars, uppercase, lowercase, number, special char
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to validate password and return all errors
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('One number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('One special character (!@#$%^&*)');
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================
// Task Validators
// ============================================

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedHours: z.number().positive().optional(),
  requiredSkills: z.array(z.string()).optional(),
  complexity: z.number().min(1).max(10).optional(),
  dueDate: z.string().datetime().optional(),
  repositoryId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  actualHours: z.number().positive().optional(),
});

// ============================================
// Settings Validators
// ============================================

export const userSettingsSchema = z.object({
  feedbackEnabled: z.boolean().optional(),
  feedbackFrequency: z.enum(['realtime', 'daily', 'weekly']).optional(),
  timezone: z.string().optional(),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().optional(),
  logoUrl: z.string().url().optional(),
  settings: z.object({
    features: z.object({
      discordIntegration: z.boolean().optional(),
      githubIntegration: z.boolean().optional(),
      meetingIntegration: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// ============================================
// Query Validators
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const dashboardQuerySchema = paginationSchema.merge(dateRangeSchema).extend({
  repositoryId: z.string().optional(),
  userId: z.string().optional(),
});

// ============================================
// Webhook Validators
// ============================================

export const githubWebhookSchema = z.object({
  action: z.string().optional(),
  repository: z.object({
    id: z.number(),
    full_name: z.string(),
    name: z.string(),
  }).optional(),
  sender: z.object({
    id: z.number(),
    login: z.string(),
  }).optional(),
  installation: z.object({
    id: z.number(),
  }).optional(),
});

export const discordEventSchema = z.object({
  type: z.number(), // Discord interaction type
  id: z.string(),
  application_id: z.string(),
  guild_id: z.string().optional(),
  channel_id: z.string().optional(),
  data: z.object({
    name: z.string().optional(),
    type: z.number().optional(),
    options: z.array(z.any()).optional(),
  }).optional(),
});

// ============================================
// Type Exports
// ============================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
