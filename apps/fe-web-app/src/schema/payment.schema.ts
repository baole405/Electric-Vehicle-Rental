import { z } from "zod";
import { RentalSchema } from "./rental.schema";
import { PaymentMethodSchema, PaymentStatusSchema } from "./common/payment-status.schema";


export const PaymentSchema = z.object({
  _id: z.string().min(1),
  rental: RentalSchema,
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  baseAmount: z.number().nonnegative(),
  surchargeAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
  txnRef: z.string().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type TPayment = z.infer<typeof PaymentSchema>;
