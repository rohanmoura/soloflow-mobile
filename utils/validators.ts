import { z } from 'zod';

export const transactionSchema = z.object({
  title: z.string().trim().min(2, 'Add a clear title').max(80),
  amount: z.number().positive('Amount must be greater than zero').max(1000000),
  category: z.string().trim().min(1, 'Choose a category'),
  clientId: z.string().optional(),
  notes: z.string().max(280).optional(),
});

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Add the client name').max(60),
  company: z.string().trim().min(2, 'Add a company or client type').max(80),
  email: z.string().trim().email('Add a valid email'),
  phone: z.string().trim().min(8, 'Add a valid phone number').max(24),
  category: z.string().trim().min(2, 'Add a client category').max(50),
});

export const invoiceSchema = z.object({
  clientId: z.string().trim().min(1, 'Choose a client'),
  service: z.string().trim().min(2, 'Add the service or deliverable').max(90),
  amount: z.number().positive('Amount must be greater than zero').max(1000000),
  dueDate: z.string().trim().min(8, 'Use YYYY-MM-DD date'),
  notes: z.string().max(280).optional(),
});
