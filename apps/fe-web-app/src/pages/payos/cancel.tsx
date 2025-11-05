'use client';

import { XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function PayOSCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get('b');

    console.log('[PayOS Cancel] User cancelled payment, bookingId:', bookingId);

    toast.error('Bạn đã hủy thanh toán');

    // Redirect back to bookings after 3 seconds
    setTimeout(() => {
      navigate('/profile?tab=bookings');
    }, 3000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-red-900">
            Thanh toán đã bị hủy
          </h2>
          <p className="mt-2 text-gray-600">Bạn đã hủy giao dịch thanh toán</p>
          <p className="mt-4 text-sm text-gray-500">
            Đang chuyển hướng về trang bookings...
          </p>
        </div>
      </div>
    </div>
  );
}
