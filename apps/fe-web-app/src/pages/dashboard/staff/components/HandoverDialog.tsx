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
import { Textarea } from '@/components/shadcn/ui/textarea';
import { useHandoverHook } from '@/hooks/use-handover';
import type { TRental } from '@/schema/rental.schema';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type HandoverDialogProps = {
  context: { rental: TRental; type: 'pickup' | 'return' } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createHandover: ReturnType<typeof useHandoverHook>['createHandover'];
  onSuccess: (message?: string) => void;
};

export function HandoverDialog({
  context,
  open,
  onOpenChange,
  createHandover,
  onSuccess,
}: HandoverDialogProps) {
  const [stationId, setStationId] = useState<string>('');
  const [odo, setOdo] = useState<string>('');
  const [battery, setBattery] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!context) {
      setStationId('');
      setOdo('');
      setBattery('');
      setNotes('');
      setFiles([]);
      return;
    }
    const defaultStation =
      context.type === 'pickup'
        ? context.rental.pickupStation?._id ?? ''
        : context.rental.returnStation?._id ??
          context.rental.pickupStation?._id ??
          '';
    setStationId(defaultStation);
    setOdo('');
    setBattery('');
    setNotes('');
    setFiles([]);
  }, [context]);

  if (!context) {
    return null;
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFiles(Array.from(event.target.files));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stationId) {
      toast.error('Vui lòng nhập mã trạm.');
      return;
    }
    try {
      await createHandover.mutateAsync({
        rental: context.rental._id,
        stationId,
        type: context.type,
        odoReading: odo ? Number(odo) : undefined,
        batteryPercent: battery ? Number(battery) : undefined,
        notes: notes || undefined,
        photos: files.length > 0 ? files : undefined,
      });
      const successMessage =
        context.type === 'pickup'
          ? 'Đã ghi nhận bàn giao nhận xe.'
          : 'Đã ghi nhận bàn giao trả xe.';
      onSuccess(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Không thể tạo biên bản bàn giao.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {context.type === 'pickup' ? 'Bàn giao nhận xe' : 'Bàn giao trả xe'}
          </DialogTitle>
          <DialogDescription>Rental: {context.rental._id}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Mã trạm</Label>
            <Input
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số km (ODO)</Label>
              <Input
                type="number"
                min={0}
                value={odo}
                onChange={(event) => setOdo(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>% pin</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={battery}
                onChange={(event) => setBattery(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ảnh minh chứng (tối đa 6)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
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
              disabled={createHandover.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={createHandover.isPending}>
              {createHandover.isPending ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
