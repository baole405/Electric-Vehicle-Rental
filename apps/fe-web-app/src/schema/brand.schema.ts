import { z } from "zod";

export const BrandSchema = z.object({
  _id: z.string().min(1),
  code: z.string().min(1, "Brand code is required"),
  name: z.string().min(1, "Brand name is required"),
  description: z.string().nullable().optional(),
  baseDailyRate: z.number().min(0),
  depositAmount: z.number().min(0).default(0),
  imageUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type TBrand = z.infer<typeof BrandSchema>;
