import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RentalApi } from "@/apis/rental.api";
import type { TRental } from "@/schema/rental.schema";

type RentalListParams = {
  renterId?: string;
  status?: string;
};

export const useRentalHook = () => {
  const queryClient = useQueryClient();

  const useRentalList = (params?: RentalListParams, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["rentalList", params],
      queryFn: () => RentalApi.getRentalList(params),
      enabled: options?.enabled ?? true,
    });

  const useRentalById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["rentalDetail", id],
      queryFn: () => RentalApi.getRentalById(id),
      enabled: options?.enabled ?? Boolean(id),
    });

  const createRental = useMutation({
    mutationFn: (payload: Partial<TRental>) => RentalApi.createRental(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rentalList"] });
    },
  });

  const updateRental = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TRental> }) =>
      RentalApi.updateRental(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rentalList"] });
      void queryClient.invalidateQueries({ queryKey: ["rentalDetail"] });
    },
  });

  const deleteRental = useMutation({
    mutationFn: (id: string) => RentalApi.deleteRental(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rentalList"] });
    },
  });

  return {
    useRentalList,
    useRentalById,
    createRental,
    updateRental,
    deleteRental,
  };
};
