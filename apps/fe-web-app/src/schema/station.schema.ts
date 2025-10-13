import { z } from "zod";
import { StationStatusSchema } from "./common/station-status.schema";

export const StationSchema = z.object({
  _id: z.string().min(1),
  code: z.string().min(1, "code is required"),
  name: z.string().min(1, "name is required"),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  openHours: z.string().nullable().optional(),
  status: StationStatusSchema.default("active"),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type TStation = z.infer<typeof StationSchema>;
