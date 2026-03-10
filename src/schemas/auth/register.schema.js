import { z } from 'zod';

export const registerSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    firstname: z
        .string()
        .min(1, { message: "First name is required" }),
    lastname: z
        .string()
        .min(1, { message: "Last name is required" })
});