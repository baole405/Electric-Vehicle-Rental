import { z } from "zod";

export const UserRoleSchema = z.enum(["renter", "staff", "admin"]);

export type TUserRoleS = z.infer<typeof UserRoleSchema>;
