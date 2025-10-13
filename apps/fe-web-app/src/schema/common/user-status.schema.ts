import { z } from "zod";

export const UserStatusSchema = z.enum(["active", "inactive", "suspended"]);

export type TUserStatus = z.infer<typeof UserStatusSchema>;
