import { z } from "zod";
import { BookingStatusSchema } from "./common/booking-status.schema";
import { VehicleSchema } from "./vehicle.schema";
import { UserSchema } from "./user.schema";
import { StationSchema } from "./station.schema";

export const BookingSchema = z.object({
  _id: z.string().min(1),
  renter: UserSchema,       // ref tới User
  pickupStation: StationSchema,
  vehicle: VehicleSchema,                    // ref tới Vehicle, có thể null
  pickupTimeExpected: z.string(),    // Thời gian nhận xe dự kiến
  status: BookingStatusSchema,                   // Enum trạng thái booking
  createdAt: z.string().datetime({ offset: true }),                  // Thời gian tạo
  updatedAt: z.string().datetime({ offset: true }),                  // Thời gian cập nhật
});

export const CreateBookingSchema = z.object({
  renter: z.string().min(1, "renter (userId) is required"),          // ref tới User
  pickupStation: z.string().min(1, "pickupStation (stationId) is required"), // ref tới Station
  vehicle: z.string().nullable().optional(),                         // ref tới Vehicle, có thể null
  pickupTimeExpected: z.string().datetime({ offset: true }),         // Thời gian nhận xe dự kiến
  status: BookingStatusSchema.default("pending"),                    // Enum trạng thái booking
});

export type TCreateBooking = z.infer<typeof CreateBookingSchema>;
export type TBooking = z.infer<typeof BookingSchema>;
