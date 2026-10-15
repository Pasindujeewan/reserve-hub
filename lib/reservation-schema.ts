import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.number().int().positive(),
    quantity: z.number().int().positive("Required capacity must be at least 1"),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
  })
  .refine(
    (data) =>
      new Date(data.startTime).getTime() < new Date(data.endTime).getTime(),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
