import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { TBrandWithAvailability } from "@/schema/brand.schema";
import { ChevronLeft, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";

interface LocationState {
  brand: TBrandWithAvailability;
  stationId: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

export default function BrandDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!state?.brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
        </div>
      </div>
    );
  }

  const { brand, stationId, pickupDate, pickupTime, returnDate, returnTime } = state;

  // Use images array if available, fallback to imageUrl
  const images = brand.images && brand.images.length > 0
    ? brand.images
    : brand.imageUrl
      ? [brand.imageUrl]
      : [];

  const handleBooking = () => {
    navigate("/booking", {
      state: {
        brand,
        stationId,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
      },
    });
  };

  const handleConsultation = () => {
    // TODO: Implement consultation request
    alert("Tính năng tư vấn đang được phát triển");
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const specs = [
    { label: "Số chỗ ngồi", value: brand.specs?.seats, icon: "👥" },
    { label: "Quãng đường", value: brand.specs?.range ? `${brand.specs.range} km` : undefined, icon: "🔋" },
    { label: "Công suất", value: brand.specs?.horsePower ? `${brand.specs.horsePower} HP` : undefined, icon: "⚡" },
    { label: "Hộp số", value: brand.specs?.transmission, icon: "⚙️" },
    { label: "Loại xe", value: brand.specs?.carType, icon: "🚗" },
    { label: "Dung tích cốp", value: brand.specs?.trunkCapacity ? `${brand.specs.trunkCapacity}L` : undefined, icon: "🧳" },
    { label: "Túi khí", value: brand.specs?.airbags, icon: "🛡️" },
    { label: "Kích thước bánh", value: brand.specs?.wheelSize, icon: "🎯" },
    { label: "Màn hình", value: brand.specs?.screenSize, icon: "📺" },
    { label: "Giới hạn km/ngày", value: brand.specs?.dailyKmLimit ? `${brand.specs.dailyKmLimit} km` : undefined, icon: "🛣️" },
  ].filter((spec) => spec.value !== undefined);

  const isAvailable = brand.availability?.status === "available";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden aspect-[4/3]">
              {images.length > 0 ? (
                <img
                  src={images[activeImageIndex]}
                  alt={`${brand.name} - ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Không có hình ảnh</span>
                </div>
              )}

              {/* Status Badge */}
              {isAvailable ? (
                <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Miễn phí sạc
                </div>
              ) : (
                <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg">
                  Hết xe
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index
                      ? "border-green-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Brand Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {brand.name}
                </h1>
                <p className="text-gray-500 text-sm">Mã xe: {brand.code}</p>
              </div>

              {/* Pricing */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-green-600">
                    {formatPrice(brand.baseDailyRate)}
                  </span>
                  <span className="text-gray-500 text-lg">/ngày</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Đặt cọc: <span className="font-semibold text-gray-900">{formatPrice(brand.depositAmount)}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBooking}
                  disabled={!isAvailable}
                  className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {isAvailable ? "Đặt xe ngay" : "Hết xe"}
                </Button>
                <Button
                  onClick={handleConsultation}
                  variant="outline"
                  className="w-full h-12 text-lg font-semibold border-green-600 text-green-600 hover:bg-green-50"
                >
                  Nhận thông tin tư vấn
                </Button>
              </div>

              {/* Availability Info */}
              {brand.availability && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Thông tin tình trạng xe:</p>
                    <p className="text-blue-700">
                      Số xe có sẵn: <span className="font-semibold">{brand.availability.available || 0}</span>
                    </p>
                    <p className="text-blue-700">
                      Tổng số xe: <span className="font-semibold">{brand.availability.total || 0}</span>
                    </p>
                    {brand.availability.rented > 0 && (
                      <p className="text-blue-700">
                        Đang cho thuê: <span className="font-semibold">{brand.availability.rented}</span>
                      </p>
                    )}
                    {brand.availability.maintenance > 0 && (
                      <p className="text-blue-700">
                        Đang bảo trì: <span className="font-semibold">{brand.availability.maintenance}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl" role="img" aria-label={spec.label}>
                      {spec.icon}
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                      <p className="font-semibold text-gray-900">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
