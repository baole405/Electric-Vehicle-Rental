import { useMutation, useQuery } from "@tanstack/react-query";
import { BookingApi } from "@/apis/booking.api";
import type { TCreateBooking } from "@/schema/booking.schema";

export const useBooking = () => {
  const createBooking =
    useMutation({
      mutationFn: (request: TCreateBooking) => BookingApi.createBooking(request),
    });
  const useBookingList = () =>
    useQuery({
      queryKey: ["bookingList"],
      queryFn: () => BookingApi.getBookingList(),
    });
  const useBookingById = (id: string) =>
    useQuery({
      queryKey: ["bookingById", id],
      queryFn: () => BookingApi.getBookingById(id),
    });
  return {
    createBooking,
    useBookingList,
    useBookingById,
  };
};
