import { Button } from "@/components/shadcn/ui/button";
import { Card, CardContent, CardFooter } from "@/components/shadcn/ui/card";
import type { TBrand } from "@/schema/brand.schema";
import { Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrandCardListProps {
  brands: TBrand[];
}

const BrandCardList: React.FC<BrandCardListProps> = ({ brands = [] }) => {
  const navigate = useNavigate();

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(value));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-blue-50">
      {brands.map((brand) => {
        const handleClick = () => navigate(`/brands/${brand._id}`);



        return (
          <Card
            key={brand._id}
            onClick={handleClick}
            className="p-4 flex flex-col justify-between bg-white shadow-md rounded-2xl hover:shadow-xl transition cursor-pointer"
          >
            <CardContent className="p-0">
              {/* Khối ảnh + badge + box giá giống mockup */}
              <div className="relative h-44 rounded-xl mb-4 overflow-hidden bg-gray-100 flex items-center justify-center">
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Car className="text-gray-400 w-12 h-12" />
                )}

                {/* Badge trên góc trái */}
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                    Miễn phí sạc
                  </span>
                </div>

                {/* Box giá nổi giữa dưới ảnh */}
                <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                  <div className="bg-white rounded-lg shadow px-4 py-2 border">
                    <span className="text-sm text-gray-600 mr-1">Chỉ từ</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {formatVND(brand.baseDailyRate)}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">VNĐ/Ngày</span>
                  </div>
                </div>
              </div>

              {/* Nội dung dưới ảnh */}
              <div className="pt-2">
                {/* Tên brand */}
                <h3 className="font-semibold text-lg text-center">{brand.name}</h3>

                {/* Thay “đặc tính” bằng description */}
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {brand.description ?? "Không có mô tả."}
                </p>

                {/* Thông tin bổ sung gọn nhẹ */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center justify-start">
                    <span className="font-medium text-gray-700">Mã:</span>
                    <span className="ml-1 truncate">{brand.code}</span>
                  </div>
                  <div className="flex items-center justify-start">
                    <span className="font-medium text-gray-700">Đặt cọc:</span>
                    <span className="ml-1">{formatVND(brand.depositAmount)} VNĐ</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-0 mt-4">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/brands/${brand._id}`);
                }}
              >
                Xem xe
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default BrandCardList;
