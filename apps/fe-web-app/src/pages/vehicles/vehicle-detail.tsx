import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Card } from "@/components/shadcn/ui/card";
import {
  Battery,
  Gauge,
  MapPin,
  Car,
  Info,
  Shield,
  Luggage,
  Route,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import HeaderMain from "@/components/header/header-main";
import type { TVehicle } from "@/schema/vehicle.schema";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { ROUTES } from "@/routes/route.constants";
import { useAuthContext } from "@/contexts/auth-context";
import { toast } from "sonner";

const modelAssets: Record<
  string,
  {
    pricePerDay: number;
    gallery: string[];
    features: { label: string; icon: React.ReactNode }[];
  }
> = {
  "Kia EV6": {
    pricePerDay: 990_000,
    gallery: [
      "/images/ev6/1.jpg",
      "/images/ev6/2.jpg",
      "/images/ev6/3.jpg",
      "/images/ev6/4.jpg",
      "/images/ev6/5.jpg",
    ],
    features: [
      { label: "5 chỗ", icon: <Car size={16} /> },
      { label: "Tự động", icon: <Info size={16} /> },
      { label: "285L", icon: <Luggage size={16} /> },
      { label: "Giới hạn 300 km/ngày", icon: <Route size={16} /> },
      { label: "1 túi khí", icon: <Shield size={16} /> },
      { label: "WLTP ~ 450km*", icon: <Gauge size={16} /> },
    ],
  },
};

const fallbackAsset = {
  pricePerDay: 700_000,
  gallery: ["/images/placeholder-car-1.jpg", "/images/placeholder-car-2.jpg"],
  features: [
    { label: "5 chỗ", icon: <Car size={16} /> },
    { label: "Tự động", icon: <Info size={16} /> },
    { label: "Giới hạn 300 km/ngày", icon: <Route size={16} /> },
  ],
};

function StatusPill({ status }: { status: TVehicle["status"] }) {
  const map: Record<TVehicle["status"], string> = {
    available: "bg-[#E6F9F0] text-[#00CC66]",
    rented: "bg-red-100 text-red-600",
    maintenance: "bg-yellow-100 text-yellow-700",
    unavailable: "bg-gray-100 text-gray-600",
  };
  const text =
    status === "available"
      ? "Sẵn sàng"
      : status === "rented"
      ? "Đang thuê"
      : status === "maintenance"
      ? "Bảo trì"
      : "Không khả dụng";

  return <span className={`px-2 py-1 text-xs rounded-md font-medium ${map[status]}`}>{text}</span>;
}

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { useVehicleById } = useVehicleHook();
  const vehicleId = id ?? "";
  const { data, isLoading, isError } = useVehicleById(vehicleId, { enabled: Boolean(vehicleId) });
  const { currentUser, isVerified } = useAuthContext();

  const [activeIdx, setActiveIdx] = useState(0);
  const vehicle = data?.data.data;
  const asset = useMemo(() => modelAssets[vehicle?.model ?? ""] ?? fallbackAsset, [vehicle?.model]);
  const mainImg = useMemo(
    () => asset.gallery[Math.min(activeIdx, asset.gallery.length - 1)],
    [asset, activeIdx]
  );
  const canBook = Boolean(vehicle && vehicle.status === "available" && isVerified);

  const handleBookVehicle = () => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để đặt xe.");
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    if (!isVerified) {
      toast.warning("Tài khoản chưa được xác minh giấy tờ. Hoàn tất hồ sơ để đặt xe.");
      navigate(`${ROUTES.PROFILE}?tab=documents`);
      return;
    }
    navigate(ROUTES.BOOKING.replace(":id", vehicle?._id ?? ""));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 animate-pulse">
        <Loader2 className="w-6 h-6 mb-2 animate-spin text-[#00CC66]" />
        <span className="text-sm">Đang tải thông tin xe...</span>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <AlertTriangle className="w-6 h-6 mb-2" />
        <span className="text-sm">Không thể tải thông tin xe. Vui lòng thử lại sau.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMain />

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: Hình ảnh */}
        <div className="lg:col-span-7">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            <img
              src={mainImg}
              alt={vehicle.model ?? "Xe điện"}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-3">
            {asset.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`aspect-[4/3] overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 ${
                  i === activeIdx ? "border-[#00CC66]" : "border-transparent"
                }`}
              >
                <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Thông tin xe */}
        <div className="lg:col-span-5">
          <h1 className="text-3xl font-bold text-[#000000]">{vehicle.model ?? "Không rõ model"}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="text-[#00CC66] text-3xl font-bold">
              {asset.pricePerDay.toLocaleString("vi-VN")}{" "}
              <span className="text-xl font-medium">VNĐ/ngày</span>
            </div>
            <Badge className="bg-[#E6F9F0] text-[#00CC66] border border-[#00CC66]">
              Miễn phí sạc tới 31/12/2027
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <StatusPill status={vehicle.status} />
            <span className="font-mono">{vehicle.plateNo ?? "Chưa có biển số"}</span>
            <span className="flex items-center gap-1">
              <MapPin size={16} /> {vehicle.stationId ?? "Chưa có trạm"}
            </span>
          </div>

          <Card className="mt-6 p-5 border border-gray-100 shadow-sm">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              {asset.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  {f.icon} {f.label}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Battery size={16} /> Pin hiện tại:{" "}
                <span
                  className={
                    vehicle.batteryPercent < 30
                      ? "text-red-600"
                      : vehicle.batteryPercent < 70
                      ? "text-yellow-600"
                      : "text-[#00CC66]"
                  }
                >
                  {vehicle.batteryPercent ?? 0}%
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Gauge size={16} /> Odo:{" "}
                {vehicle.odometer
                  ? `${vehicle.odometer.toLocaleString("vi-VN")} km`
                  : "Không rõ"}
              </li>
              <li className="flex items-center gap-2">
                <Info size={16} /> VIN:{" "}
                <span className="font-mono">{vehicle.vin ?? "Chưa có VIN"}</span>
              </li>
            </ul>
          </Card>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-4">
              <Button
                disabled={!canBook}
                className="bg-[#00CC66] hover:bg-[#00b85c] text-white px-8 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleBookVehicle}
              >
                D?t xe
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:border-[#00CC66] hover:text-[#00CC66]"
                asChild
              >
                <Link to="/contact">Nh?n tu v?n</Link>
              </Button>
            </div>
            {!isVerified && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                T�i kho?n c?a b?n ch?a ???c x�c minh gi?y t?. Vui l�ng ho�n t?t h? so tr??c khi d?t xe.
              </p>
            )}
            <p className="text-xs text-gray-500 leading-relaxed">
              *S? li?u ph?m vi/xang s?c l� u?c lu?ng minh ho?. Xe th?t c� th? kh�c t�y c?u h�nh & di?u ki?n s? d?ng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


