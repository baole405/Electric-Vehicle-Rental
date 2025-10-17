import { z } from "zod";

export const UserDocumenstatus = z.enum(["pending", "approved", "rejected"]);

export type TUserDocumenstatus = z.infer<typeof UserDocumenstatus>;
