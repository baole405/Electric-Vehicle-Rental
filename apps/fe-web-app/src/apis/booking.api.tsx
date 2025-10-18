import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateBooking, TBooking } from "@/schema/booking.schema";

/**
 * POST /api/bookings - tạo booking mới
 */
const createBooking = async (data: TCreateBooking) =>
  await apiRequest.post<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API, data);

/**
 * GET /api/bookings - danh sách booking
 */
const getBookingList = async () =>
  await apiRequest.get<BaseResponse<TBooking[]>>(API_SUFFIX.BOOKING_API);

/**
 * GET /api/bookings/:id - chi tiết booking
 */
const getBookingById = async (id: string) =>
  await apiRequest.get<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API + `/${id}`);

/**
 * PUT /api/bookings/:id - cập nhật booking
 */
const updateBooking = async (id: string, payload: Partial<TBooking>) =>
  await apiRequest.put<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API + `/${id}`, payload);

/**
 * DELETE /api/bookings/:id - xóa booking
 */
const deleteBooking = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.BOOKING_API + `/${id}`);

export const BookingApi = {
  createBooking,
  getBookingList,
  getBookingById,
  updateBooking,
  deleteBooking,
};
