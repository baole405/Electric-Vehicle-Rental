import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateBooking, TBooking } from "@/schema/booking.schema";

/**
 * Gọi API tạo booking mới
 * Endpoint: POST /api/booking
 */
const createBooking = async (data: TCreateBooking) =>
  await apiRequest.post<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API, data);

/**
 * Lấy danh sách booking (dành cho admin hoặc user)
 * Endpoint: GET /api/booking
 */
const getBookingList = async () =>
  await apiRequest.get<BaseResponse<TBooking[]>>(API_SUFFIX.BOOKING_API);

/**
 * Lấy chi tiết 1 booking theo id
 * Endpoint: GET /api/booking/:id
 */
const getBookingById = async (id: string) =>
  await apiRequest.get<BaseResponse<TBooking>>(API_SUFFIX.BOOKING_API + `/${id}`);

/** Export chính xác dưới dạng BookingApi */
export const BookingApi = {
  createBooking,
  getBookingList,
  getBookingById,
};
