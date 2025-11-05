import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardFooter } from '@/components/shadcn/ui/card';
import type { TVehicle } from '@/schema/vehicle.schema';
import { Battery, Car, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VehicleCardListProps {
  vehicles: TVehicle[];
}

const VehicleCardList: React.FC<VehicleCardListProps> = ({ vehicles = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-10 bg-white">
      {vehicles.map((vehicle) => {
        const normalized = vehicle.status?.toUpperCase() ?? vehicle.status;
        const statusColors: Record<string, string> = {
          AVAILABLE: 'bg-[#E6F9F0] text-[#00CC66]',
          RESERVED: 'bg-sky-100 text-sky-700',
          RENTED: 'bg-red-100 text-red-600',
          MAINTENANCE: 'bg-yellow-100 text-yellow-700',
          DAMAGED: 'bg-rose-100 text-rose-700',
          UNAVAILABLE: 'bg-gray-100 text-gray-600',
          available: 'bg-[#E6F9F0] text-[#00CC66]',
          rented: 'bg-red-100 text-red-600',
          maintenance: 'bg-yellow-100 text-yellow-700',
          unavailable: 'bg-gray-100 text-gray-600',
        };

        const handleClick = () => {
          navigate(`/vehicles/${vehicle._id}`);
        };

        return (
          <Card
            key={vehicle._id}
            onClick={handleClick}
            className="p-4 flex flex-col justify-between bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <CardContent className="p-0">
              {/* Ảnh xe */}
              <div className="h-40 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                <Car className="text-gray-300 w-10 h-10" />
              </div>

              {/* Badge trạng thái */}
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    statusColors[normalized] ?? statusColors.UNAVAILABLE
                  }`}
                >
                  {normalized === 'RENTED' || normalized === 'rented'
                    ? 'Đang thuê'
                    : normalized === 'MAINTENANCE' ||
                      normalized === 'maintenance'
                    ? 'Bảo trì'
                    : normalized === 'UNAVAILABLE' ||
                      normalized === 'unavailable'
                    ? 'Không khả dụng'
                    : normalized === 'RESERVED'
                    ? 'Đã đặt'
                    : 'Sẵn sàng'}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {vehicle.plateNo}
                </span>
              </div>

              {/* Thông tin xe */}
              <div className="space-y-1 text-sm text-gray-700">
                <h3 className="text-base font-bold text-[#000000]">
                  {vehicle.model}
                </h3>
                <p className="flex items-center gap-1">
                  <Battery size={14} className="text-[#00CC66]" />
                  {vehicle.batteryPercent}%
                </p>
                <p className="flex items-center gap-1">
                  <MapPin size={14} className="text-[#00CC66]" />
                  {vehicle.stationId}
                </p>
                <p>Quãng đường: {vehicle.odometer.toLocaleString()} km</p>
                <p className="font-mono text-xs text-gray-500">
                  VIN: {vehicle.vin}
                </p>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-0 mt-4">
              {vehicle.status === 'available' ? (
                <Button
                  className="w-full bg-[#00CC66] hover:bg-[#00b85c] text-white font-medium text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking/${vehicle._id}`);
                  }}
                >
                  Đặt ngay
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-medium text-sm cursor-not-allowed"
                >
                  Không khả dụng
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default VehicleCardList;
