import { z } from "zod";

export const PaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const PaymentMethodSchema = z.enum([
  "cash",
  "card",
  "wallet",
  "transfer",
]);
export type TPaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type TPaymentMethod = z.infer<typeof PaymentMethodSchema>;
