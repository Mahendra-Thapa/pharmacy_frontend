import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const passwordSchema = z.object({
  current: z.string().min(1, "Current password is required"),
  new: z.string().min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirm: z.string().min(1, "Please confirm your new password")
}).refine((data) => data.new === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export const settingsSchema = z.object({
  name: z.string().min(3, "Brand name must be at least 3 characters"),
  admin_contact: z.string().min(10, "Valid contact number required"),
  qr_code_url: z.string().optional().nullable(),
});

export const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email stream address"),
  phone: z.string().min(10, "Mobile contact must be at least 10 digits"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
