import { z } from "zod";

export const resourceStatusSchema = z.enum([
  "AVAILABLE",
  "MAINTENANCE",
  "INACTIVE",
]);

export const createResourceSchema = z.object({
  name: z.string().trim().min(1, "Resource name is required").max(150),

  description: z.string().trim().max(1000).nullable().optional(),

  resourceType: z.string().trim().min(1, "Resource type is required").max(50),

  location: z.string().trim().min(1, "Location is required").max(255),

  capacity: z.number().int().positive("Capacity must be greater than zero"),

  categoryId: z.number().int().positive("A valid category is required"),

  status: resourceStatusSchema.optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
