import { z } from "zod";

export const PAYMENT_STATUS_VALUES = [
  // New backend enums
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
  // Legacy / lowercase values
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export const PAYMENT_METHOD_VALUES = [
  // New backend enums
  "CASH",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "E_WALLET",
  "ONLINE",
  // Legacy / lowercase values
  "cash",
  "card",
  "wallet",
  "transfer",
  "bank_transfer",
  "credit_card",
  "e_wallet",
] as const;

export const PaymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES);
export const PaymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES);

export type TPaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type TPaymentMethod = z.infer<typeof PaymentMethodSchema>;
