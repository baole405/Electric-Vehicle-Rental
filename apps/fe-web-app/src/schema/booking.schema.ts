import { z } from "zod";
import { BookingStatusSchema } from "./common/booking-status.schema";

const StatusActorSchema = z
  .object({
    _id: z.string(),
    fullName: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  })
  .partial()
  .optional();

const StatusHistoryEntrySchema = z.object({
  status: BookingStatusSchema,
  note: z.string().nullable().optional(),
  actor: StatusActorSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const PricingBreakdownSchema = z
  .object({
    basePrice: z.number().optional(),
    depositAmount: z.number().optional(),
    surchargeAmount: z.number().optional(),
    additionalFees: z.number().optional(),
    totalRentalFee: z.number().optional(),
    totalPayable: z.number().optional(),
  })
  .partial();

export const BookingSchema = z.object({
  _id: z.string(),
  bookingCode: z.string(),
  renterName: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),

  brand: z.object({
    _id: z.string().optional(),
    name: z.string(),
    code: z.string(),
    baseDailyRate: z.number().optional(),
    depositAmount: z.number().optional(),
    imageUrl: z.string().optional(),
    specs: z.any().optional(),
  }),

  pickupStation: z
    .object({
      _id: z.string().optional(),
      name: z.string(),
      code: z.string(),
      address: z.string().optional(),
      coordinates: z.any().optional(),
    })
    .optional(),

  station: z
    .object({
      _id: z.string().optional(),
      name: z.string(),
      code: z.string(),
    })
    .optional(),

  vehicle: z.any().nullable().optional(),

  assignedVehicle: z
    .object({
      _id: z.string(),
      plateNo: z.string().optional(),
      vin: z.string().optional(),
      model: z.string().optional(),
    })
    .nullable()
    .optional(),

  heldExpiresAt: z.string().nullable().optional(),
  confirmedExpiresAt: z.string().nullable().optional(),
  reservationExpiresAt: z.string().nullable().optional(),
  paymentDueAt: z.string().nullable().optional(),
  autoUpgradePolicy: z.enum(["allowed", "not_allowed"]).optional(),
  cancellationReason: z.string().optional(),

  pickupDate: z.string(),
  pickupTime: z.string(),
  returnDate: z.string(),
  returnTime: z.string(),
  pickupDateTime: z.string().optional(),
  returnDateTime: z.string().optional(),
  rentalDays: z.number().optional(),

  basePrice: z.number().optional(),
  additionalFees: z.number().optional(),
  totalRentalFee: z.number().optional(),
  depositAmount: z.number().optional(),
  totalPayable: z.number().optional(),

  pricing: PricingBreakdownSchema.optional(),

  statusHistory: z.array(StatusHistoryEntrySchema).optional(),

  paymentMethod: z.string(),
  pickupLocation: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),

  payment: z.any().nullable().optional(),
  rental: z.any().nullable().optional(),

  agreedToPaymentTerms: z.boolean().optional(),
  agreedToDataSharing: z.boolean().optional(),

  status: BookingStatusSchema,

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateBookingSchema = z.object({
  renterName: z.string().min(1, "Tên người thuê là bắt buộc"),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng 0"),
  email: z.string().email("Email không hợp lệ"),

  brand: z.string().min(1, "Vui lòng chọn dòng xe"),
  pickupStation: z.string().min(1, "Vui lòng chọn trạm"),
  vehicle: z.string().min(1, "Vui lòng chọn xe cụ thể"),
  pickupTimeExpected: z.string().min(1, "Thời gian nhận xe là bắt buộc"),
  rentalDays: z.number().int().min(1, "Số ngày thuê tối thiểu là 1"),

  paymentMethod: z.enum([
    "cash",
    "bank_transfer",
    "credit_card",
    "e_wallet",
  ]),
  agreedToPaymentTerms: z.boolean(),
  agreedToDataSharing: z.boolean(),

  renterId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "renterId không hợp lệ (phải là ObjectId 24 ký tự).")
    .optional(),
  renter: z.string().nullable().optional(),
  surchargeAmount: z.number().min(0).optional(),
  pickupLocation: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateBookingFormSchema = z.object({
  renterName: z.string().min(1, "Tên người thuê là bắt buộc"),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng 0"),
  email: z.string().email("Email không hợp lệ"),

  brandId: z.string().min(1, "Vui lòng chọn dòng xe"),
  stationId: z.string().min(1, "Vui lòng chọn trạm"),
  vehicleId: z.string().optional(),

  pickupDate: z.string().min(1, "Ngày nhận xe là bắt buộc"),
  pickupTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Giờ nhận xe không hợp lệ"),
  returnDate: z.string().min(1, "Ngày trả xe là bắt buộc"),
  returnTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Giờ trả xe không hợp lệ"),

  paymentMethod: z.enum(["cash", "bank_transfer", "credit_card", "e_wallet"]),

  agreedToPaymentTerms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với điều khoản thanh toán",
  }),
  agreedToDataSharing: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý chia sẻ dữ liệu cá nhân",
  }),

  pickupLocation: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

export const AssignVehicleSchema = z.object({
  vehicleId: z.string().min(1, "Vui lòng chọn xe"),
});

export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusSchema,
  cancellationReason: z.string().optional(),
});

