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
import { useAuthContext } from '@/contexts/auth-context';
import { fmt } from '@/lib/utils';
import type { TRental } from '@/schema/rental.schema';
import { useState } from 'react';

interface StaffCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: TRental | null;
  onSubmit: (data: { staffId: string; notes: string }) => void;
  isLoading?: boolean;
}

export function StaffCheckinDialog({
  open,
  onOpenChange,
  rental,
  onSubmit,
  isLoading = false,
}: StaffCheckinDialogProps) {
  const { currentUser } = useAuthContext();
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?._id) {
      alert('Staff ID not found. Please log in again.');
      return;
    }
    onSubmit({
      staffId: currentUser._id,
      notes,
    });
  };

  const handleClose = () => {
    setNotes('');
    onOpenChange(false);
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Customer Check-in</DialogTitle>
          <DialogDescription>
            Verify customer arrival and vehicle readiness before confirming
            check-in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Rental Info */}
            <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Booking Code</div>
                  <div className="font-medium">
                    {typeof rental.booking === 'object' &&
                    rental.booking !== null
                      ? (rental.booking as { bookingCode?: string })
                          ?.bookingCode || 'N/A'
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Customer</div>
                  <div className="font-medium">
                    {rental.renter?.fullName || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Vehicle</div>
                  <div className="font-medium">
                    {rental.vehicle?.plateNo || rental.vehicle?.vin || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Pickup Time</div>
                  <div className="font-medium">{fmt(rental.pickupTime)}</div>
                </div>
              </div>
            </div>

            {/* Staff Info (Read-only) */}
            <div className="space-y-2">
              <Label>Staff Confirming</Label>
              <Input
                value={currentUser?.fullName || currentUser?.email || 'N/A'}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Check-in Time (Auto) */}
            <div className="space-y-2">
              <Label>Check-in Time</Label>
              <Input
                value={new Date().toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Customer arrived on time, vehicle ready..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Warning Box */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⚠️ <strong>Next step:</strong> After confirming check-in, customer
              must sign the rental contract before using the vehicle.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Confirming...' : '✅ Confirm Check-in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
