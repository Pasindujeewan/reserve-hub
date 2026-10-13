import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.number().int().positive(),
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
