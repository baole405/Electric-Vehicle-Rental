import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TPayment } from "@/schema/payment.schema";

const getPaymentList = async (params?: {
  renterId?: string;
  bookingId?: string;
  rentalId?: string;
  status?: string;
}) =>
  await apiRequest.get<BaseResponse<TPayment[]>>(API_SUFFIX.PAYMENT_API, {
    params,
  });

const getPaymentById = async (id: string) =>
  await apiRequest.get<BaseResponse<TPayment>>(API_SUFFIX.PAYMENT_API + `/${id}`);

const createPayment = async (payload: Partial<TPayment>) =>
  await apiRequest.post<BaseResponse<TPayment>>(API_SUFFIX.PAYMENT_API, payload);

const updatePayment = async (id: string, payload: Partial<TPayment>) =>
  await apiRequest.put<BaseResponse<TPayment>>(API_SUFFIX.PAYMENT_API + `/${id}`, payload);

const deletePayment = async (id: string) => await apiRequest.delete(API_SUFFIX.PAYMENT_API + `/${id}`);

const triggerTestCheckout = async (payload: { bookingId: string; method: string }) =>
  await apiRequest.post<BaseResponse<TPayment>>(`${API_SUFFIX.PAYMENT_API}/checkout/test`, payload);

export const PaymentApi = {
  getPaymentList,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  triggerTestCheckout,
};
