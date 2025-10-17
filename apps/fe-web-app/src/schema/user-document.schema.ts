import { z } from "zod";
import { UserDocumenstatus } from "./common/user-document-status.schema";

/** Schema for UserDocument */
export const UserDocumentSchema = z.object({
  _id: z.string().min(1),
  user: z.string().min(1, "user (ObjectId) is required"),
  docType: z.string().min(1, "docType is required").trim(),
  docNumber: z.string().trim().nullable().optional(),
  docImageUrl: z.string().url("Invalid image URL").trim().nullable().optional(),
  verifyStatus: UserDocumenstatus,
  uploadedAt: z.string().datetime({ offset: true }),
  verifiedAt: z.string().datetime({ offset: true }).nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

/** Type inference */
export type TUserDocument = z.infer<typeof UserDocumentSchema>;
