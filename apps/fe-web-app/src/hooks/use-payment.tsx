import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentApi } from "@/apis/payment.api";
import type { TPayment } from "@/schema/payment.schema";

export const usePaymentHook = () => {
  const queryClient = useQueryClient();

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

  const createPayment = useMutation({
    mutationFn: (payload: Partial<TPayment>) => PaymentApi.createPayment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["paymentList"] });
    },
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TPayment> }) =>
      PaymentApi.updatePayment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["paymentList"] });
      void queryClient.invalidateQueries({ queryKey: ["paymentDetail"] });
    },
  });

  const deletePayment = useMutation({
    mutationFn: (id: string) => PaymentApi.deletePayment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["paymentList"] });
    },
  });

  return {
    usePaymentList,
    usePaymentById,
    createPayment,
    updatePayment,
    deletePayment,
  };
};
