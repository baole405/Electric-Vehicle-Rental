import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { TBrandWithAvailability } from "@/schema/brand.schema";
import { ChevronLeft, CheckCircle2, Car, Battery, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { useStationHook } from "@/hooks/use-station";
import { useVehicleHook } from "@/hooks/use-vehicle";
import type { TVehicle } from "@/schema/vehicle.schema";

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
  const { useStationList } = useStationHook();
  const { useVehicleList } = useVehicleHook();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedStationCode, setSelectedStationCode] = useState(state?.stationId || "");

  // Fetch stations and vehicles
  const { data: stationsData } = useStationList();
  const stations = stationsData?.data?.data || [];

  // Get all vehicles and filter by brand and station
  const { data: allVehiclesData, isLoading: vehiclesLoading } = useVehicleList();
  const allVehicles = Array.isArray(allVehiclesData?.data?.data)
    ? allVehiclesData.data.data
    : Array.isArray(allVehiclesData?.data)
      ? allVehiclesData.data
      : [];

  // Filter vehicles by brand and selected station
  const vehicles = allVehicles.filter((vehicle) => {
    // Check if vehicle belongs to the current brand
    const matchesBrand = !state?.brand.code ||
      (vehicle.brand && typeof vehicle.brand === 'object' && vehicle.brand.code === state.brand.code) ||
      (vehicle.model === state.brand.name);

    // Check if vehicle is at selected station
    const matchesStation = !selectedStationCode || vehicle.stationId === selectedStationCode;

    return matchesBrand && matchesStation;
  });

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

  const handleVehicleBooking = (vehicle: TVehicle) => {
    navigate("/booking", {
      state: {
        brand,
        vehicle, // Pass specific vehicle instead of just brand
        stationId: selectedStationCode,
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
    { label: "Số chỗ ngồi", value: brand.specs?.seats ? `${brand.specs.seats} chỗ` : undefined, icon: "👥" },
    { label: "Quãng đường", value: brand.specs?.range ? `${brand.specs.range}km (NEDC)` : undefined, icon: "🔋" },
    { label: "Công suất", value: brand.specs?.horsePower ? `${brand.specs.horsePower} HP` : undefined, icon: "⚡" },
    { label: "Hộp số", value: brand.specs?.transmission === "single-speed" ? "Số tự động" : brand.specs?.transmission, icon: "⚙️" },
    { label: "Loại xe", value: brand.specs?.carType === "minicar" ? "Minicar" : brand.specs?.carType, icon: "🚗" },
    { label: "Dung tích cốp", value: brand.specs?.trunkCapacity ? `${brand.specs.trunkCapacity}L` : undefined, icon: "🧳" },
    { label: "Túi khí", value: brand.specs?.airbags ? `${brand.specs.airbags} túi khí` : undefined, icon: "�️" },
    { label: "Giới hạn di chuyển", value: brand.specs?.dailyKmLimit ? `${brand.specs.dailyKmLimit} km/ngày` : undefined, icon: "🛣️" },
  ].filter((spec) => spec.value !== undefined);

  const isAvailable = brand.availability?.status === "available";

  // Vehicle status mapping
  const getVehicleStatusBadge = (status: TVehicle["status"]) => {
    const statusConfig = {
      available: { text: "Sẵn sàng", class: "bg-green-100 text-green-700" },
      rented: { text: "Đang thuê", class: "bg-red-100 text-red-700" },
      maintenance: { text: "Bảo trì", class: "bg-yellow-100 text-yellow-700" },
      unavailable: { text: "Không khả dụng", class: "bg-gray-100 text-gray-700" },
    };
    const config = statusConfig[status] || statusConfig.unavailable;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  // Vehicle Card Component
  const VehicleCard = ({ vehicle }: { vehicle: TVehicle }) => {
    const isVehicleAvailable = vehicle.status === "available";

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {vehicle.plateNo || "Chưa có biển số"}
            </h3>
            <p className="text-sm text-gray-600">{vehicle.model}</p>
          </div>
          {getVehicleStatusBadge(vehicle.status)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Pin: <span className={`font-medium ${vehicle.batteryPercent >= 70 ? 'text-green-600' :
                vehicle.batteryPercent >= 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {vehicle.batteryPercent || 0}%
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              ODO: {vehicle.odometer ? `${vehicle.odometer.toLocaleString()}km` : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">
              {vehicle.stationId || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">
              VIN: {vehicle.vin || 'N/A'}
            </span>
          </div>
        </div>

        {/* Vehicle-specific booking button */}
        <Button
          onClick={() => handleVehicleBooking(vehicle)}
          disabled={!isVehicleAvailable}
          className={`w-full h-10 text-sm font-semibold transition-colors ${isVehicleAvailable
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {isVehicleAvailable ? "Chọn xe này" : "Không khả dụng"}
        </Button>
      </div>
    );
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-7 space-y-4">
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
              <div className="grid grid-cols-7 gap-2">
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

          {/* Right Column - Brand Info & Specifications */}
          <div className="lg:col-span-5 space-y-6">
            {/* Brand Info, Pricing & Specifications - All in one card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
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

              {/* Specifications - Integrated into main card */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full flex-shrink-0">
                        <span className="text-xs text-gray-600" role="img" aria-label={spec.label}>
                          {spec.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">{spec.label}</p>
                        <p className="font-medium text-gray-900 text-sm truncate">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleConsultation}
                  variant="outline"
                  className="w-full h-12 text-lg font-semibold border-green-600 text-green-600 hover:bg-green-50"
                >
                  Nhận thông tin tư vấn
                </Button>
              </div>
            </div>

            {/* Availability Info - Hidden for now */}
            {/* {brand.availability && (
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
            )} */}
          </div>
        </div>

        {/* Available Vehicles Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Xe có sẵn tại trạm
            </h2>

            {/* Station Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor="station-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Chọn trạm:
              </label>
              <select
                id="station-select"
                value={selectedStationCode}
                onChange={(e) => setSelectedStationCode(e.target.value)}
                className="min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">-- Chọn trạm --</option>
                {stations.map((station) => (
                  <option key={station._id} value={station.code}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicles Grid */}
          {vehiclesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Đang tải danh sách xe...</span>
            </div>
          ) : !selectedStationCode ? (
            <div className="text-center py-12 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Vui lòng chọn trạm để xem danh sách xe</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có xe nào của dòng {brand.name} tại trạm này</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
