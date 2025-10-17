import { z } from "zod";

export const UserStatusSchema = z.enum([
  "pending_documents",
  "documents_submitted",
  "verified",
  "active",
  "inactive",
  "suspended",
]);

export type TUserStatus = z.infer<typeof UserStatusSchema>;
