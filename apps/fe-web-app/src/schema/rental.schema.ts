import { z } from "zod";
import { BookingSchema } from "./booking.schema";
import { UserSchema } from "./user.schema";
import { VehicleSchema } from "./vehicle.schema";
import { StationSchema } from "./station.schema";
import { RentalStatusSchema } from "./common/rental-status.schema";

export const RentalSchema = z.object({
  _id: z.string().min(1),

  booking: BookingSchema.nullable().optional(), // ref tới Booking, có thể null
  renter: UserSchema,        // người thuê (ref User)
  vehicle: VehicleSchema,    // xe (ref Vehicle)
  pickupStation: StationSchema,
  returnStation: StationSchema,
  pickupTime: z.string().datetime({ offset: true }), // thời gian lấy xe
  returnTime: z.string().datetime({ offset: true }).nullable().optional(), // thời gian trả xe
  odoStart: z.number().nonnegative().nullable().optional(), // số km lúc lấy xe
  odoEnd: z.number().nonnegative().nullable().optional(),   // số km lúc trả xe
  conditionNotes: z.string().nullable().optional(), // ghi chú tình trạng xe
  status: RentalStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type TRental = z.infer<typeof RentalSchema>;
