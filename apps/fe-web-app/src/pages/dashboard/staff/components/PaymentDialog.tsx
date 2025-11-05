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
import { usePaymentHook } from '@/hooks/use-payment';
import type { TBooking } from '@/schema/booking.schema';
import type { TPayment } from '@/schema/payment.schema';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type PaymentDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createPayment: ReturnType<typeof usePaymentHook>['createPayment'];
  onSuccess: () => void;
};

export function PaymentDialog({
  booking,
  open,
  onOpenChange,
  createPayment,
  onSuccess,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<string>(
    booking?.paymentMethod ?? 'cash'
  );
  const [amount, setAmount] = useState<number>(booking?.totalPayable ?? 0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setMethod(booking?.paymentMethod ?? 'cash');
    setAmount(booking?.totalPayable ?? 0);
    setNotes('');
  }, [booking]);

  if (!booking) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    try {
      await createPayment.mutateAsync({
        booking: booking._id,
        method,
        totalAmount: amount,
        notes: notes || undefined,
      } as unknown as Partial<TPayment>);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Không thể ghi nhận thanh toán.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          <DialogDescription>
            Booking: {booking.bookingCode || booking._id}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Phương thức</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                <SelectItem value="credit_card">Thẻ</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Số tiền</Label>
            <Input
              type="number"
              min={0}
              step="1000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
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
              disabled={createPayment.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
