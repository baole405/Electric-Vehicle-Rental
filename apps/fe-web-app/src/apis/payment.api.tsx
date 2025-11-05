import { apiRequest } from '@/lib/http';
import type { BaseResponse } from '@/schema/common/response.type';
import type { TPayment } from '@/schema/payment.schema';
import { API_SUFFIX } from './util.api';

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
  await apiRequest.get<BaseResponse<TPayment>>(
    API_SUFFIX.PAYMENT_API + `/${id}`
  );

const createPayment = async (payload: Partial<TPayment>) =>
  await apiRequest.post<BaseResponse<TPayment>>(
    API_SUFFIX.PAYMENT_API,
    payload
  );

const updatePayment = async (id: string, payload: Partial<TPayment>) =>
  await apiRequest.put<BaseResponse<TPayment>>(
    API_SUFFIX.PAYMENT_API + `/${id}`,
    payload
  );

const deletePayment = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.PAYMENT_API + `/${id}`);

const triggerTestCheckout = async (payload: {
  bookingId: string;
  method: string;
}) =>
  await apiRequest.post<BaseResponse<TPayment>>(
    `${API_SUFFIX.PAYMENT_API}/checkout/test`,
    payload
  );

// PayOS Real Checkout
export interface PayOSCheckoutResponse {
  orderCode: string;
  checkoutData: {
    checkoutUrl: string;
    qrCode: string;
    accountNumber: string;
    amount: number;
    description: string;
  };
}

const createPayOSCheckout = async (payload: { bookingId: string }) =>
  await apiRequest.post<BaseResponse<PayOSCheckoutResponse>>(
    '/api/payos/checkout',
    payload
  );

export const PaymentApi = {
  getPaymentList,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  triggerTestCheckout,
  createPayOSCheckout,
};
