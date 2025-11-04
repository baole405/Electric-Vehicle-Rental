import { Button } from '@/components/shadcn/ui/button';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { useAuthContext } from '@/contexts/auth-context';
import { useBooking } from '@/hooks/use-booking';
import type { TCreateBookingForm } from '@/schema/booking.schema';
import {
  CreateBookingFormSchema,
  convertFormToBookingAPI,
} from '@/schema/booking.schema';
import type { TBrand } from '@/schema/brand.schema';
import type { TVehicle } from '@/schema/vehicle.schema';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  brand: TBrand; // Changed from TBrandWithAvailability
  vehicle?: TVehicle; // Add vehicle info
  stationId: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

export default function CreateBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { createBooking } = useBooking();
  const { currentUser } = useAuthContext();

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<TCreateBookingForm>({
    renterName: currentUser?.fullName || '',
    phoneNumber: currentUser?.phone || '',
    email: currentUser?.email || '',
    brandId: '',
    stationId: '',
    vehicleId: state?.vehicle?._id, // Add vehicle ID if specific vehicle selected
    pickupDate: state?.pickupDate || today,
    pickupTime: state?.pickupTime || '10:00',
    returnDate: state?.returnDate || today,
    returnTime: state?.returnTime || '10:00',
    paymentMethod: 'bank_transfer',
    agreedToPaymentTerms: false,
    agreedToDataSharing: false,
    pickupLocation: '',
    promoCode: '',
    notes: '',
  });
  const [pricing, setPricing] = useState({
    rentalDays: 1,
    basePrice: 0,
    additionalFees: 0,
    totalRentalFee: 0,
    depositAmount: 0,
    totalPayable: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [showPaymentTerms, setShowPaymentTerms] = useState(false);
  const [showDataPolicy, setShowDataPolicy] = useState(false);

  // Initialize form with brand and station
  useEffect(() => {
    if (state?.brand && state?.stationId) {
      setFormData((prev) => ({
        ...prev,
        brandId: state.brand._id,
        stationId: state.stationId,
      }));
    }
  }, [state]);

  // Calculate pricing
  useEffect(() => {
    if (!state?.brand || !formData.pickupDate || !formData.returnDate) return;

    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const returnD = new Date(`${formData.returnDate}T${formData.returnTime}`);
    const diffMs = returnD.getTime() - pickup.getTime();
    const rentalDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);

    // Calculate weekend days
    let additionalFees = 0;
    const current = new Date(pickup);
    while (current < returnD) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        additionalFees += 100000;
      }
      current.setDate(current.getDate() + 1);
    }

    const basePrice = state.brand.baseDailyRate * rentalDays;
    const totalRentalFee = basePrice + additionalFees;
    const depositAmount = state.brand.depositAmount;
    const totalPayable = totalRentalFee + depositAmount;

    setPricing({
      rentalDays,
      basePrice,
      additionalFees,
      totalRentalFee,
      depositAmount,
      totalPayable,
    });
  }, [
    formData.pickupDate,
    formData.pickupTime,
    formData.returnDate,
    formData.returnTime,
    state?.brand,
  ]);

  const handleChange = (
    field: keyof TCreateBookingForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field errors when user makes changes
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up optional fields - remove empty strings
    const cleanedData: TCreateBookingForm = {
      ...formData,
      pickupLocation: formData.pickupLocation?.trim() || undefined,
      promoCode: formData.promoCode?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    // Debug log before validation
    console.log('🔍 Form data before validation:', cleanedData);
    console.log('📋 Brand ID:', cleanedData.brandId);
    console.log('📋 Station ID:', cleanedData.stationId);
    console.log('📋 Phone:', cleanedData.phoneNumber);
    console.log('📋 Email:', cleanedData.email);

    // Validate with Zod schema
    try {
      CreateBookingFormSchema.parse(cleanedData);
      console.log('✅ Form validation passed');
      // Clear any existing field errors on successful validation
      setFieldErrors({});
    } catch (zodError) {
      console.error('❌ Form validation failed:', zodError);
      const err = zodError as {
        errors?: Array<{ path: string[]; message: string }>;
      };

      // Handle field-specific errors
      const newFieldErrors: Record<string, string> = {};
      const generalErrors: string[] = [];

      err.errors?.forEach((error) => {
        const field = error.path[0];
        if (field === 'agreedToPaymentTerms') {
          newFieldErrors.agreedToPaymentTerms =
            'Bạn phải đọc và đồng ý với điều khoản thanh toán để tiếp tục';
        } else if (field === 'agreedToDataSharing') {
          newFieldErrors.agreedToDataSharing =
            'Bạn phải đồng ý với điều khoản chia sẻ dữ liệu cá nhân để tiếp tục';
        } else if (field === 'pickupDate') {
          newFieldErrors.pickupDate = 'Ngày nhận xe không hợp lệ';
        } else if (field === 'pickupTime') {
          newFieldErrors.pickupTime = 'Thời gian nhận xe không hợp lệ';
        } else if (field === 'returnDate') {
          newFieldErrors.returnDate = 'Ngày trả xe không hợp lệ';
        } else if (field === 'returnTime') {
          newFieldErrors.returnTime = 'Thời gian trả xe không hợp lệ';
        } else if (field === 'renterName') {
          newFieldErrors.renterName = 'Họ tên không được để trống';
        } else if (field === 'phoneNumber') {
          newFieldErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        } else if (field === 'email') {
          newFieldErrors.email = 'Email không hợp lệ';
        } else {
          generalErrors.push(`${error.path.join('.')}: ${error.message}`);
        }
      });

      setFieldErrors(newFieldErrors);

      // Scroll to first field with error (inline validation only now)
      if (Object.keys(newFieldErrors).length > 0) {
        const fieldOrder = [
          'renterName',
          'phoneNumber',
          'email',
          'pickupDate',
          'pickupTime',
          'returnDate',
          'returnTime',
          'agreedToPaymentTerms',
          'agreedToDataSharing',
        ];
        const firstErrorField = fieldOrder.find(
          (field) => newFieldErrors[field]
        );

        if (firstErrorField) {
          const element =
            document.getElementById(firstErrorField) ||
            document.querySelector(`[data-terms-section]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      return;
    }

    console.log('🧹 Cleaned form data:', cleanedData);

    // Convert form data to backend API format
    if (!currentUser?._id) {
      // Show auth error via fieldErrors instead of general errors
      setFieldErrors({ auth: 'Vui lòng đăng nhập để tiếp tục' });
      return;
    }
    if (!/^[a-fA-F0-9]{24}$/.test(currentUser._id)) {
      console.error('✖ Invalid renterId format for current user:', currentUser._id);
      setFieldErrors({
        auth: 'Tài khoản hiện tại không hợp lệ để tạo booking. Vui lòng đăng xuất và thử lại hoặc liên hệ hỗ trợ.',
      });
      return;
    }

    console.log('🔍 Debug info:');
    console.log('  - currentUser._id:', currentUser._id);
    console.log('  - state?.vehicle?._id:', state?.vehicle?._id);
    console.log('  - cleanedData.vehicleId:', cleanedData.vehicleId);
    console.log(
      '  - Final vehicleId:',
      state?.vehicle?._id || cleanedData.vehicleId
    );

    const startTime = performance.now();

    // Convert form data to backend API format
    let apiData;
    try {
      apiData = convertFormToBookingAPI(
        cleanedData,
        currentUser._id,
        state?.vehicle?._id || cleanedData.vehicleId
      );
      console.log('🔄 Converted API data:', apiData);
    } catch (conversionError) {
      console.error('❌ Conversion error:', conversionError);
      // Log error for debugging but don't show to user as it's technical
      console.warn(
        'Technical error during data conversion - check form validation'
      );
      return;
    }

    createBooking.mutate(apiData, {
      onSuccess: (response) => {
        const endTime = performance.now();
        console.log(
          `✅ Booking created in ${((endTime - startTime) / 1000).toFixed(2)}s`
        );
        console.log('📦 Response:', response);
        setSuccess(true);
        setBookingCode(response.data?.data?.bookingCode || '');
      },
      onError: (error: unknown) => {
        const endTime = performance.now();
        console.error(
          `❌ Booking error after ${((endTime - startTime) / 1000).toFixed(2)}s`
        );
        console.error('📋 Full Error Object:', error);

        const err = error as {
          response?: {
            data?: { errors?: string[]; message?: string; error?: string };
            status?: number;
            statusText?: string;
          };
        };

        console.error('� Backend Response Details:');
        console.error('  - Status:', err?.response?.status);
        console.error('  - Status Text:', err?.response?.statusText);
        console.error(
          '  - Response Data:',
          JSON.stringify(err?.response?.data, null, 2)
        );
        console.error(
          '  - Request Data was:',
          JSON.stringify(apiData, null, 2)
        );

        // Handle different error formats
        let errorMessages: string[] = [];

        if (
          err?.response?.data?.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          errorMessages = err.response.data.errors;
        } else if (err?.response?.data?.message) {
          errorMessages = [err.response.data.message];
        } else if (err?.response?.data?.error) {
          errorMessages = [err.response.data.error];
        } else {
          errorMessages = [
            'Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
          ];
        }

        // Add specific error messages based on status
        if (err?.response?.status === 400) {
          errorMessages.unshift('🚫 Dữ liệu không hợp lệ (400 Bad Request):');
        } else if (err?.response?.status === 404) {
          errorMessages.unshift(
            '❓ Không tìm thấy tài nguyên (404 Not Found):'
          );
        } else if (err?.response?.status === 500) {
          errorMessages.unshift('💥 Lỗi server (500 Internal Error):');
        }

        // Show server errors via console for debugging - users get inline validation instead
        console.error('Server errors:', errorMessages);
      },
    });
  };

  if (!state?.brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate('/')}>Quay lại trang chủ</Button>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để có thể đặt xe. Vui lòng đăng nhập hoặc đăng ký
            tài khoản.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/login', { state: { from: location } })}
              className="bg-green-600 hover:bg-green-700"
            >
              Đăng nhập
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <span role="img" aria-label="success">
              ✅
            </span>{' '}
            Gửi yêu cầu thành công!
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Mã booking</p>
            <p className="text-2xl font-bold text-green-600">{bookingCode}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              <span role="img" aria-label="clipboard">
                📋
              </span>{' '}
              Các bước tiếp theo:
            </p>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Nhân viên sẽ xem xét và duyệt booking của bạn</li>
              <li>Bạn sẽ nhận được email thông báo khi booking được duyệt</li>
              <li>Sau đó, vui lòng thanh toán qua chuyển khoản ngân hàng</li>
              <li>Hoàn tất thanh toán để xác nhận đặt xe</li>
            </ol>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Chúng tôi đã gửi email xác nhận đến{' '}
            <span className="font-semibold">{formData.email}</span>
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const brand = state.brand;
  const images =
    brand.images && brand.images.length > 0
      ? brand.images
      : brand.imageUrl
      ? [brand.imageUrl]
      : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Loading Overlay */}
      {createBooking.isPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Đang xử lý đặt xe...
            </h3>
            <p className="text-gray-600 mb-4">Vui lòng đợi trong giây lát</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p>
                <span role="img" aria-label="loading">
                  🔄
                </span>{' '}
                Đang kiểm tra tình trạng xe
              </p>
              <p>
                <span role="img" aria-label="payment">
                  💳
                </span>{' '}
                Đang tạo booking
              </p>
              <p>
                <span role="img" aria-label="email">
                  📧
                </span>{' '}
                Chuẩn bị gửi email xác nhận
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký thuê xe</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Messages - Hidden since we now use inline validation */}

              {/* Personal Info */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Thông tin người thuê
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renterName">
                      Tên người thuê <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="renterName"
                      value={formData.renterName}
                      onChange={(e) => {
                        handleChange('renterName', e.target.value);
                        if (fieldErrors.renterName) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            renterName: '',
                          }));
                        }
                      }}
                      placeholder="Nguyễn Văn A"
                      className={`h-12 ${
                        fieldErrors.renterName
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                    />
                    {fieldErrors.renterName && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span role="img" aria-label="error">
                          ⚠️
                        </span>{' '}
                        {fieldErrors.renterName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        handleChange('phoneNumber', e.target.value);
                        if (fieldErrors.phoneNumber) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            phoneNumber: '',
                          }));
                        }
                      }}
                      placeholder="0912345678"
                      className={`h-12 ${
                        fieldErrors.phoneNumber
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                    />
                    {fieldErrors.phoneNumber && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span role="img" aria-label="error">
                          ⚠️
                        </span>{' '}
                        {fieldErrors.phoneNumber}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      10 số, bắt đầu bằng 0
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        handleChange('email', e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="example@email.com"
                      className={`h-12 ${
                        fieldErrors.email
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                    />
                    {fieldErrors.email && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span role="img" aria-label="error">
                          ⚠️
                        </span>{' '}
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Lưu ý về thanh toán:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Booking của bạn sẽ được tạo và chờ xác nhận từ nhân viên
                      </li>
                      <li>
                        Sau khi nhân viên duyệt, bạn sẽ nhận được thông báo
                        thanh toán
                      </li>
                      <li>
                        Vui lòng thanh toán qua chuyển khoản ngân hàng theo
                        hướng dẫn
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                  <span className="text-3xl" role="img" aria-label="bank">
                    🏦
                  </span>
                  <div>
                    <p className="font-semibold text-green-700">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-sm text-green-600">
                      Thanh toán sau khi nhân viên duyệt booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Ghi chú (Tùy chọn)
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú cho nhân viên</Label>
                  <textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Yêu cầu đặc biệt, ghi chú thêm cho nhân viên..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Mọi yêu cầu đặc biệt về thời gian, địa điểm nhận xe, hoặc
                    thông tin khác
                  </p>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div
                className="bg-white rounded-2xl shadow-md p-6 space-y-4"
                data-terms-section
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreedToPaymentTerms"
                      checked={formData.agreedToPaymentTerms}
                      onCheckedChange={(checked) => {
                        handleChange(
                          'agreedToPaymentTerms',
                          checked as boolean
                        );
                        if (checked) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            agreedToPaymentTerms: '',
                          }));
                        }
                      }}
                      className={`mt-1 ${
                        !formData.agreedToPaymentTerms &&
                        fieldErrors.agreedToPaymentTerms
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    <Label
                      htmlFor="agreedToPaymentTerms"
                      className="cursor-pointer text-sm"
                    >
                      Đã đọc và đồng ý với{' '}
                      <button
                        type="button"
                        onClick={() => setShowPaymentTerms(true)}
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Điều khoản thanh toán
                      </button>{' '}
                      của EV Rental <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldErrors.agreedToPaymentTerms && (
                    <div className="ml-8 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      <span role="img" aria-label="error">
                        ⚠️
                      </span>{' '}
                      {fieldErrors.agreedToPaymentTerms}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreedToDataSharing"
                      checked={formData.agreedToDataSharing}
                      onCheckedChange={(checked) => {
                        handleChange('agreedToDataSharing', checked as boolean);
                        if (checked) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            agreedToDataSharing: '',
                          }));
                        }
                      }}
                      className={`mt-1 ${
                        !formData.agreedToDataSharing &&
                        fieldErrors.agreedToDataSharing
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    <Label
                      htmlFor="agreedToDataSharing"
                      className="cursor-pointer text-sm"
                    >
                      Tôi đồng ý để lại thông tin cá nhân theo{' '}
                      <button
                        type="button"
                        onClick={() => setShowDataPolicy(true)}
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Điều khoản chia sẻ dữ liệu cá nhân
                      </button>{' '}
                      của EV Rental <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldErrors.agreedToDataSharing && (
                    <div className="ml-8 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      <span role="img" aria-label="error">
                        ⚠️
                      </span>{' '}
                      {fieldErrors.agreedToDataSharing}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createBooking.isPending}
                className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Thanh toán ${pricing.totalPayable.toLocaleString('vi-VN')}đ`
                )}
              </Button>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={images[0] || '/placeholder-car.jpg'}
                    alt={brand.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">{brand.code}</p>
                    {state?.vehicle && (
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        <span role="img" aria-label="car">
                          🚗
                        </span>{' '}
                        {state.vehicle.plateNo || 'Chưa có biển số'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle Details - Show when specific vehicle is selected */}
                {state?.vehicle && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">
                      Thông tin xe được chọn
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-blue-600"
                          role="img"
                          aria-label="battery"
                        >
                          🔋
                        </span>
                        <div>
                          <p className="text-blue-700">Pin</p>
                          <p
                            className={`font-medium ${
                              state.vehicle.batteryPercent >= 70
                                ? 'text-green-600'
                                : state.vehicle.batteryPercent >= 30
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {state.vehicle.batteryPercent || 0}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-blue-600"
                          role="img"
                          aria-label="odometer"
                        >
                          ⚙️
                        </span>
                        <div>
                          <p className="text-blue-700">ODO</p>
                          <p className="font-medium text-blue-900">
                            {state.vehicle.odometer
                              ? `${state.vehicle.odometer.toLocaleString()}km`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-blue-600"
                          role="img"
                          aria-label="vehicle-id"
                        >
                          🏷️
                        </span>
                        <div>
                          <p className="text-blue-700">VIN</p>
                          <p className="font-medium text-blue-900 truncate">
                            {state.vehicle.vin || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-blue-600"
                          role="img"
                          aria-label="location"
                        >
                          📍
                        </span>
                        <div>
                          <p className="text-blue-700">Trạm</p>
                          <p className="font-medium text-blue-900 truncate">
                            {state.vehicle.stationId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rental Period - Editable */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Thời gian thuê
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingTime(!isEditingTime)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isEditingTime ? 'Xong' : 'Chỉnh sửa'}
                    </button>
                  </div>

                  {!isEditingTime ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">
                          {pricing.rentalDays} ngày
                        </span>{' '}
                        • {formData.pickupTime} {formData.pickupDate} →{' '}
                        {formData.returnTime} {formData.returnDate}
                      </p>
                      <p className="text-xs">Hình thức thuê: Theo ngày</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Pickup Date & Time */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          <span role="img" aria-label="calendar">
                            📅
                          </span>{' '}
                          Ngày & giờ nhận xe
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Input
                              type="date"
                              value={formData.pickupDate}
                              onChange={(e) => {
                                handleChange('pickupDate', e.target.value);
                                if (fieldErrors.pickupDate) {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    pickupDate: '',
                                  }));
                                }
                              }}
                              className={`text-xs h-8 ${
                                fieldErrors.pickupDate
                                  ? 'border-red-500 focus:border-red-500'
                                  : ''
                              }`}
                              min={today}
                            />
                            {fieldErrors.pickupDate && (
                              <div className="text-xs text-red-600 bg-red-50 p-1 rounded border border-red-200">
                                <span role="img" aria-label="error">
                                  ⚠️
                                </span>{' '}
                                {fieldErrors.pickupDate}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Input
                              type="time"
                              value={formData.pickupTime}
                              onChange={(e) => {
                                handleChange('pickupTime', e.target.value);
                                if (fieldErrors.pickupTime) {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    pickupTime: '',
                                  }));
                                }
                              }}
                              className={`text-xs h-8 ${
                                fieldErrors.pickupTime
                                  ? 'border-red-500 focus:border-red-500'
                                  : ''
                              }`}
                            />
                            {fieldErrors.pickupTime && (
                              <div className="text-xs text-red-600 bg-red-50 p-1 rounded border border-red-200">
                                <span role="img" aria-label="error">
                                  ⚠️
                                </span>{' '}
                                {fieldErrors.pickupTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Return Date & Time */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          <span role="img" aria-label="return">
                            🔄
                          </span>{' '}
                          Ngày & giờ trả xe
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Input
                              type="date"
                              value={formData.returnDate}
                              onChange={(e) => {
                                handleChange('returnDate', e.target.value);
                                if (fieldErrors.returnDate) {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    returnDate: '',
                                  }));
                                }
                              }}
                              className={`text-xs h-8 ${
                                fieldErrors.returnDate
                                  ? 'border-red-500 focus:border-red-500'
                                  : ''
                              }`}
                              min={formData.pickupDate}
                            />
                            {fieldErrors.returnDate && (
                              <div className="text-xs text-red-600 bg-red-50 p-1 rounded border border-red-200">
                                <span role="img" aria-label="error">
                                  ⚠️
                                </span>{' '}
                                {fieldErrors.returnDate}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Input
                              type="time"
                              value={formData.returnTime}
                              onChange={(e) => {
                                handleChange('returnTime', e.target.value);
                                if (fieldErrors.returnTime) {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    returnTime: '',
                                  }));
                                }
                              }}
                              className={`text-xs h-8 ${
                                fieldErrors.returnTime
                                  ? 'border-red-500 focus:border-red-500'
                                  : ''
                              }`}
                            />
                            {fieldErrors.returnTime && (
                              <div className="text-xs text-red-600 bg-red-50 p-1 rounded border border-red-200">
                                <span role="img" aria-label="error">
                                  ⚠️
                                </span>{' '}
                                {fieldErrors.returnTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        <span className="font-medium">
                          {pricing.rentalDays} ngày
                        </span>{' '}
                        thuê • Hình thức: Theo ngày
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    <span role="img" aria-label="receipt">
                      🧾
                    </span>{' '}
                    Bảng kê chi tiết
                  </h3>

                  {/* Daily Rate Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">
                        Giá thuê theo ngày ({brand.name})
                      </span>
                      <span className="text-blue-900 font-semibold">
                        {state?.brand?.baseDailyRate?.toLocaleString('vi-VN') ||
                          '0'}
                        đ/ngày
                      </span>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <span className="text-gray-700">Cước phí niêm yết</span>
                        <p className="text-xs text-gray-500">
                          {state?.brand?.baseDailyRate?.toLocaleString(
                            'vi-VN'
                          ) || '0'}
                          đ × {pricing.rentalDays} ngày
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">
                        {pricing.basePrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {pricing.additionalFees > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="text-amber-700">
                            Phụ phí cuối tuần
                          </span>
                          <p className="text-xs text-amber-600">
                            100.000đ ×{' '}
                            {Math.floor(pricing.additionalFees / 100000)} ngày
                            cuối tuần
                          </p>
                        </div>
                        <span className="font-medium text-amber-700">
                          +{pricing.additionalFees.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="font-semibold text-gray-900">
                          Tổng tiền thuê xe
                        </span>
                        <span className="font-semibold text-gray-900">
                          {pricing.totalRentalFee.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="font-semibold text-gray-900">
                            Tiền đặt cọc
                          </span>
                          <p className="text-xs text-gray-500">
                            Hoàn trả sau khi trả xe
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {pricing.depositAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-green-800">
                        Thanh toán ngay
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        {pricing.totalPayable.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Giá thuê xe đã bao gồm VAT</p>
                      <p>• Tiền cọc hoàn trả sau khi trả xe</p>
                      <p>• Thanh toán sau khi nhân viên duyệt booking</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Terms Modal */}
      {showPaymentTerms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-green-50">
              <h2 className="text-xl font-bold text-gray-900">
                Điều khoản thanh toán
              </h2>
              <button
                onClick={() => setShowPaymentTerms(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1. Phương thức thanh toán
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Khách hàng thanh toán qua chuyển khoản ngân hàng theo thông
                    tin được cung cấp
                  </li>
                  <li>
                    Thanh toán phải được thực hiện sau khi booking được nhân
                    viên duyệt
                  </li>
                  <li>
                    Thời hạn thanh toán: trong vòng 24 giờ kể từ khi nhận thông
                    báo duyệt
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  2. Tiền đặt cọc và hoàn trả
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Tiền cọc sẽ được hoàn trả sau khi kết thúc thuê xe và kiểm
                    tra tình trạng xe
                  </li>
                  <li>
                    Nếu xe bị hư hại, chi phí sửa chữa sẽ được trừ vào tiền cọc
                  </li>
                  <li>Thời gian hoàn cọc: 3-5 ngày làm việc sau khi trả xe</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  3. Chính sách hủy booking
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hủy trước 24h: Hoàn 100% tiền đã thanh toán</li>
                  <li>
                    Hủy trong 24h: Chỉ hoàn 50% tiền thuê xe, không hoàn tiền
                    cọc
                  </li>
                  <li>Không xuất hiện: Không hoàn tiền</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  4. Trách nhiệm của khách hàng
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Cung cấp thông tin cá nhân chính xác và đầy đủ</li>
                  <li>Có giấy phép lái xe hợp lệ khi nhận xe</li>
                  <li>
                    Chịu trách nhiệm về các vi phạm giao thông trong thời gian
                    thuê
                  </li>
                  <li>
                    Bảo quản xe cẩn thận, không sử dụng vào mục đích bất hợp
                    pháp
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  5. Bảo hiểm và trách nhiệm
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Xe được bảo hiểm bắt buộc và bảo hiểm vật chất</li>
                  <li>
                    Khách hàng chịu trách nhiệm về tài sản cá nhân trong xe
                  </li>
                  <li>
                    Trong trường hợp tai nạn, khách hàng phải thông báo ngay cho
                    công ty
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <Button
                onClick={() => {
                  handleChange('agreedToPaymentTerms', true);
                  setShowPaymentTerms(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Đã hiểu và đồng ý
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Policy Modal */}
      {showDataPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-blue-50">
              <h2 className="text-xl font-bold text-gray-900">
                Điều khoản chia sẻ dữ liệu cá nhân
              </h2>
              <button
                onClick={() => setShowDataPolicy(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1. Thu thập thông tin
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Họ tên, số điện thoại, email để liên lạc và xử lý booking
                  </li>
                  <li>Số giấy phép lái xe để xác minh tư cách lái xe</li>
                  <li>Thông tin địa chỉ để giao nhận xe (nếu có)</li>
                  <li>Lịch sử thuê xe để cải thiện dịch vụ</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  2. Mục đích sử dụng
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Xử lý và quản lý đơn thuê xe</li>
                  <li>Liên lạc về tình trạng booking và xe</li>
                  <li>Cung cấp hỗ trợ khách hàng</li>
                  <li>Gửi thông tin khuyến mãi (có thể từ chối)</li>
                  <li>Cải thiện chất lượng dịch vụ</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  3. Bảo mật thông tin
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Thông tin được mã hóa và lưu trữ an toàn</li>
                  <li>Chỉ nhân viên có thẩm quyền mới được truy cập</li>
                  <li>Không chia sẻ với bên thứ ba mà không có sự đồng ý</li>
                  <li>Tuân thủ các quy định về bảo vệ dữ liệu cá nhân</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  4. Quyền của khách hàng
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Yêu cầu xem, sửa đổi thông tin cá nhân</li>
                  <li>Yêu cầu xóa dữ liệu (trừ thông tin bắt buộc phải lưu)</li>
                  <li>Từ chối nhận thông tin marketing</li>
                  <li>Khiếu nại về việc xử lý dữ liệu không đúng</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  5. Thời gian lưu trữ
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Thông tin booking: 5 năm (theo quy định pháp luật)</li>
                  <li>
                    Thông tin liên lạc: Cho đến khi khách hàng yêu cầu xóa
                  </li>
                  <li>Dữ liệu phân tích: Được ẩn danh hóa sau 2 năm</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  6. Liên hệ
                </h3>
                <p className="text-gray-700">
                  Mọi thắc mắc về chính sách này, vui lòng liên hệ:
                  <br />
                  📧 Email: privacy@evrental.com
                  <br />
                  📞 Hotline: 1900 1234
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <Button
                onClick={() => {
                  handleChange('agreedToDataSharing', true);
                  setShowDataPolicy(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Đã hiểu và đồng ý
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
