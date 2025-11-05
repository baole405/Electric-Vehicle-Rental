import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { useRentalHook } from '@/hooks/use-rental';
import type { TBooking } from '@/schema/booking.schema';
import type { TRental } from '@/schema/rental.schema';
import type { TVehicle } from '@/schema/vehicle.schema';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type CreateRentalDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: TVehicle[];
  createRental: ReturnType<typeof useRentalHook>['createRental'];
  onSuccess: () => void;
};

export function CreateRentalDialog({
  booking,
  open,
  onOpenChange,
  vehicles,
  createRental,
  onSuccess,
}: CreateRentalDialogProps) {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [stationId, setStationId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setVehicleId(booking?.assignedVehicle?._id ?? '');
    const pickupStation =
      booking?.pickupStation?._id ?? booking?.station?._id ?? '';
    setStationId(pickupStation);
    setNotes('');
  }, [booking]);

  if (!booking) {
    return null;
  }

  const vehiclesForBrand = vehicles.filter((vehicle) => {
    const brandId =
      typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?._id;
    return brandId === booking.brand?._id && vehicle.status === 'available';
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleId) {
      toast.error('Vui lòng chọn xe để tạo rental.');
      return;
    }
    if (!stationId) {
      toast.error('Vui lòng nhập mã trạm bàn giao.');
      return;
    }

    try {
      await createRental.mutateAsync({
        booking: booking._id,
        vehicle: vehicleId,
        pickupStation: stationId,
        notes: notes || undefined,
      } as unknown as Partial<TRental>);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể tạo rental.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo rental</DialogTitle>
          <DialogDescription>
            Booking: {booking.bookingCode || booking._id}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Chọn xe</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn xe" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesForBrand.map((vehicle) => (
                  <SelectItem key={vehicle._id} value={vehicle._id}>
                    {vehicle.model} · {vehicle.plateNo ?? vehicle.vin}
                  </SelectItem>
                ))}
                {vehiclesForBrand.length === 0 && (
                  <SelectItem value="" disabled>
                    Không có xe khả dụng
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mã trạm bàn giao</Label>
            <Input
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ghi chú thêm (tuỳ chọn)"
            />
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createRental.isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={createRental.isPending || vehiclesForBrand.length === 0}
            >
              {createRental.isPending ? 'Đang tạo...' : 'Tạo rental'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
