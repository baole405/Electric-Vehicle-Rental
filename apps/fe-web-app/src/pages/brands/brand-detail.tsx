import HeaderMain from '@/components/header/header-main';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { useVehicleHook } from '@/hooks/use-vehicle';
import { ROUTES } from '@/routes/route.constants';
import type { TVehicle } from '@/schema/vehicle.schema';
import {
  AlertTriangle,
  Battery,
  Car,
  Gauge,
  Info, // ✅ thay cho Road
  Loader2,
  Luggage,
  MapPin,
  Route,
  Shield,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Hardcode tạm thông tin mẫu (khi chưa có BE) */
const modelAssets: Record<
  string,
  {
    pricePerDay: number;
    gallery: string[];
    features: { label: string; icon: React.ReactNode }[];
  }
> = {
  'Kia EV6': {
    pricePerDay: 990_000,
    gallery: [
      '/images/ev6/1.jpg',
      '/images/ev6/2.jpg',
      '/images/ev6/3.jpg',
      '/images/ev6/4.jpg',
      '/images/ev6/5.jpg',
    ],
    features: [
      { label: '5 ch?', icon: <Car size={16} /> },
      { label: 'T? d?ng', icon: <Info size={16} /> },
      { label: '285L', icon: <Luggage size={16} /> },
      { label: 'Gi?i h?n 300 km/ng�y', icon: <Route size={16} /> },
      { label: '1 t�i kh�', icon: <Shield size={16} /> },
      { label: 'WLTP ~ 450km*', icon: <Gauge size={16} /> },
    ],
  },
};

const fallbackAsset = {
  pricePerDay: 700_000,
  gallery: ['/images/placeholder-car-1.jpg', '/images/placeholder-car-2.jpg'],
  features: [
    { label: '5 cho', icon: <Car size={16} /> },
    { label: 'Tu dong', icon: <Info size={16} /> },
    { label: 'Gioi han 300 km/ngay', icon: <Route size={16} /> },
  ],
};

function StatusPill({ status }: { status: TVehicle['status'] }) {
  const normalized = status?.toUpperCase() ?? status;
  const map: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
    RESERVED: 'bg-sky-100 text-sky-700',
    RENTED: 'bg-rose-100 text-rose-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    DAMAGED: 'bg-red-100 text-red-700',
    UNAVAILABLE: 'bg-gray-100 text-gray-700',
    available: 'bg-emerald-100 text-emerald-700',
    rented: 'bg-rose-100 text-rose-700',
    maintenance: 'bg-amber-100 text-amber-700',
    unavailable: 'bg-gray-100 text-gray-700',
  };
  const text =
    normalized === 'AVAILABLE' || normalized === 'available'
      ? 'Sẵn sàng'
      : normalized === 'RENTED' || normalized === 'rented'
      ? 'Đang thuê'
      : normalized === 'MAINTENANCE' || normalized === 'maintenance'
      ? 'Bảo trì'
      : 'Không khả dụng';

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md ${
        map[normalized] ?? map.unavailable
      }`}
    >
      {text}
    </span>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useVehicleById } = useVehicleHook();
  const vehicleId = id ?? '';
  const { data, isLoading, isError } = useVehicleById(vehicleId, {
    enabled: Boolean(vehicleId),
  });

  const [activeIdx, setActiveIdx] = useState(0);

  // ✅ tránh lỗi gọi hook conditionally
  const vehicle = data?.data.data;
  const asset = useMemo(
    () => modelAssets[vehicle?.model ?? ''] ?? fallbackAsset,
    [vehicle?.model]
  );

  const mainImg = useMemo(
    () => asset.gallery[Math.min(activeIdx, asset.gallery.length - 1)],
    [asset, activeIdx]
  );

  // 🌀 Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span>Đang tải thông tin xe...</span>
      </div>
    );
  }

  // ❌ Error
  if (isError || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <AlertTriangle className="w-6 h-6 mr-2" />
        <span>Không thể tải thông tin xe. Vui lòng thử lại sau.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMain title="Chi tiết xe" />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Hình ảnh */}
        <div className="lg:col-span-7">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center">
            <img
              src={mainImg}
              alt={vehicle.model ?? 'Xe điện'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 grid grid-cols-5 gap-3">
            {asset.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 border ${
                  i === activeIdx ? 'border-emerald-500' : 'border-transparent'
                }`}
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Thông tin xe */}
        <div className="lg:col-span-5">
          <h1 className="text-3xl font-extrabold">
            {vehicle.model ?? 'Không rõ model'}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="text-emerald-600 text-3xl font-bold">
              {asset.pricePerDay.toLocaleString('vi-VN')}{' '}
              <span className="text-xl">VNĐ/Ngày</span>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Miễn phí sạc tới 31/12/2027
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <StatusPill status={vehicle.status} />
            <span className="font-mono">
              {vehicle.plateNo ?? 'Chưa có biển số'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={16} /> {vehicle.stationId ?? 'Chưa có trạm'}
            </span>
          </div>

          {/* Specs */}
          <Card className="mt-6 p-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {asset.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-800">
                  {f.icon} {f.label}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Battery size={16} /> Pin hiện tại:{' '}
                <span
                  className={
                    vehicle.batteryPercent < 30
                      ? 'text-rose-600'
                      : vehicle.batteryPercent < 70
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }
                >
                  {vehicle.batteryPercent ?? 0}%
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Gauge size={16} /> Odo:{' '}
                {vehicle.odometer
                  ? `${vehicle.odometer.toLocaleString('vi-VN')} km`
                  : 'Không rõ'}
              </li>
              <li className="flex items-center gap-2">
                <Info size={16} /> VIN:{' '}
                <span className="font-mono">
                  {vehicle.vin ?? 'Chưa có VIN'}
                </span>
              </li>
            </ul>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              disabled={vehicle.status !== 'available'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              onClick={() =>
                navigate(ROUTES.BOOKING.replace(':id', vehicle._id ?? ''))
              }
            >
              Đặt xe
            </Button>
            {/* <Button variant="outline" asChild>
              <Link to="/contact">Nhận thông tin tư vấn</Link>
            </Button> */}
          </div>

          {/* Ghi chú */}
          <p className="mt-4 text-xs text-gray-500">
            *Số liệu phạm vi/xăng sạc là ước lượng minh hoạ. Xe thật có thể khác
            tùy cấu hình & điều kiện sử dụng.
          </p>
        </div>
      </div>
    </div>
  );
}
