import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateBooking, TBooking } from "@/schema/booking.schema";

/**
 * POST /api/bookings - Tạo booking mới (Đăng ký thuê xe)
 */
const createBooking = async (data: TCreateBooking) =>
  await apiRequest.post<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API, data);

/**
 * GET /api/bookings - Danh sách booking
 * Query params: status, email, phoneNumber, bookingCode
 */
const getBookingList = async (params?: {
  status?: string;
  email?: string;
  phoneNumber?: string;
  bookingCode?: string;
}) => {
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  return await apiRequest.get<BaseResponse<TBooking[]>>(
    API_SUFFIX.BOOKING_API + queryString
  );
};

/**
 * GET /api/bookings/:id - Chi tiết booking
 */
const getBookingById = async (id: string) =>
  await apiRequest.get<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API + `/${id}`);

/**
 * PUT /api/bookings/:id/cancel - Hủy booking
 */
const cancelBooking = async (id: string) =>
  await apiRequest.put<BaseResponse<TBooking>>(
    API_SUFFIX.BOOKING_API + `/${id}/cancel`,
    {}
  );

/**
 * PUT /api/bookings/:id - Cập nhật booking
 */
const updateBooking = async (id: string, payload: Partial<TBooking>) =>
  await apiRequest.put<BaseResponse<TBooking>>(
    API_SUFFIX.BOOKING_API + `/${id}`,
    payload
  );

/**
 * DELETE /api/bookings/:id - Xóa booking
 */
const deleteBooking = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.BOOKING_API + `/${id}`);

export const BookingApi = {
  createBooking,
  getBookingList,
  getBookingById,
  cancelBooking,
  updateBooking,
  deleteBooking,
};
