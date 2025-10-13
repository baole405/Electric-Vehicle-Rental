import { useQuery } from "@tanstack/react-query";
import { RentalApi } from "@/apis/rental.api";


export const useRentalHook = () => {
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

  return {
    useRentalList,
    useRentalById,
  };
};
