import { z } from "zod";
import { UserRoleSchema, UserStatusSchema } from './common/user-status.schema';
export const UserSchema = z.object({
  _id: z.string().min(1),
  fullName: z.string().min(1, "fullName is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().nullable().optional(),
  passwordHash: z.string().min(1, "passwordHash is required"),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

/** Type inference */
export type TUser = z.infer<typeof UserSchema>;
