import { z } from "zod";

export const VEHICLE_STATUS_VALUES = [
  // New backend enums
  "AVAILABLE",
  "RESERVED",
  "RENTED",
  "MAINTENANCE",
  "DAMAGED",
  "UNAVAILABLE",
  // Legacy lowercase values (compatibility)
  "available",
  "rented",
  "maintenance",
  "unavailable",
] as const;

export const VehicleStatusSchema = z.enum(VEHICLE_STATUS_VALUES);

export type TVehicleStatus = z.infer<typeof VehicleStatusSchema>;
