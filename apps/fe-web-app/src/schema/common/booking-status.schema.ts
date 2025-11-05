import { z } from "zod";

export const BOOKING_STATUS_VALUES = [
  // New backend enums
  "CREATED",
  "PENDING_APPROVAL",
  "APPROVED",
  "WAITING_PAYMENT",
  "PAID",
  "SUCCESS",
  "CANCELLED",
  "EXPIRED",
  "REJECTED",
  "WAITING_CHECKOUT",
  "FAILED",
  // Legacy lowercase values (temporary compatibility)
  "pending",
  "confirmed",
  "cancelled",
  "expired",
  "pending_payment",
  "held",
  "paid",
  "checked_out",
  "completed",
] as const;

export const BookingStatusSchema = z.enum(BOOKING_STATUS_VALUES);

export type TBookingStatus = z.infer<typeof BookingStatusSchema>;
