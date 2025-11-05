import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { useBooking } from '@/hooks/use-booking';
import { cn } from '@/lib/utils';
import type { TBooking } from '@/schema/booking.schema';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  getNextStatuses,
  STATUS_COLORS,
  STATUS_LABELS,
} from './booking-constants';

type UpdateBookingStatusDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function UpdateBookingStatusDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: UpdateBookingStatusDialogProps) {
  const { updateBookingStatus } = useBooking();
  const [newStatus, setNewStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const nextStatuses = booking ? getNextStatuses(booking.status) : [];

  const handleUpdate = async () => {
    if (!newStatus || !booking) return;

    // Validate cancellation reason
    if (newStatus === 'cancelled' && !cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: {
          status: newStatus as TBooking['status'],
          ...(newStatus === 'cancelled' && { cancellationReason }),
        },
      });

      toast.success(`Đã cập nhật sang "${STATUS_LABELS[newStatus]}"`);

      setNewStatus('');
      setCancellationReason('');
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể cập nhật'
      );
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>{booking.bookingCode}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm text-gray-600 mb-1">Hiện tại</div>
            <Badge
              variant="outline"
              className={cn('font-medium', STATUS_COLORS[booking.status])}
            >
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>

          {nextStatuses.length > 0 ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Trạng thái mới
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Chọn trạng thái --" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === 'cancelled' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Lý do hủy <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập lý do..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-3 border">
              <p className="text-sm text-yellow-800">
                Không thể cập nhật từ {STATUS_LABELS[booking.status]}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateBookingStatus.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                !newStatus ||
                nextStatuses.length === 0 ||
                updateBookingStatus.isPending
              }
            >
              {updateBookingStatus.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
