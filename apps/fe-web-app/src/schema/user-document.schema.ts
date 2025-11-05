import { z } from "zod";
import { UserSchema } from "./user.schema";

export const UserDocumentStatusSchema = z.enum([
  "pending",
  "under_review",
  "verified",
  "rejected",
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export const UserDocumentSchema = z.object({
  _id: z.string().min(1),
  user: UserSchema,
  documentType: z.string().default("national_id"),
  identityNumber: z.string().min(6, "Identity number is required"),
  drivingLicenseNumber: z.string().nullable().optional(),
  status: UserDocumentStatusSchema.default("pending"),
  notes: z.string().nullable().optional(),
  verifiedBy: z
    .object({
      _id: z.string(),
      fullName: z.string().optional(),
    })
    .nullable()
    .optional(),
  submittedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateUserDocumentSchema = z.object({
  user: z.string().min(1, "User id is required"),
  documentType: z.string().default("national_id"),
  identityNumber: z.string().min(6, "Identity number is required"),
  drivingLicenseNumber: z.string().min(6, "Driving license number is required"),
  frontImage: z.instanceof(File, { message: "Front side is required" }),
  backImage: z.instanceof(File, { message: "Back side is required" }),
  drivingLicenseImage: z.instanceof(File, {
    message: "Driving license image is required",
  }),
});

export type TUserDocument = z.infer<typeof UserDocumentSchema>;
export type TCreateUserDocument = z.infer<typeof CreateUserDocumentSchema>;
