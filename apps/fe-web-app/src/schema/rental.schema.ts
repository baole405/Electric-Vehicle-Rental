import { z } from "zod";
import { BookingSchema } from "./booking.schema";
import { UserSchema } from "./user.schema";
import { VehicleSchema } from "./vehicle.schema";
import { StationSchema } from "./station.schema";
import { RentalStatusSchema } from "./common/rental-status.schema";

const HandoverSnapshotSchema = z
  .object({
    _id: z.string().optional(),
    type: z.string().optional(),
    createdAt: z.string().optional(),
    photos: z.array(z.string()).optional(),
    station: StationSchema.partial().optional(),
    staff: UserSchema.partial().optional(),
    notes: z.string().optional(),
  })
  .partial();

export const RentalSchema = z.object({
  _id: z.string().min(1),

  booking: BookingSchema.nullable().optional(),
  renter: UserSchema.optional(),
  vehicle: VehicleSchema.optional(),
  pickupStation: StationSchema.partial().nullable().optional(),
  returnStation: StationSchema.partial().nullable().optional(),
  pickupTime: z.string(),
  returnTime: z.string().nullable().optional(),
  odoStart: z.number().nonnegative().nullable().optional(),
  odoEnd: z.number().nonnegative().nullable().optional(),
  conditionNotes: z.string().nullable().optional(),
  status: RentalStatusSchema,
  handoverPickup: HandoverSnapshotSchema.nullable().optional(),
  handoverReturn: HandoverSnapshotSchema.nullable().optional(),
  handovers: z.array(HandoverSnapshotSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TRental = z.infer<typeof RentalSchema>;
