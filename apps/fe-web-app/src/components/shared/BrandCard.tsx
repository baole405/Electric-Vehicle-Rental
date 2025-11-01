import { type TBrandWithAvailability } from "@/schema/brand.schema";
import { Car, Users, Gauge, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrandCardProps {
  brand: TBrandWithAvailability;
  stationId: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

const carTypeMap: Record<string, string> = {
  minicar: "Minicar",
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  coupe: "Coupe",
  wagon: "Wagon",
};

export default function BrandCard({ brand, stationId, pickupDate, pickupTime, returnDate, returnTime }: BrandCardProps) {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    if (brand.availability?.status === "available") {
      return (
        <span className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md shadow-lg z-10">
          Miễn phí sạc
        </span>
      );
    } else if (brand.availability?.status === "out_of_stock") {
      return (
        <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md shadow-lg z-10">
          Hết xe
        </span>
      );
    }
    return null;
  };

  const handleCardClick = () => {
    console.log("🖱️ Card clicked! Brand ID:", brand._id);
    console.log("📍 Navigating to:", `/brands/${brand._id}`);
    console.log("📦 Brand data:", brand);
    console.log("🏢 Station ID:", stationId);

    // Navigate to brand detail page
    navigate(`/brands/${brand._id}`, {
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

  const handleBooking = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (brand.availability?.status !== "available") return;

    // Navigate to booking page with brand data and rental dates
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

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {getStatusBadge()}

        {brand.images && brand.images.length > 0 ? (
          <img
            src={brand.images[0]}
            alt={brand.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : brand.imageUrl ? (
          <img
            src={brand.imageUrl}
            alt={brand.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="w-20 h-20 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Price */}
        <div className="mb-3">
          <div className="text-sm text-gray-500 mb-1">Chi từ</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">
              {brand.baseDailyRate.toLocaleString("vi-VN")}
            </span>
            <span className="text-gray-600 text-sm">VNĐ/Ngày</span>
          </div>
        </div>

        {/* Brand Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">{brand.name}</h3>

        {/* Specs Grid */}
        {brand.specs && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Car Type */}
            <div className="flex items-center gap-2 text-gray-700">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{carTypeMap[brand.specs.carType] || brand.specs.carType}</span>
            </div>

            {/* Seats */}
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{brand.specs.seats} chỗ</span>
            </div>

            {/* Range */}
            <div className="flex items-center gap-2 text-gray-700">
              <Gauge className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{brand.specs.range}km (NEDC)</span>
            </div>

            {/* Trunk Capacity */}
            <div className="flex items-center gap-2 text-gray-700">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Dung tích cốp {brand.specs.trunkCapacity}L</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBooking}
          disabled={brand.availability?.status !== "available"}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${brand.availability?.status === "available"
            ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-md hover:shadow-lg"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {brand.availability?.status === "available" ? "Đặt xe" : "Hết xe"}
        </button>
      </div>
    </div>
  );
}
