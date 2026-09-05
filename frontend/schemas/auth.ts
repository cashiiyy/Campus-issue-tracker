import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid university email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid university or personal email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters."),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
