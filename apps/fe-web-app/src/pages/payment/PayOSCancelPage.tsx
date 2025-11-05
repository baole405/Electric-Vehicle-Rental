import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function PayOSCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('b');

  useEffect(() => {
    toast.warning('Bạn đã hủy thanh toán');
  }, []);

  const handleRetry = () => {
    if (bookingId) {
      navigate('/profile?tab=bookings');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Thanh toán đã bị hủy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6">
            <XCircle className="h-16 w-16 text-amber-600" />
            <p className="text-center text-muted-foreground">
              Bạn đã hủy quá trình thanh toán.
              <br />
              <span className="text-xs">
                Booking của bạn vẫn được giữ và chờ thanh toán.
              </span>
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
              <Button onClick={handleRetry}>Quay lại bookings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
