import { z } from "zod";

// Booking Schema theo API mới
export const BookingSchema = z.object({
  _id: z.string(),
  bookingCode: z.string(), // "BK20251031001"
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

  pickupStation: z.object({
    _id: z.string().optional(),
    name: z.string(),
    code: z.string(),
    address: z.string().optional(),
    coordinates: z.any().optional(),
  }).optional(),

  station: z.object({
    _id: z.string().optional(),
    name: z.string(),
    code: z.string(),
  }).optional(),

  vehicle: z.any().nullable().optional(),

  // Assigned vehicle & workflow fields
  assignedVehicle: z.object({
    _id: z.string(),
    plateNo: z.string().optional(),
    vin: z.string().optional(),
    model: z.string().optional(),
  }).nullable().optional(),
  heldExpiresAt: z.string().optional(), // ISO datetime - thời hạn giữ chỗ
  confirmedExpiresAt: z.string().optional(), // ISO datetime - thời hạn xác nhận
  autoUpgradePolicy: z.enum(["allowed", "not_allowed"]).optional(), // Cho phép upgrade xe tự động
  cancellationReason: z.string().optional(), // Lý do hủy

  // Thời gian
  pickupDate: z.string(), // ISO date string or YYYY-MM-DD
  pickupTime: z.string(), // HH:mm
  returnDate: z.string(),
  returnTime: z.string(),
  pickupDateTime: z.string().optional(),
  returnDateTime: z.string().optional(),
  rentalDays: z.number(),

  // Pricing
  basePrice: z.number(),
  additionalFees: z.number(),
  totalRentalFee: z.number(),
  depositAmount: z.number(),
  totalPayable: z.number(),

  pricing: z.object({
    basePrice: z.number(),
    additionalFees: z.number(),
    totalRentalFee: z.number(),
    depositAmount: z.number(),
    totalPayable: z.number(),
  }).optional(),

  // Payment & extras
  paymentMethod: z.string(),
  pickupLocation: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),

  // Agreements
  agreedToPaymentTerms: z.boolean(),
  agreedToDataSharing: z.boolean(),

  // Status
  status: z.enum([
    "pending_payment",
    "held",
    "confirmed",
    "paid",
    "checked_out",
    "completed",
    "cancelled",
    "expired"
  ]),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Create Booking Schema - Updated to match Backend API
export const CreateBookingSchema = z.object({
  // User info
  renterName: z.string().min(1, "Tên người thuê là bắt buộc"),
  phoneNumber: z.string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng 0"),
  email: z.string().email("Email không hợp lệ"),

  // Booking details
  brand: z.string().min(1, "Vui lòng chọn dòng xe"),
  pickupStation: z.string().min(1, "Vui lòng chọn trạm"),
  vehicle: z.string().min(1, "Vui lòng chọn xe cụ thể"),
  pickupTimeExpected: z.string().min(1, "Thời gian nhận xe là bắt buộc"),
  rentalDays: z.number().int().min(1, "Số ngày thuê tối thiểu là 1"),

  // Payment & preferences
  paymentMethod: z.enum(["online", "cash", "bank_transfer", "credit_card", "e_wallet"]),
  agreedToPaymentTerms: z.boolean(),
  agreedToDataSharing: z.boolean(),

  // Optional fields
  renter: z.string().nullable().optional(), // BE sets this
  status: z.string().default("pending"),
  surchargeAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

// Legacy Create Booking Schema - Keep for frontend forms
export const CreateBookingFormSchema = z.object({
  renterName: z.string().min(1, "Tên người thuê là bắt buộc"),
  phoneNumber: z.string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng 0"),
  email: z.string().email("Email không hợp lệ"),

  brandId: z.string().min(1, "Vui lòng chọn dòng xe"),
  stationId: z.string().min(1, "Vui lòng chọn trạm"),
  vehicleId: z.string().optional(), // Optional - for when specific vehicle is selected

  pickupDate: z.string().min(1, "Ngày nhận xe là bắt buộc"),
  pickupTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Giờ nhận xe không hợp lệ"),
  returnDate: z.string().min(1, "Ngày trả xe là bắt buộc"),
  returnTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Giờ trả xe không hợp lệ"),

  paymentMethod: z.enum(["online", "cash", "bank_transfer", "credit_card", "e_wallet"]),

  agreedToPaymentTerms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với điều khoản thanh toán",
  }),
  agreedToDataSharing: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý chia sẻ dữ liệu cá nhân",
  }),

  // Optional fields
  pickupLocation: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

// Assign Vehicle Schema
export const AssignVehicleSchema = z.object({
  vehicleId: z.string().min(1, "Vui lòng chọn xe"),
});

// Update Booking Status Schema
export const UpdateBookingStatusSchema = z.object({
  status: z.enum([
    "pending_payment",
    "held",
    "confirmed",
    "paid",
    "checked_out",
    "completed",
    "cancelled",
    "expired"
  ]),
  cancellationReason: z.string().optional(), // Required if status = cancelled
});

export type TBooking = z.infer<typeof BookingSchema>;
export type TCreateBooking = z.infer<typeof CreateBookingSchema>; // Backend API format
export type TCreateBookingForm = z.infer<typeof CreateBookingFormSchema>; // Frontend form format
export type TAssignVehicle = z.infer<typeof AssignVehicleSchema>;
export type TUpdateBookingStatus = z.infer<typeof UpdateBookingStatusSchema>;

// Helper function to convert form data to backend API format
export const convertFormToBookingAPI = (
  formData: TCreateBookingForm,
  userId: string,
  vehicleId?: string
): TCreateBooking => {
  // Calculate pickup time expected from date + time
  const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
  const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}:00`);

  // Calculate rental days
  const diffMs = returnDateTime.getTime() - pickupDateTime.getTime();
  const rentalDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);

  // Calculate surcharge (weekend fees)
  let surchargeAmount = 0;
  const current = new Date(pickupDateTime);
  while (current < returnDateTime) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      surchargeAmount += 100000; // 100k VND per weekend day
    }
    current.setDate(current.getDate() + 1);
  }

  const finalVehicleId = vehicleId || formData.vehicleId;
  if (!finalVehicleId) {
    console.warn("⚠️ No specific vehicle ID provided, using brand for booking");
  }

  return {
    // User info
    renterName: formData.renterName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,

    // Booking details
    brand: formData.brandId,
    pickupStation: formData.stationId,
    vehicle: finalVehicleId || formData.brandId, // Use brand as fallback
    pickupTimeExpected: pickupDateTime.toISOString(),
    rentalDays,

    // Payment & preferences
    paymentMethod: formData.paymentMethod,
    agreedToPaymentTerms: formData.agreedToPaymentTerms,
    agreedToDataSharing: formData.agreedToDataSharing,

    // Optional fields
    renter: null, // BE will set this
    status: "pending",
    surchargeAmount,
    notes: formData.notes || undefined,
  };
};
