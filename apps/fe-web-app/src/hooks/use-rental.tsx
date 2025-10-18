import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RentalApi } from "@/apis/rental.api";
import type { TRental } from "@/schema/rental.schema";

export const useRentalHook = () => {
  const queryClient = useQueryClient();

  const useRentalList = () =>
    useQuery({
      queryKey: ["rentalList"],
      queryFn: () => RentalApi.getRentalList(),
    });

  const useRentalById = (id: string) =>
    useQuery({
      queryKey: ["rentalDetail", id],
      queryFn: () => RentalApi.getRentalById(id),
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
