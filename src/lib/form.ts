/**
 * Form utilities and schema definitions using React Hook Form + Zod
 */

import { z } from 'zod';

// Re-export commonly used items for convenience
export { z } from 'zod';
export { useForm, useFormContext, FormProvider, Controller } from 'react-hook-form';
export { zodResolver } from '@hookform/resolvers/zod';

// Type helper to infer form data from a Zod schema
export type FormData<T extends z.ZodTypeAny> = z.infer<T>;

// Common validation patterns
export const validationPatterns = {
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
  aadhaar: z.string().regex(/^\d{12}$/, 'Please enter a valid 12-digit Aadhaar number'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'),
  accountNumber: z.string().min(9, 'Account number must be at least 9 digits').max(18, 'Account number must be at most 18 digits'),
} as const;

// Common reusable schemas
export const commonSchemas = {
  // Amount in INR (for purchases, gifts, etc.)
  inrAmount: (min: number, max: number) =>
    z.number()
      .min(min, `Minimum amount is ₹${min.toLocaleString('en-IN')}`)
      .max(max, `Maximum amount is ₹${max.toLocaleString('en-IN')}`),

  // Amount in grams
  gramsAmount: (min: number, max: number) =>
    z.number()
      .min(min, `Minimum is ${min}g`)
      .max(max, `Maximum is ${max}g`),

  // Optional text with max length
  optionalText: (maxLength: number) =>
    z.string().max(maxLength, `Maximum ${maxLength} characters`).optional().or(z.literal('')),

  // Required non-empty string
  requiredString: (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`).trim(),
} as const;

// Form error message helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
