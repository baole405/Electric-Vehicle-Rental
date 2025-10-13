import z from "zod";

export const StationStatusSchema = z.enum(["active", "maintenance", "closed"]);

export type TStationStatus = z.infer<typeof StationStatusSchema>;

