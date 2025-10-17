import { z } from "zod";
import { RentalSchema } from "./rental.schema";
import { UserSchema } from "./user.schema";
import { VehicleSchema } from "./vehicle.schema";

export const HandoverTypeSchema = z.enum(["pickup", "return"]);

export const HandoverSchema = z.object({
  _id: z.string().min(1),
  rental: RentalSchema,
  vehicle: VehicleSchema,
  stationId: z.string(),
  staff: UserSchema,
  type: HandoverTypeSchema,
  odoReading: z.number().nonnegative().nullable().optional(),
  batteryPercent: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreateHandoverSchema = z.object({
  rental: z.string().min(1, "Rental id is required"),
  stationId: z.string().min(1, "Station id is required"),
  type: HandoverTypeSchema,
  odoReading: z.number().nonnegative().nullable().optional(),
  batteryPercent: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  photos: z.array(z.instanceof(File)).max(6).optional(),
});

export type THandover = z.infer<typeof HandoverSchema>;
export type TCreateHandover = z.infer<typeof CreateHandoverSchema>;
