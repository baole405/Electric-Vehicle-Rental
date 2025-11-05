import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type {
  TCreateBooking,
  TBooking,
  TAssignVehicle,
  TUpdateBookingStatus
} from "@/schema/booking.schema";

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
  renterId?: string;
  renter?: string;
  userId?: string;
}) =>
  await apiRequest.get<BaseResponse<TBooking[]>>(API_SUFFIX.BOOKING_API, {
    params,
  });

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

/**
 * POST /api/bookings/:id/assign-vehicle - Gán xe cho booking
 */
const assignVehicle = async (bookingId: string, data: TAssignVehicle) =>
  await apiRequest.post<BaseResponse<TBooking>>(
    `${API_SUFFIX.BOOKING_API}/${bookingId}/assign-vehicle`,
    data
  );

/**
 * PATCH /api/bookings/:id/status - Cập nhật trạng thái booking
 */
const updateBookingStatus = async (bookingId: string, data: TUpdateBookingStatus) =>
  await apiRequest.patch<BaseResponse<TBooking>>(
    `${API_SUFFIX.BOOKING_API}/${bookingId}/status`,
    data
  );

/**
 * POST /api/bookings/:id/confirm - Xác nhận booking (Staff approve)
 */
const confirmBooking = async (bookingId: string) =>
  await apiRequest.post<BaseResponse<TBooking>>(
    `${API_SUFFIX.BOOKING_API}/${bookingId}/confirm`,
    {}
  );

export const BookingApi = {
  createBooking,
  getBookingList,
  getBookingById,
  cancelBooking,
  updateBooking,
  deleteBooking,
  assignVehicle,
  updateBookingStatus,
  confirmBooking,
};
