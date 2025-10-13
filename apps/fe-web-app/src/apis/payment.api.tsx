import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TPayment } from "@/schema/payment.schema";


const getPaymentList = async () =>
  await apiRequest.get<BaseResponse<TPayment[]>>(API_SUFFIX.PAYMENT_API);


const getPaymentById = async (id: string) =>
  await apiRequest.get<BaseResponse<TPayment>>(API_SUFFIX.PAYMENT_API + `/${id}`);



export const PaymentApi = {
  getPaymentList,
  getPaymentById,
};
