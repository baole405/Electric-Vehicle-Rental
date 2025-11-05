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
import { fmt } from '@/lib/utils';
import type { TRental } from '@/schema/rental.schema';
import { Calendar, Car, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { StaffCheckinDialog } from './StaffCheckinDialog';

// 🔥 HARDCODED MOCK DATA - Xóa khi backend có API
const MOCK_RENTALS: TRental[] = [
  {
    _id: 'rental-mock-001',
    booking: {
      _id: 'booking-001',
      bookingCode: 'BK20241106001',
      renterName: 'user',
      phoneNumber: '0901234567',
    },
    renter: {
      _id: 'user-001',
      fullName: 'user',
      phoneNumber: '0901234567',
    },
    vehicle: {
      _id: 'vehicle-001',
      licensePlate: '29A-12345',
      brand: { name: 'VinFast VF e34', code: 'VFE34' },
    },
    pickupStation: {
      _id: 'station-001',
      name: 'Trạm Quận 1',
      address: '123 Nguyễn Huệ, Q1, HCM',
    },
    pickupTime: '2024-11-06T08:00:00.000Z',
    status: 'READY_FOR_PICKUP',
    createdAt: '2024-11-05T10:00:00.000Z',
    updatedAt: '2024-11-06T07:00:00.000Z',
  },
  {
    _id: 'rental-mock-002',
    booking: {
      _id: 'booking-002',
      bookingCode: 'BK20241106002',
      renterName: 'user',
      phoneNumber: '0912345678',
    },
    renter: {
      _id: 'user-002',
      fullName: 'user',
      phoneNumber: '0912345678',
    },
    vehicle: {
      _id: 'vehicle-002',
      licensePlate: '51G-67890',
      brand: { name: 'Dat Bike Weaver 200', code: 'DBW200' },
    },
    pickupStation: {
      _id: 'station-001',
      name: 'Trạm Quận 1',
      address: '123 Nguyễn Huệ, Q1, HCM',
    },
    pickupTime: '2024-11-06T09:30:00.000Z',
    status: 'READY_FOR_PICKUP',
    createdAt: '2024-11-05T11:00:00.000Z',
    updatedAt: '2024-11-06T08:00:00.000Z',
  },
  {
    _id: 'rental-mock-003',
    booking: {
      _id: 'booking-003',
      bookingCode: 'BK20241106003',
      renterName: 'Customer User 1',
      phoneNumber: '0923456789',
    },
    renter: {
      _id: 'user-003',
      fullName: 'Customer User 1',
      phoneNumber: '0923456789',
    },
    vehicle: {
      _id: 'vehicle-003',
      licensePlate: '30F-11223',
      brand: { name: 'Yadea E8S', code: 'YDE8S' },
    },
    pickupStation: {
      _id: 'station-002',
      name: 'Trạm Quận 3',
      address: '456 Võ Văn Tần, Q3, HCM',
    },
    pickupTime: '2024-11-06T10:00:00.000Z',
    status: 'READY_FOR_PICKUP',
    createdAt: '2024-11-05T14:00:00.000Z',
    updatedAt: '2024-11-06T08:30:00.000Z',
  },
] as unknown as TRental[];

interface StaffCheckinListProps {
  stationId?: string;
  date?: string;
}

export function StaffCheckinList({ stationId, date }: StaffCheckinListProps) {
  const [selectedRental, setSelectedRental] = useState<TRental | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔥 HARDCODED - Use mock data
  const rentals = MOCK_RENTALS;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Đã refresh danh sách!');
    }, 500);
  };

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
      // 🔥 HARDCODED - Simulating staff confirm check-in → COMPLETED
      const bookingCode =
        typeof selectedRental.booking === 'object' &&
        selectedRental.booking !== null
          ? (selectedRental.booking as { bookingCode?: string })?.bookingCode
          : 'N/A';

      toast.success('✅ Check-in thành công!', {
        description: `Rental ${bookingCode} đã hoàn thành. Booking chuyển sang SUCCESS.`,
      });
      setDialogOpen(false);
      setSelectedRental(null);
      handleRefresh();
    } catch (error) {
      toast.error('❌ Lỗi check-in!', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🚗 Rentals Ready for Pickup
            </h2>
            <p className="text-sm text-gray-500">
              {date || new Date().toISOString().split('T')[0]} •{' '}
              {rentals.length} rental{rentals.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            🔄 Refresh
          </Button>
        </div>

        {rentals.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">
              Không có rental nào sẵn sàng check-in hôm nay
            </p>
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
        isLoading={false}
      />
    </>
  );
}
