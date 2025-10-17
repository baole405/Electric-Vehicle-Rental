import { z } from "zod";
import { UserRoleSchema } from "./common/user-role.schema";
import { UserStatusSchema } from "./common/user-status.schema";

export const UserSchema = z.object({
  _id: z.string().min(1),
  fullName: z.string().min(1, "fullName is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().nullable().optional(),
  role: UserRoleSchema.default("renter"),
  status: UserStatusSchema.default("pending_documents"),
  verifiedAt: z.string().datetime({ offset: true }).nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreateUserSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(8, "Phone must have at least 8 characters").optional(),
    password: z.string().min(8, "Password must have at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match",
  });

export type TUser = z.infer<typeof UserSchema>;
export type TCreateUser = z.infer<typeof CreateUserSchema>;
export type TCreateUserPayload = Omit<TCreateUser, "confirmPassword">;
