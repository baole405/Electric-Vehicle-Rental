import { RentalApi } from '@/apis/rental.api';
import type { TRental } from '@/schema/rental.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type RentalListParams = {
  renterId?: string;
  status?: string;
};

export const useRentalHook = () => {
  const queryClient = useQueryClient();

  const useRentalList = (
    params?: RentalListParams,
    options?: { enabled?: boolean }
  ) =>
    useQuery({
      queryKey: ['rentalList', params],
      queryFn: () => RentalApi.getRentalList(params),
      enabled: options?.enabled ?? true,
    });

  const useRentalById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ['rentalDetail', id],
      queryFn: () => RentalApi.getRentalById(id),
      enabled: options?.enabled ?? Boolean(id),
    });

  const createRental = useMutation({
    mutationFn: (payload: Partial<TRental>) => RentalApi.createRental(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentalList'] });
    },
  });

  const updateRental = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TRental> }) =>
      RentalApi.updateRental(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentalList'] });
      void queryClient.invalidateQueries({ queryKey: ['rentalDetail'] });
    },
  });

  const deleteRental = useMutation({
    mutationFn: (id: string) => RentalApi.deleteRental(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentalList'] });
    },
  });

  const useReadyForPickupRentals = (params?: {
    stationId?: string;
    date?: string;
  }) =>
    useQuery({
      queryKey: ['readyForPickupRentals', params],
      queryFn: () => RentalApi.getReadyForPickupRentals(params),
    });

  const staffConfirmCheckin = useMutation({
    mutationFn: ({
      rentalId,
      data,
    }: {
      rentalId: string;
      data: {
        staffId: string;
        checkinTime: string;
        notes?: string;
      };
    }) => RentalApi.staffConfirmCheckin(rentalId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentalList'] });
      void queryClient.invalidateQueries({
        queryKey: ['readyForPickupRentals'],
      });
      void queryClient.invalidateQueries({ queryKey: ['rentalDetail'] });
    },
  });

  const customerSignContract = useMutation({
    mutationFn: ({
      rentalId,
      data,
    }: {
      rentalId: string;
      data: {
        signature: string;
        agreedTerms: boolean;
        signedAt: string;
      };
    }) => RentalApi.customerSignContract(rentalId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentalList'] });
      void queryClient.invalidateQueries({ queryKey: ['bookingList'] });
      void queryClient.invalidateQueries({ queryKey: ['rentalDetail'] });
    },
  });

  return {
    useRentalList,
    useRentalById,
    createRental,
    updateRental,
    deleteRental,
    useReadyForPickupRentals,
    staffConfirmCheckin,
    customerSignContract,
  };
};
