import { z } from "zod";

export const RENTAL_STATUS_VALUES = [
  // New backend enums
  "CREATED",
  "READY_FOR_PICKUP",
  "CHECKED_IN", // Staff confirmed checkin
  "IN_PROGRESS",
  "RETURNED",
  "LATE",
  "DAMAGED",
  "COMPLETED",
  "CANCELLED",
  // Legacy lowercase values (compatibility)
  "ongoing",
  "completed",
  "cancelled",
  "overdue",
] as const;

export const RentalStatusSchema = z.enum(RENTAL_STATUS_VALUES);

export type TRentalStatus = z.infer<typeof RentalStatusSchema>;
