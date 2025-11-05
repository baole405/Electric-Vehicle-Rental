import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { useRentalHook } from '@/hooks/use-rental';
import { fmt } from '@/lib/utils';
import type { TRental } from '@/schema/rental.schema';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ContractSigningPageProps {
  rental: TRental;
  onSuccess?: () => void;
}

export function ContractSigningPage({
  rental,
  onSuccess,
}: ContractSigningPageProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { customerSignContract } = useRentalHook();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature) {
      toast.error('Please provide your signature');
      return;
    }

    if (!agreedTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const signature = canvas.toDataURL('image/png');

      await customerSignContract.mutateAsync({
        rentalId: rental._id,
        data: {
          signature,
          agreedTerms: true,
          signedAt: new Date().toISOString(),
        },
      });

      toast.success(
        '✅ Contract signed successfully! You can now use the vehicle.'
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/profile?tab=rentals');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign contract'
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Electronic Rental Contract
        </h1>
        <p className="mt-2 text-gray-600">
          Please review the terms and sign below to start your rental
        </p>
      </Card>

      {/* Rental Information */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Rental Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Booking Code</div>
            <div className="font-medium">
              {typeof rental.booking === 'object' && rental.booking !== null
                ? (rental.booking as { bookingCode?: string })?.bookingCode ||
                  'N/A'
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Vehicle</div>
            <div className="font-medium">
              {rental.vehicle?.plateNo || rental.vehicle?.vin || 'N/A'}
              {rental.vehicle?.brand && (
                <span className="ml-2 text-gray-500">
                  (
                  {typeof rental.vehicle.brand === 'string'
                    ? rental.vehicle.brand
                    : rental.vehicle.brand?.name || 'N/A'}
                  )
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Pickup Time</div>
            <div className="font-medium">{fmt(rental.pickupTime)}</div>
          </div>
          <div>
            <div className="text-gray-500">Planned Return Time</div>
            <div className="font-medium">
              {rental.returnTime ? fmt(rental.returnTime) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Pickup Station</div>
            <div className="font-medium">
              {rental.pickupStation?.name || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Return Station</div>
            <div className="font-medium">
              {rental.returnStation?.name ||
                rental.pickupStation?.name ||
                'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Terms and Conditions */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Terms and Conditions</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-2">
            <span className="font-medium">1.</span>
            <p>
              <strong>Return on Time:</strong> Vehicle must be returned by{' '}
              {rental.returnTime ? fmt(rental.returnTime) : 'scheduled time'}.
              Late return fee: <strong>200,000 VND per day</strong>.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">2.</span>
            <p>
              <strong>Vehicle Condition:</strong> Vehicle must be kept clean and
              undamaged. Cleaning fee: <strong>100,000 VND</strong> if returned
              dirty.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">3.</span>
            <p>
              <strong>Battery Level:</strong> Vehicle must have at least 20%
              battery on return. Low battery fee: <strong>150,000 VND</strong>.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">4.</span>
            <p>
              <strong>Damages:</strong> Any damages must be reported
              immediately. Repair costs will be charged based on assessment.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">5.</span>
            <p>
              <strong>Prohibited Use:</strong> Vehicle cannot be used for
              commercial purposes, racing, or illegal activities.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">6.</span>
            <p>
              <strong>Insurance:</strong> Basic insurance is included. Driver is
              responsible for damages exceeding insurance coverage.
            </p>
          </div>
        </div>
      </Card>

      {/* Signature Canvas */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Your Signature</h2>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="h-48 w-full cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
            >
              🗑️ Clear Signature
            </Button>
          </div>
        </div>
      </Card>

      {/* Agreement Checkbox */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="agree-terms"
            checked={agreedTerms}
            onCheckedChange={(checked) => setAgreedTerms(checked === true)}
          />
          <div className="space-y-1">
            <label
              htmlFor="agree-terms"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </label>
            <p className="text-xs text-gray-500">
              By signing this contract, I acknowledge that I have read,
              understood, and agree to all terms and conditions stated above.
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/profile?tab=rentals')}
          disabled={customerSignContract.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSign}
          disabled={
            !hasSignature || !agreedTerms || customerSignContract.isPending
          }
        >
          {customerSignContract.isPending ? 'Signing...' : '✍️ Sign Contract'}
        </Button>
      </div>
    </div>
  );
}
