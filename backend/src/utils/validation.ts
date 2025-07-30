import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createEntrySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  type: z.enum(["Movie", "TV"], {
    errorMap: () => ({ message: "Type must be either Movie or TV" }),
  }),
  director: z
    .string()
    .min(1, "Director is required")
    .max(100, "Director name must be less than 100 characters"),
  budget: z
    .string()
    .min(1, "Budget is required")
    .max(100, "Budget must be less than 100 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .max(100, "Duration must be less than 100 characters"),
  yearTime: z
    .string()
    .min(1, "Year/Time is required")
    .max(50, "Year/Time must be less than 50 characters"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updateEntrySchema = createEntrySchema.partial().extend({
  isReleased: z.boolean().optional(),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["Movie", "TV"]).optional(),
  year: z.string().optional(),
  director: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const idSchema = z.object({
  id: z.coerce.number().int().positive("Invalid ID"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type IdInput = z.infer<typeof idSchema>;
