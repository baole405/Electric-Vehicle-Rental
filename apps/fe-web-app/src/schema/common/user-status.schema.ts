import { z } from "zod";

export const UserStatusSchema = z.enum(["active", "inactive", "suspended"]);
export const UserRoleSchema = z.enum(["renter", "staff", "admin"]);

export type TUserRoleS = z.infer<typeof UserRoleSchema>;


export type TUserStatus = z.infer<typeof UserStatusSchema>;