export type TBooking = z.infer<typeof BookingSchema>;
export type TCreateBooking = z.infer<typeof CreateBookingSchema>;
export type TCreateBookingForm = z.infer<typeof CreateBookingFormSchema>;
export type TAssignVehicle = z.infer<typeof AssignVehicleSchema>;
export type TUpdateBookingStatus = z.infer<typeof UpdateBookingStatusSchema>;

export const convertFormToBookingAPI = (
  formData: TCreateBookingForm,
  renterId?: string,
  vehicleId?: string
): TCreateBooking => {
  const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
  const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}:00`);

  const diffMs = returnDateTime.getTime() - pickupDateTime.getTime();
  const rentalDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);

  let surchargeAmount = 0;
  const cursor = new Date(pickupDateTime);
  while (cursor < returnDateTime) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      surchargeAmount += 100_000;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const finalVehicleId = vehicleId || formData.vehicleId;
  if (!finalVehicleId) {
    console.warn("Missing vehicleId; backend will fallback to brand assignment");
  }

  const sanitizePaymentMethod = (method: string): "cash" | "bank_transfer" | "credit_card" | "e_wallet" => {
    const normalized = method.toLowerCase();
    switch (normalized) {
      case "cash":
        return "cash";
      case "bank_transfer":
      case "transfer":
      case "banktransfer":
      case "bank transfer":
        return "bank_transfer";
      case "credit_card":
      case "card":
      case "creditcard":
        return "credit_card";
      case "e_wallet":
      case "wallet":
      case "ewallet":
        return "e_wallet";
      default:
        // ✅ Throw error instead of fallback (per BE guidance)
        throw new Error(
          `Invalid payment method: "${method}". Must be one of: cash, bank_transfer, credit_card, e_wallet`
        );
    }
  };

  const sanitizedRenterId =
    renterId && /^[a-fA-F0-9]{24}$/.test(renterId) ? renterId : undefined;

  return {
    renterName: formData.renterName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    brand: formData.brandId,
    pickupStation: formData.stationId,
    vehicle: finalVehicleId || formData.brandId,
    pickupTimeExpected: pickupDateTime.toISOString(),
    rentalDays,
    paymentMethod: sanitizePaymentMethod(formData.paymentMethod),
    agreedToPaymentTerms: formData.agreedToPaymentTerms,
    agreedToDataSharing: formData.agreedToDataSharing,
    ...(sanitizedRenterId ? { renterId: sanitizedRenterId } : { renter: null }),
    surchargeAmount,
    pickupLocation: formData.pickupLocation?.trim() || undefined,
    promoCode: formData.promoCode?.trim() || undefined,
    notes: formData.notes?.trim() || undefined,
  };
};
