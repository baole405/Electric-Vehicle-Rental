import { z } from "zod";

export const UserRoleSchema = z.enum(["renter", "staff", "admin"]);

export type TUserRoleS = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum([
  "pending_documents",
  "documents_submitted",
  "verified",
  "active",
  "inactive",
  "suspended",
]);

export type TUserStatus = z.infer<typeof UserStatusSchema>;
