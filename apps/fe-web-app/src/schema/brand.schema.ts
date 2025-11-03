import { z } from "zod";

// Availability schema for brands by station
export const BrandAvailabilitySchema = z.object({
  status: z.enum(["available", "out_of_stock", "no_vehicles"]),
  total: z.number().min(0),
  available: z.number().min(0),
  rented: z.number().min(0),
  maintenance: z.number().min(0),
});

// Brand specifications schema
export const BrandSpecsSchema = z.object({
  seats: z
    .number({ message: "Số chỗ ngồi phải là số" })
    .min(2, { message: "Số chỗ ngồi tối thiểu là 2" })
    .max(9, { message: "Số chỗ ngồi tối đa là 9" })
    .int({ message: "Số chỗ ngồi phải là số nguyên" })
    .optional(),
  range: z
    .number({ message: "Quãng đường phải là số" })
    .min(50, { message: "Quãng đường tối thiểu là 50 km" })
    .max(1000, { message: "Quãng đường tối đa là 1000 km" })
    .optional(),
  horsePower: z
    .number({ message: "Công suất phải là số" })
    .min(10, { message: "Công suất tối thiểu là 10 HP" })
    .max(2000, { message: "Công suất tối đa là 2000 HP" })
    .optional(),
  batteryCapacity: z
    .number({ message: "Dung lượng pin phải là số" })
    .min(10, { message: "Dung lượng pin tối thiểu là 10 kWh" })
    .max(200, { message: "Dung lượng pin tối đa là 200 kWh" })
    .optional(),
  transmission: z
    .enum(["single-speed", "automatic", "manual", "cvt"], {
      message: "Loại hộp số không hợp lệ (single-speed, automatic, manual, cvt)",
    })
    .optional(),
  fuelType: z
    .enum(["electric", "hybrid"], {
      message: "Loại năng lượng không hợp lệ (electric hoặc hybrid)",
    })
    .optional(),
  carType: z
    .enum(["minicar", "sedan", "suv", "hatchback", "crossover", "minivan", "coupe", "wagon"], {
      message: "Kiểu xe không hợp lệ",
    })
    .optional(),
  trunkCapacity: z
    .number({ message: "Dung tích cốp phải là số" })
    .min(0, { message: "Dung tích cốp không được âm" })
    .max(2000, { message: "Dung tích cốp tối đa là 2000 lít" })
    .optional(),
  airbags: z
    .number({ message: "Số túi khí phải là số" })
    .min(0, { message: "Số túi khí không được âm" })
    .max(12, { message: "Số túi khí tối đa là 12" })
    .int({ message: "Số túi khí phải là số nguyên" })
    .optional(),
  wheelSize: z
    .number({ message: "Kích thước bánh xe phải là số" })
    .min(13, { message: "Kích thước bánh xe tối thiểu là 13 inch" })
    .max(22, { message: "Kích thước bánh xe tối đa là 22 inch" })
    .optional(),
  screenSize: z
    .number({ message: "Kích thước màn hình phải là số" })
    .min(5, { message: "Kích thước màn hình tối thiểu là 5 inch" })
    .max(17, { message: "Kích thước màn hình tối đa là 17 inch" })
    .optional(),
  dailyKmLimit: z
    .number({ message: "Giới hạn km/ngày phải là số" })
    .min(0, { message: "Giới hạn km/ngày không được âm" })
    .max(1000, { message: "Giới hạn km/ngày tối đa là 1000 km" })
    .optional()
    .default(300),
});

// Manufacturer schema
export const ManufacturerSchema = z.object({
  country: z.string({ message: "Quốc gia phải là chuỗi ký tự" }).optional(),
  website: z.string().url({ message: "Website phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)" }).optional(),
});

export const BrandSchema = z.object({
  _id: z.string().min(1, { message: "ID không được để trống" }),
  code: z
    .string({ message: "Mã thương hiệu phải là chuỗi ký tự" })
    .min(1, { message: "Mã thương hiệu là bắt buộc" })
    .min(3, { message: "Mã thương hiệu phải có ít nhất 3 ký tự" })
    .max(20, { message: "Mã thương hiệu không được quá 20 ký tự" }),
  name: z
    .string({ message: "Tên thương hiệu phải là chuỗi ký tự" })
    .min(1, { message: "Tên thương hiệu là bắt buộc" })
    .min(2, { message: "Tên thương hiệu phải có ít nhất 2 ký tự" })
    .max(100, { message: "Tên thương hiệu không được quá 100 ký tự" }),
  description: z.string().nullable().optional(),
  baseDailyRate: z
    .number({ message: "Giá thuê/ngày phải là số" })
    .min(0, { message: "Giá thuê/ngày không được âm" })
    .min(50000, { message: "Giá thuê/ngày tối thiểu là 50,000 VNĐ" })
    .max(10000000, { message: "Giá thuê/ngày tối đa là 10,000,000 VNĐ" }),
  depositAmount: z
    .number({ message: "Tiền đặt cọc phải là số" })
    .min(0, { message: "Tiền đặt cọc không được âm" })
    .max(50000000, { message: "Tiền đặt cọc tối đa là 50,000,000 VNĐ" })
    .default(0),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional().default([]),
  specs: BrandSpecsSchema.optional(),
  manufacturer: ManufacturerSchema.optional(),
  features: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  availability: BrandAvailabilitySchema.optional(), // Backend returns this in by-station API
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

// Brand with availability (for by-station endpoint)
// Backend returns: { brand: TBrand, availableVehicleCount: number, isAvailable: boolean }
export const BrandWithAvailabilitySchema = z.object({
  brand: BrandSchema,
  availableVehicleCount: z.number().min(0),
  isAvailable: z.boolean(),
});

export type TBrand = z.infer<typeof BrandSchema>;
export type TBrandSpecs = z.infer<typeof BrandSpecsSchema>;
export type TManufacturer = z.infer<typeof ManufacturerSchema>;
export type TBrandAvailability = z.infer<typeof BrandAvailabilitySchema>;
export type TBrandWithAvailability = z.infer<typeof BrandWithAvailabilitySchema>;
