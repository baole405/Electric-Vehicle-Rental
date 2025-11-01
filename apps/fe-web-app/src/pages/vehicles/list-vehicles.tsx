import { useVehicleHook } from "@/hooks/use-vehicle";
import { Loader2, AlertTriangle } from "lucide-react";
import VehicleCardList from "./components/Vehicle-Card";
import HeaderMain from "@/components/header/header-main";

export default function ListVehiclesPage() {
  const { useVehicleList } = useVehicleHook();
  const { data, isLoading, isError } = useVehicleList();

  return (
    <div className="flex flex-col min-h-screen bg-white">
  {/* Header */}
  <HeaderMain title="Danh sách các loại xe điện" />

      {/* Nội dung */}
      <div className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#000000] mb-6 text-center">
          Danh sách xe điện
        </h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 animate-pulse">
            <Loader2 className="w-6 h-6 mb-2 animate-spin text-[#00CC66]" />
            <p className="text-sm">Đang tải danh sách xe...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <AlertTriangle className="w-6 h-6 mb-2" />
            <p className="text-sm">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <div className="mt-4">
            <VehicleCardList vehicles={data?.data?.data || []} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-[#f9f9f9] py-6 text-sm text-gray-600">
        <div className="container mx-auto px-4 text-center">
          <span className="text-[#00CC66] font-medium">
            © {new Date().getFullYear()} EVrent. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
