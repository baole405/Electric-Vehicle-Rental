import { z } from 'zod';
import { VehicleStatusSchema } from './common/vehicle-status.schema';
import { BrandSchema } from './brand.schema';

export const VehicleSchema = z.object({
  _id: z.string().min(1),
  vin: z.string().min(1),
  brand: BrandSchema.or(z.string().min(1)),
  brandId: z.string().min(1).optional(),
  model: z.string().min(1),
  plateNo: z.string().min(1),
  stationId: z.string().min(1),
  status: VehicleStatusSchema,
  batteryPercent: z
    .number()
    .int()
    .min(0, 'batteryPercent >= 0')
    .max(100, 'batteryPercent <= 100'),
  odometer: z.number().int().nonnegative(),
  dailyRate: z.number().nonnegative().nullable().optional(),
  deposit: z.number().nonnegative().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type TVehicle = z.infer<typeof VehicleSchema>;
