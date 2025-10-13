import { z } from "zod";

export const BookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "expired",
]);

export type TBookingStatus = z.infer<typeof BookingStatusSchema>;
