import { z } from "zod";

export const RentalStatusSchema = z.enum([
  "ongoing",
  "completed",
  "cancelled",
  "overdue",
]);

export type TRentalStatus = z.infer<typeof RentalStatusSchema>;
