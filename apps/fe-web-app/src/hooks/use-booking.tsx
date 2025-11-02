import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingApi } from "@/apis/booking.api";
import type {
  TBooking,
  TCreateBooking,
  TAssignVehicle,
  TUpdateBookingStatus
} from "@/schema/booking.schema";

export const useBooking = () => {
  const queryClient = useQueryClient();

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

  const createBooking = useMutation({
    mutationFn: (request: TCreateBooking) => BookingApi.createBooking(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
    },
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TBooking> }) =>
      BookingApi.updateBooking(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
      void queryClient.invalidateQueries({ queryKey: ["bookingById"] });
    },
  });

  const deleteBooking = useMutation({
    mutationFn: (id: string) => BookingApi.deleteBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
    },
  });

  const cancelBooking = useMutation({
    mutationFn: (id: string) => BookingApi.cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
      void queryClient.invalidateQueries({ queryKey: ["bookingById"] });
    },
  });

  const assignVehicle = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: TAssignVehicle }) =>
      BookingApi.assignVehicle(bookingId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
      void queryClient.invalidateQueries({ queryKey: ["bookingById"] });
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: TUpdateBookingStatus }) =>
      BookingApi.updateBookingStatus(bookingId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
      void queryClient.invalidateQueries({ queryKey: ["bookingById"] });
    },
  });

  const confirmBooking = useMutation({
    mutationFn: (bookingId: string) => BookingApi.confirmBooking(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookingList"] });
      void queryClient.invalidateQueries({ queryKey: ["bookingById"] });
    },
  });

  return {
    useBookingList,
    useBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    cancelBooking,
    assignVehicle,
    updateBookingStatus,
    confirmBooking,
  };
};
