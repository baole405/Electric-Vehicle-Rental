import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { useBooking } from "@/hooks/use-booking";
import { useAuthContext } from "@/contexts/auth-context";
import { CreateBookingSchema } from "@/schema/booking.schema";
import type { TBrandWithAvailability } from "@/schema/brand.schema";
import type { TCreateBooking } from "@/schema/booking.schema";

interface LocationState {
  brand: TBrandWithAvailability;
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

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<TCreateBooking>({
    renterName: currentUser?.fullName || "",
    phoneNumber: currentUser?.phone || "",
    email: currentUser?.email || "",
    brandId: "",
    stationId: "",
    pickupDate: state?.pickupDate || today,
    pickupTime: state?.pickupTime || "10:00",
    returnDate: state?.returnDate || today,
    returnTime: state?.returnTime || "10:00",
    paymentMethod: "bank_transfer",
    agreedToPaymentTerms: false,
    agreedToDataSharing: false,
    pickupLocation: "",
    promoCode: "",
    notes: "",
  }); const [pricing, setPricing] = useState({
    rentalDays: 1,
    basePrice: 0,
    additionalFees: 0,
    totalRentalFee: 0,
    depositAmount: 0,
    totalPayable: 0,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

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
  }, [formData.pickupDate, formData.pickupTime, formData.returnDate, formData.returnTime, state?.brand]);

  const handleChange = (field: keyof TCreateBooking, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    const newErrors: string[] = [];

    if (!formData.renterName.trim()) newErrors.push("Tên người thuê là bắt buộc");
    if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.push("Số điện thoại phải có 10 số và bắt đầu bằng 0");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Email không hợp lệ");
    }
    if (!formData.brandId || !formData.stationId) {
      newErrors.push("Thông tin xe hoặc trạm không hợp lệ. Vui lòng quay lại trang chủ và chọn lại.");
    }
    if (!formData.agreedToPaymentTerms) {
      newErrors.push("Bạn phải đồng ý với điều khoản thanh toán");
    }
    if (!formData.agreedToDataSharing) {
      newErrors.push("Bạn phải đồng ý chia sẻ dữ liệu cá nhân");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    console.log("📤 Submitting booking:", formData);
    console.log("🔍 Validation check:");
    console.log("  - brandId:", formData.brandId);
    console.log("  - stationId:", formData.stationId);
    console.log("  - pickup:", `${formData.pickupDate} ${formData.pickupTime}`);
    console.log("  - return:", `${formData.returnDate} ${formData.returnTime}`);
    console.log("  - phone:", formData.phoneNumber, "valid:", /^0[0-9]{9}$/.test(formData.phoneNumber));
    console.log("  - email:", formData.email, "valid:", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email));
    console.log("🔑 Current User:", currentUser);
    console.log("📋 Full Request Body:", JSON.stringify(formData, null, 2));

