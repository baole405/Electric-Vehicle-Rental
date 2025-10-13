import { useQuery } from "@tanstack/react-query";
import { PaymentApi } from "@/apis/payment.api";


export const usePaymentHook = () => {
  const usePaymentList = () =>
    useQuery({
      queryKey: ["paymentList"],
      queryFn: () => PaymentApi.getPaymentList(),
    });

  const usePaymentById = (id: string) =>
    useQuery({
      queryKey: ["paymentDetail", id],
      queryFn: () => PaymentApi.getPaymentById(id),
    });

  return {
    usePaymentList,
    usePaymentById,
  };
};
