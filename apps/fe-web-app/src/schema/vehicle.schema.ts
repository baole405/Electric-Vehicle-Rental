import { z } from "zod";
import { VehicleStatusSchema } from "./common/vehicle-status.schema";

export const VehicleSchema = z
  .object({
    _id: z.string().min(1),
    vin: z.string().min(1),
    batteryPercent: z
      .number()
      .int()
      .min(0, "batteryPercent >= 0")
      .max(100, "batteryPercent <= 100"),
    createdAt: z.string().datetime({ offset: true }),
    model: z.string().min(1),
    odometer: z.number().int().nonnegative(),
    plateNo: z.string().min(1),
    stationId: z.string().min(1),
    status: VehicleStatusSchema,
    updatedAt: z.string().datetime({ offset: true }),
  })

export type TVehicle = z.infer<typeof VehicleSchema>;
