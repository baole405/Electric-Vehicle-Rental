import { PaymentApi } from '@/apis/payment.api';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type Status = 'processing' | 'success' | 'failed' | 'timeout';

export default function PayOSReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('processing');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // 1. Parse query parameters
        const bookingId = searchParams.get('b');
        const payosCode = searchParams.get('code');
        const payosStatus = searchParams.get('status');
        const orderCode = searchParams.get('orderCode');
        const cancel = searchParams.get('cancel');

        console.log('[PayOS Return] Params:', {
          bookingId,
          payosCode,
          payosStatus,
          orderCode,
          cancel,
        });

        // 2. Validate params
        if (!bookingId || !orderCode) {
          console.error('[PayOS Return] Missing bookingId or orderCode');
          toast.error('Thiếu thông tin thanh toán');
          navigate('/profile?tab=bookings');
          return;
        }

        // 3. Check if cancelled
        if (cancel === 'true' || payosStatus === 'CANCELLED') {
          console.log('[PayOS Return] Payment was cancelled');
          setStatus('failed');
          toast.error('Đã hủy thanh toán');
          setTimeout(() => {
            navigate('/profile?tab=bookings');
          }, 3000);
          return;
        }

        // 4. Call verify API (NEW - replaces polling!)
        console.log('[PayOS Return] Calling verify payment API...');

        const verifyResponse = await PaymentApi.verifyPayOSPayment({
          bookingId,
          orderCode,
        });

        console.log('[PayOS Return] Verify response:', verifyResponse);

        // Check if verification successful
        const verifyData = verifyResponse.data;

        if (
          verifyData?.success &&
          verifyData.data?.verified &&
          (verifyData.data.bookingStatus === 'PAID' ||
            verifyData.data.bookingStatus === 'SUCCESS')
        ) {
          setStatus('success');
          toast.success('Thanh toán thành công! 🎉');

          // Redirect to bookings list
          setTimeout(() => {
            navigate('/profile?tab=bookings');
          }, 2000);
          return;
        }

        // Payment not verified or failed
        console.warn('[PayOS Return] Payment not verified:', verifyResponse);
        setStatus('failed');
        toast.error('Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.');

        setTimeout(() => {
          navigate('/profile?tab=bookings');
        }, 3000);
      } catch (error) {
        // Top-level error catch
        console.error('[PayOS Return] Fatal error:', error);
        setStatus('failed');
        toast.error('Đã xảy ra lỗi. Đang chuyển về trang bookings...');
        setTimeout(() => {
          navigate('/profile?tab=bookings');
        }, 3000);
      }
    };

    handlePaymentReturn();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'processing' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Đang xử lý thanh toán...
            </h2>
            <p className="mt-2 text-gray-600">
              Vui lòng đợi trong khi chúng tôi xác minh thanh toán của bạn
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-green-900">
              Thanh toán thành công!{' '}
              <span role="img" aria-label="party">
                🎉
              </span>
            </h2>
            <p className="mt-2 text-gray-600">
              Đang chuyển hướng đến danh sách booking...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-red-900">
              Thanh toán thất bại
            </h2>
            <p className="mt-2 text-gray-600">
              Vui lòng thử lại hoặc liên hệ hỗ trợ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
