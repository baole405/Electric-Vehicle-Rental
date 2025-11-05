import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentApi } from "@/apis/payment.api";
import type { TPayment } from "@/schema/payment.schema";

type PaymentListParams = {
  renterId?: string;
  bookingId?: string;
  rentalId?: string;
  status?: string;
};

export const usePaymentHook = () => {
  const queryClient = useQueryClient();

  const usePaymentList = (params?: PaymentListParams, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["paymentList", params],
      queryFn: () => PaymentApi.getPaymentList(params),
      enabled: options?.enabled ?? true,
    });

  const usePaymentById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["paymentDetail", id],
      queryFn: () => PaymentApi.getPaymentById(id),
      enabled: options?.enabled ?? Boolean(id),
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

  const triggerTestCheckout = useMutation({
    mutationFn: (payload: { bookingId: string; method: string }) =>
      PaymentApi.triggerTestCheckout(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["paymentList"] });
      if (variables.bookingId) {
        void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
        void queryClient.invalidateQueries({ queryKey: ["bookingById", variables.bookingId] });
      }
      void queryClient.invalidateQueries({ queryKey: ["rentalList"] });
    },
  });

  return {
    usePaymentList,
    usePaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    triggerTestCheckout,
  };
};