    // Validate with Zod schema before sending
    try {
      CreateBookingSchema.parse(formData);
      console.log("✅ Zod validation passed");
    } catch (zodError) {
      console.error("❌ Zod validation failed:", zodError);
      const err = zodError as { errors?: Array<{ path: string[]; message: string }> };
      const zodErrors = err.errors?.map((e) => `${e.path.join('.')}: ${e.message}`) || [];
      setErrors(["Dữ liệu không hợp lệ:", ...zodErrors]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const startTime = performance.now();

    // Clean up optional fields - remove empty strings
    const cleanedData: TCreateBooking = {
      ...formData,
      pickupLocation: formData.pickupLocation?.trim() || undefined,
      promoCode: formData.promoCode?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    console.log("🧹 Cleaned data:", cleanedData);

    createBooking.mutate(cleanedData, {
      onSuccess: (response) => {
        const endTime = performance.now();
        console.log(`✅ Booking created in ${((endTime - startTime) / 1000).toFixed(2)}s`);
        console.log("📦 Response:", response);
        setSuccess(true);
        setBookingCode(response.data?.data?.bookingCode || "");
      },
      onError: (error: unknown) => {
        const endTime = performance.now();
        console.error(`❌ Booking error after ${((endTime - startTime) / 1000).toFixed(2)}s`);
        console.error("📋 Error:", error);
        const err = error as { response?: { data?: { errors?: string[]; message?: string }; status?: number } };
        console.error("📋 Error response data:", err?.response?.data);
        console.error("📋 Error status:", err?.response?.status);

        // Handle different error formats
        let errorMessages: string[] = [];

        if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessages = err.response.data.errors;
        } else if (err?.response?.data?.message) {
          errorMessages = [err.response.data.message];
        } else {
          errorMessages = ["Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ."];
        }

        // Add helpful message for 500 errors
        if (err?.response?.status === 500) {
          errorMessages.push("❗ Lỗi hệ thống. Có thể do brandId/stationId không tồn tại hoặc backend gặp sự cố.");
        }

        setErrors(errorMessages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  if (!state?.brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
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
            <span role="img" aria-label="success">✅</span> Gửi yêu cầu thành công!
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Mã booking</p>
            <p className="text-2xl font-bold text-green-600">{bookingCode}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              <span role="img" aria-label="clipboard">📋</span> Các bước tiếp theo:
            </p>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Nhân viên sẽ xem xét và duyệt booking của bạn</li>
              <li>Bạn sẽ nhận được email thông báo khi booking được duyệt</li>
              <li>Sau đó, vui lòng thanh toán qua chuyển khoản ngân hàng</li>
              <li>Hoàn tất thanh toán để xác nhận đặt xe</li>
            </ol>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Chúng tôi đã gửi email xác nhận đến{" "}
            <span className="font-semibold">{formData.email}</span>
          </p>
          <Button onClick={() => navigate("/")} className="w-full bg-green-600 hover:bg-green-700">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const brand = state.brand;
  const images = brand.images && brand.images.length > 0 ? brand.images : brand.imageUrl ? [brand.imageUrl] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Loading Overlay */}
      {createBooking.isPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đang xử lý đặt xe...</h3>
            <p className="text-gray-600 mb-4">Vui lòng đợi trong giây lát</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p><span role="img" aria-label="loading">🔄</span> Đang kiểm tra tình trạng xe</p>
              <p><span role="img" aria-label="payment">💳</span> Đang tạo booking</p>
              <p><span role="img" aria-label="email">📧</span> Chuẩn bị gửi email xác nhận</p>
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
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 mb-2">
                        <span role="img" aria-label="warning">⚠️</span> Vui lòng kiểm tra lại ({errors.length} lỗi):
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrors([])}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin người thuê</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renterName">
                      Tên người thuê <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="renterName"
                      value={formData.renterName}
                      onChange={(e) => handleChange("renterName", e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      placeholder="0912345678"
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">10 số, bắt đầu bằng 0</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="example@email.com"
                      className="h-12"
                    />
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
                      <li>Booking của bạn sẽ được tạo và chờ xác nhận từ nhân viên</li>
                      <li>Sau khi nhân viên duyệt, bạn sẽ nhận được thông báo thanh toán</li>
                      <li>Vui lòng thanh toán qua chuyển khoản ngân hàng theo hướng dẫn</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                  <span className="text-3xl" role="img" aria-label="bank">🏦</span>
                  <div>
                    <p className="font-semibold text-green-700">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-green-600">Thanh toán sau khi nhân viên duyệt booking</p>
                  </div>
                </div>
              </div>              {/* Optional Fields */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin thêm (Tùy chọn)</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupLocation">Địa chỉ cụ thể nhận xe</Label>
                    <Input
                      id="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={(e) => handleChange("pickupLocation", e.target.value)}
                      placeholder="123 Đường ABC, Quận 1"
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoCode">Mã khuyến mãi</Label>
                      <Input
                        id="promoCode"
                        value={formData.promoCode}
                        onChange={(e) => handleChange("promoCode", e.target.value)}
                        placeholder="NEWUSER10"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Yêu cầu đặc biệt..."
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreedToPaymentTerms"
                    checked={formData.agreedToPaymentTerms}
                    onCheckedChange={(checked) =>
                      handleChange("agreedToPaymentTerms", checked as boolean)
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="agreedToPaymentTerms" className="cursor-pointer text-sm">
                    Đã đọc và đồng ý với{" "}
                    <button type="button" className="text-blue-600 underline hover:text-blue-700">
                      Điều khoản thanh toán
                    </button>{" "}
                    của Green Future <span className="text-red-500">*</span>
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreedToDataSharing"
                    checked={formData.agreedToDataSharing}
                    onCheckedChange={(checked) =>
                      handleChange("agreedToDataSharing", checked as boolean)
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="agreedToDataSharing" className="cursor-pointer text-sm">
                    Tôi đồng ý để lại thông tin cá nhân theo{" "}
                    <button type="button" className="text-blue-600 underline hover:text-blue-700">
                      Điều khoản chia sẻ dữ liệu cá nhân
                    </button>{" "}
                    của Green Future <span className="text-red-500">*</span>
                  </Label>
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
                  `Thanh toán ${pricing.totalPayable.toLocaleString("vi-VN")}đ`
                )}
              </Button>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={images[0] || "/placeholder-car.jpg"}
                    alt={brand.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">{brand.code}</p>
                  </div>
                </div>

                {/* Rental Period */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Thời gian thuê</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">{pricing.rentalDays} ngày</span> •{" "}
                      {formData.pickupTime} {formData.pickupDate} → {formData.returnTime}{" "}
                      {formData.returnDate}
                    </p>
                    <p className="text-xs">Hình thức thuê: Theo ngày</p>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">Bảng kê chi tiết</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cước phí niêm yết</span>
                      <span className="font-medium">{pricing.basePrice.toLocaleString("vi-VN")}đ</span>
                    </div>

                    {pricing.additionalFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phụ phí cuối tuần</span>
                        <span className="font-medium text-amber-600">
                          {pricing.additionalFees.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Tổng tiền</span>
                      <span className="font-semibold">
                        {pricing.totalRentalFee.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Tiền đặt cọc</span>
                      <span className="font-semibold">
                        {pricing.depositAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Thanh toán</span>
                      <span className="text-2xl font-bold text-green-600">
                        {pricing.totalPayable.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">*Giá thuê xe đã bao gồm VAT.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
