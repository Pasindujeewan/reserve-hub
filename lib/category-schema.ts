import { z } from "zod";

// Schema for creating a new category
export const createCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
