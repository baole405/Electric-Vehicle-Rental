import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { useRentalHook } from '@/hooks/use-rental';
import { fmt } from '@/lib/utils';
import type { TRental } from '@/schema/rental.schema';
import { Calendar, Car, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { StaffCheckinDialog } from './StaffCheckinDialog';

interface StaffCheckinListProps {
  stationId?: string;
  date?: string;
}

export function StaffCheckinList({ stationId, date }: StaffCheckinListProps) {
  const { useReadyForPickupRentals, staffConfirmCheckin } = useRentalHook();
  const [selectedRental, setSelectedRental] = useState<TRental | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const readyRentalsQuery = useReadyForPickupRentals({
    stationId,
    date: date || new Date().toISOString().split('T')[0],
  });

  const rentals = (readyRentalsQuery.data?.data?.data ?? []) as TRental[];

  const handleConfirmCheckin = (rental: TRental) => {
    setSelectedRental(rental);
    setDialogOpen(true);
  };

  const handleSubmitCheckin = async (data: {
    staffId: string;
    notes: string;
  }) => {
    if (!selectedRental) return;

    try {
      await staffConfirmCheckin.mutateAsync({
        rentalId: selectedRental._id,
        data: {
          staffId: data.staffId,
          checkinTime: new Date().toISOString(),
          notes: data.notes,
        },
      });

      toast.success(
        '✅ Check-in confirmed! Contract ready for customer signature.'
      );
      setDialogOpen(false);
      setSelectedRental(null);
      void readyRentalsQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to confirm check-in'
      );
    }
  };

  if (readyRentalsQuery.isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading rentals...</div>
      </Card>
    );
  }

  if (readyRentalsQuery.isError) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Failed to load rentals. Please try again.
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Rentals Ready for Pickup
            </h2>
            <p className="text-sm text-gray-500">
              {date || new Date().toISOString().split('T')[0]} •{' '}
              {rentals.length} rental{rentals.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => readyRentalsQuery.refetch()}
          >
            🔄 Refresh
          </Button>
        </div>

        {rentals.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No rentals ready for pickup today</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Pickup Time</TableHead>
                <TableHead>Station</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental._id}>
                  <TableCell>
                    <div className="font-medium">
                      {typeof rental.booking === 'object' &&
                      rental.booking !== null
                        ? (rental.booking as { bookingCode?: string })
                            ?.bookingCode || 'N/A'
                        : 'N/A'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">
                          {rental.renter?.fullName || 'N/A'}
                        </span>
                      </div>
                      {rental.renter?.phone && (
                        <div className="text-xs text-gray-500">
                          📞 {rental.renter.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">
                          {rental.vehicle?.plateNo ||
                            rental.vehicle?.vin ||
                            'N/A'}
                        </span>
                      </div>
                      {rental.vehicle?.brand && (
                        <div className="text-xs text-gray-500">
                          {typeof rental.vehicle.brand === 'string'
                            ? rental.vehicle.brand
                            : rental.vehicle.brand?.name || 'N/A'}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>{fmt(rental.pickupTime)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm">
                        {rental.pickupStation?.name || 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleConfirmCheckin(rental)}
                      disabled={staffConfirmCheckin.isPending}
                    >
                      ✅ Confirm Check-in
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <StaffCheckinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rental={selectedRental}
        onSubmit={handleSubmitCheckin}
        isLoading={staffConfirmCheckin.isPending}
      />
    </>
  );
}
