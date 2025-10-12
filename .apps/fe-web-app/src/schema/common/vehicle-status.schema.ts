import { z } from "zod";

export const VehicleStatusSchema = z.enum([
  "available",
  "rented",
  "maintenance",
]);

export type TVehicleStatus = z.infer<typeof VehicleStatusSchema>;
