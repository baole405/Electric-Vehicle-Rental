import { z } from "zod";
import { RentalSchema } from "./rental.schema";
import { PaymentMethodSchema, PaymentStatusSchema } from "./common/payment-status.schema";

export const PaymentSchema = z.object({
  _id: z.string().min(1),
  rental: RentalSchema.nullable().optional(),
  bookingId: z.string().optional(),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  baseAmount: z.number().nonnegative().optional(),
  surchargeAmount: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  txnRef: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TPayment = z.infer<typeof PaymentSchema>;
