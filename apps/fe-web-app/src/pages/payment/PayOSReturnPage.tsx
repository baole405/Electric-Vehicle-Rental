import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { useBooking } from '@/hooks/use-booking';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function PayOSReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('b');
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const { useBookingById } = useBooking();

  // Enable polling by refetching
  const bookingQuery = useBookingById(bookingId ?? '');

  // Poll every 2 seconds
  useEffect(() => {
    if (!bookingId || !checking) return;

    const interval = setInterval(() => {
      void bookingQuery.refetch();
      setPollCount((prev) => prev + 1);
    }, 2000);

    // Stop polling after 30 attempts (1 minute)
    if (pollCount > 30) {
      clearInterval(interval);
      setChecking(false);
      toast.error(
        'Timeout: Không thể xác minh thanh toán. Vui lòng kiểm tra lại.'
      );
      setTimeout(() => navigate('/profile?tab=bookings'), 2000);
    }

    return () => clearInterval(interval);
  }, [bookingId, checking, pollCount, bookingQuery, navigate]);

  useEffect(() => {
    if (!bookingId) {
      toast.error('Thiếu thông tin booking');
      navigate('/profile?tab=bookings');
      return;
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    const booking = bookingQuery.data?.data?.data;

    if (!booking) return;

    const normalizedStatus = booking.status?.toUpperCase();

    // Check if payment is successful
    if (normalizedStatus === 'PAID' || normalizedStatus === 'SUCCESS') {
      setSuccess(true);
      setChecking(false);
      toast.success('Thanh toán thành công! 🎉');

      // Redirect to booking detail after 2 seconds
      setTimeout(() => {
        navigate('/profile?tab=bookings');
      }, 2000);
    } else if (
      normalizedStatus === 'CANCELLED' ||
      normalizedStatus === 'FAILED'
    ) {
      setSuccess(false);
      setChecking(false);
      toast.error('Thanh toán thất bại hoặc đã bị hủy');

      setTimeout(() => {
        navigate('/profile?tab=bookings');
      }, 2000);
    }
  }, [bookingQuery.data, navigate]);

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {checking
              ? 'Đang xử lý thanh toán...'
              : success
              ? 'Thanh toán thành công!'
              : 'Thanh toán không thành công'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6">
            {checking ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <p className="text-center text-muted-foreground">
                  Vui lòng đợi trong giây lát...
                  <br />
                  <span className="text-xs">
                    Chúng tôi đang xác minh thanh toán của bạn
                  </span>
                </p>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <p className="text-center text-muted-foreground">
                  Booking của bạn đã được xác nhận!
                  <br />
                  <span className="text-xs">
                    Đang chuyển hướng về trang booking...
                  </span>
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-600" />
                <p className="text-center text-muted-foreground">
                  Vui lòng thử lại hoặc liên hệ hỗ trợ
                  <br />
                  <span className="text-xs">
                    Đang chuyển hướng về trang booking...
                  </span>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
