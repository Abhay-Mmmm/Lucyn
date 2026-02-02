import { z } from 'zod';

// ============================================
// Auth Validators
// ============================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

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
      slackIntegration: z.boolean().optional(),
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

export const slackEventSchema = z.object({
  type: z.string(),
  challenge: z.string().optional(),
  event: z.object({
    type: z.string(),
    user: z.string().optional(),
    channel: z.string().optional(),
    text: z.string().optional(),
    ts: z.string().optional(),
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
