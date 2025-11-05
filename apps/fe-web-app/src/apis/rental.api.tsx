import { apiRequest } from '@/lib/http';
import type { BaseResponse } from '@/schema/common/response.type';
import type { TRental } from '@/schema/rental.schema';
import { API_SUFFIX } from './util.api';

const getRentalList = async (params?: { renterId?: string; status?: string }) =>
  await apiRequest.get<BaseResponse<TRental[]>>(API_SUFFIX.RENTAL_API, {
    params,
  });

const getRentalById = async (id: string) =>
  await apiRequest.get<BaseResponse<TRental>>(API_SUFFIX.RENTAL_API + `/${id}`);

const createRental = async (payload: Partial<TRental>) =>
  await apiRequest.post<BaseResponse<TRental>>(API_SUFFIX.RENTAL_API, payload);

const updateRental = async (id: string, payload: Partial<TRental>) =>
  await apiRequest.put<BaseResponse<TRental>>(
    API_SUFFIX.RENTAL_API + `/${id}`,
    payload
  );

const deleteRental = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.RENTAL_API + `/${id}`);

/**
 * GET /api/rentals/ready-for-pickup
 * Get list of rentals ready for pickup (for Staff Dashboard)
 */
const getReadyForPickupRentals = async (params?: {
  stationId?: string;
  date?: string;
}) =>
  await apiRequest.get<BaseResponse<TRental[]>>(
    `${API_SUFFIX.RENTAL_API}/ready-for-pickup`,
    { params }
  );

/**
 * POST /api/rentals/:id/staff-confirm-checkin
 * Staff confirms customer checked in (READY_FOR_PICKUP → CHECKED_IN)
 */
const staffConfirmCheckin = async (
  rentalId: string,
  data: {
    staffId: string;
    checkinTime: string;
    notes?: string;
  }
) =>
  await apiRequest.post<BaseResponse<TRental>>(
    `${API_SUFFIX.RENTAL_API}/${rentalId}/staff-confirm-checkin`,
    data
  );

/**
 * POST /api/rentals/:id/customer-sign-contract
 * Customer signs rental contract (CHECKED_IN → IN_PROGRESS)
 * This also updates booking status to SUCCESS
 */
const customerSignContract = async (
  rentalId: string,
  data: {
    signature: string; // base64 image
    agreedTerms: boolean;
    signedAt: string;
  }
) =>
  await apiRequest.post<BaseResponse<TRental>>(
    `${API_SUFFIX.RENTAL_API}/${rentalId}/customer-sign-contract`,
    data
  );

export const RentalApi = {
  getRentalList,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
  getReadyForPickupRentals,
  staffConfirmCheckin,
  customerSignContract,
};
