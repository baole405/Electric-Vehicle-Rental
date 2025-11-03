import { se } from "date-fns/locale";
import z from "zod";

export const specificationsSchema = z.object({
  seatCount: z.number().min(1).max(20),
  transmissionType: z.enum(['automatic', 'manual']),
  airbagCount: z.number().min(0),
  horsepower: z.number().min(0),
  motorType: z.string(),
  motorSupplier: z.string(),
  batteryCapacityKWh: z.number().min(0)
});

export type TSpecifications = z.infer<typeof specificationsSchema>;
