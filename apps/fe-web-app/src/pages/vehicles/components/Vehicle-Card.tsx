import { Button } from "@/components/shadcn/ui/button";
import { Card, CardContent, CardFooter } from "@/components/shadcn/ui/card";
import type { TVehicle } from "@/schema/vehicle.schema";
import { Battery, MapPin, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleCardListProps {
  vehicles: TVehicle[];
}

const VehicleCardList: React.FC<VehicleCardListProps> = ({ vehicles = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-blue-50">
      {vehicles.map((vehicle) => {
        const statusColors: Record<TVehicle["status"], string> = {
          available: "bg-green-100 text-green-700",
          rented: "bg-red-100 text-red-700",
          maintenance: "bg-yellow-100 text-yellow-700",
          unavailable: "bg-gray-100 text-gray-700",
        };

        // 👉 Khi click card thì navigate đến trang chi tiết
        const handleClick = () => {
          navigate(`/vehicles/${vehicle._id}`);
        };

        return (
          <Card
            key={vehicle._id}
            onClick={handleClick}
            className="p-4 flex flex-col justify-between bg-white shadow-md rounded-2xl hover:shadow-xl transition cursor-pointer"
          >
            <CardContent className="p-0">
              {/* Ảnh xe */}
              <div className="h-40 bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                <Car className="text-gray-400 w-10 h-10" />
              </div>

              {/* Badge trạng thái */}
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md ${statusColors[vehicle.status]}`}
                >
                  {vehicle.status === "rented"
                    ? "Đang thuê"
                    : vehicle.status === "maintenance"
                      ? "Bảo trì"
                      : "Sẵn sàng"}
                </span>
                <span className="text-xs text-gray-500">{vehicle.plateNo}</span>
              </div>

              {/* Thông tin xe */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base">{vehicle.model}</h3>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <Battery size={14} /> {vehicle.batteryPercent}%
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <MapPin size={14} /> {vehicle.stationId}
                </p>
                <p className="text-sm text-gray-700">
                  Quãng đường: {vehicle.odometer.toLocaleString()} km
                </p>
                <p className="text-sm text-gray-700 font-mono">VIN: {vehicle.vin}</p>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-0 mt-3">
              {vehicle.status === "available" ? (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // tránh trigger click card
                    navigate(`/booking/${vehicle._id}`);
                  }}
                >
                  Đặt ngay
                </Button>
              ) : (
                <Button disabled className="w-full opacity-70">
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
