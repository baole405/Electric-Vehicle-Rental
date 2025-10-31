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
  seats: z.number().min(1).max(20),
  range: z.number().min(0), // km (NEDC)
  horsePower: z.number().min(0),
  transmission: z.enum(["single-speed", "automatic", "manual"]),
  carType: z.enum(["minicar", "sedan", "suv", "hatchback", "coupe", "wagon"]),
  trunkCapacity: z.number().min(0), // liters
  airbags: z.number().min(0).max(20),
  wheelSize: z.number().min(0), // inches
  screenSize: z.number().min(0), // inches
  dailyKmLimit: z.number().min(0), // km/day
});

export const BrandSchema = z.object({
  _id: z.string().min(1),
  code: z.string().min(1, "Brand code is required"),
  name: z.string().min(1, "Brand name is required"),
  description: z.string().nullable().optional(),
  baseDailyRate: z.number().min(0),
  depositAmount: z.number().min(0).default(0),
  imageUrl: z.string().nullable().optional(), // Deprecated, use images array
  images: z.array(z.string()).optional().default([]), // Array of 4 images
  specs: BrandSpecsSchema.optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

// Brand with availability (for by-station endpoint)
export const BrandWithAvailabilitySchema = BrandSchema.extend({
  availability: BrandAvailabilitySchema.optional(),
});

export type TBrand = z.infer<typeof BrandSchema>;
export type TBrandSpecs = z.infer<typeof BrandSpecsSchema>;
export type TBrandAvailability = z.infer<typeof BrandAvailabilitySchema>;
export type TBrandWithAvailability = z.infer<typeof BrandWithAvailabilitySchema>;
