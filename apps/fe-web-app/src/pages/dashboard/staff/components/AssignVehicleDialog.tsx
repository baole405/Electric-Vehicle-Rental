import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { useBooking } from '@/hooks/use-booking';
import type { TBooking } from '@/schema/booking.schema';
import type { TVehicle } from '@/schema/vehicle.schema';
import { useState } from 'react';
import { toast } from 'sonner';

type AssignVehicleDialogProps = {
  booking: TBooking | null;
  availableVehicles: TVehicle[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AssignVehicleDialog({
  booking,
  availableVehicles,
  open,
  onOpenChange,
  onSuccess,
}: AssignVehicleDialogProps) {
  const { assignVehicle } = useBooking();
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const handleAssign = async () => {
    if (!selectedVehicleId || !booking) return;

    try {
      await assignVehicle.mutateAsync({
        bookingId: booking._id,
        data: { vehicleId: selectedVehicleId },
      });

      toast.success('Đã gán xe cho booking!');

      setSelectedVehicleId('');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gán xe');
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán xe cho Booking</DialogTitle>
          <DialogDescription>
            Chọn xe cụ thể để gán cho {booking.bookingCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-sm text-gray-600">Dòng xe</div>
            <div className="font-semibold">{booking.brand?.name}</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Chọn xe ({availableVehicles.length})
            </label>
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn xe --" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.length === 0 ? (
                  <SelectItem value="" disabled>
                    Không có xe khả dụng
                  </SelectItem>
                ) : (
                  availableVehicles.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.model} · {v.plateNo ?? v.vin}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignVehicle.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedVehicleId || assignVehicle.isPending}
            >
              {assignVehicle.isPending ? 'Đang gán...' : 'Gán xe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
