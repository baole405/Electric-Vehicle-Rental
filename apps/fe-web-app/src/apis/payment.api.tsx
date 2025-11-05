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

const createPayOSCheckout = async (payload: { bookingId: string }) => {
  console.log('[PaymentApi] createPayOSCheckout called with:', payload);
  try {
    const response = await apiRequest.post<PayOSCheckoutResponse>(
      '/api/payos/checkout',
      payload
    );
    console.log('[PaymentApi] createPayOSCheckout response:', response);
    return response;
  } catch (error) {
    console.error('[PaymentApi] createPayOSCheckout error:', error);
    throw error;
  }
};

// PayOS Payment Verification
export interface PayOSVerifyRequest {
  bookingId: string;
  orderCode: string;
}

export interface PayOSVerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
    paymentStatus: string;
    bookingStatus: string;
    amount: number;
    transactionDate: string;
    orderCode: string;
  };
}

const verifyPayOSPayment = async (payload: PayOSVerifyRequest) => {
  console.log('[PaymentApi] verifyPayOSPayment called with:', payload);
  try {
    const response = await apiRequest.post<PayOSVerifyResponse>(
      '/api/payos/verify-payment',
      payload
    );
    console.log('[PaymentApi] verifyPayOSPayment response:', response);
    return response;
  } catch (error) {
    console.error('[PaymentApi] verifyPayOSPayment error:', error);
    throw error;
  }
};

export const PaymentApi = {
  getPaymentList,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  triggerTestCheckout,
  createPayOSCheckout,
  verifyPayOSPayment,
};
