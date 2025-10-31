
import { Loader2, AlertTriangle } from "lucide-react";
import HeaderMain from "@/components/header/header-main";
import { useBrandHook } from "@/hooks/use-brand";
import BrandCardList from "./components/brand-Card";

export default function ListBrandPage() {
  const { useBrandList } = useBrandHook();
  const { data, isLoading, isError } = useBrandList();

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      {/* Header */}
      <HeaderMain title="Danh sách xe điện" />

      {/* Nội dung */}
      <div className="flex-1 container mx-auto py-6 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-600">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Đang tải danh sách xe...
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Không thể tải danh sách xe. Vui lòng thử lại sau.
          </div>
        ) : (
          <BrandCardList brands={data?.data?.data || []} />
        )}
      </div>
    </div>
  );
}
