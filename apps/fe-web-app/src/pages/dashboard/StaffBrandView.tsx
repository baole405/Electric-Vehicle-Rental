import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { useBrandHook } from '@/hooks/use-brand';
import type { TBrand } from '@/schema/brand.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';

export default function StaffBrandView() {
  const { useBrandList } = useBrandHook();
  const { data: brandsData, isLoading } = useBrandList();
  const brands = brandsData?.data?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<TBrand | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter brands based on search
  const filteredBrands = brands.filter(
    (brand: TBrand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (brand: TBrand) => {
    setSelectedBrand(brand);
    setIsDetailOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Danh sách Thương hiệu
            </h1>
            <p className="text-gray-600 mt-1">
              Xem thông tin các thương hiệu xe điện
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <span role="img" aria-label="info">ℹ️</span> Trang này dành cho nhân viên quản lý thương hiệu xe điện
          </Badge>
        </div>

        {/* Search */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brands Table */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Danh sách thương hiệu</CardTitle>
            <CardDescription>
              Tổng số: {filteredBrands.length} thương hiệu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <TableHead className="font-semibold">Mã</TableHead>
                      <TableHead className="font-semibold">Tên thương hiệu</TableHead>
                      <TableHead className="font-semibold">Giá thuê/ngày</TableHead>
                      <TableHead className="font-semibold">Đặt cọc</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Không tìm thấy thương hiệu nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBrands.map((brand: TBrand) => (
                        <TableRow key={brand._id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium">{brand.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {brand.imageUrl && (
                                <img
                                  src={brand.imageUrl}
                                  alt={brand.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{brand.name}</div>
                                {brand.description && (
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {brand.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatCurrency(brand.baseDailyRate)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {brand.depositAmount ? formatCurrency(brand.depositAmount) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                              Hoạt động
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(brand)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chi tiết thương hiệu</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về thương hiệu xe điện
            </DialogDescription>
          </DialogHeader>

          {selectedBrand && (
            <div className="space-y-6">
              {/* Image */}
              {selectedBrand.imageUrl && (
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedBrand.imageUrl}
                    alt={selectedBrand.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã thương hiệu</label>
                  <p className="text-base font-semibold mt-1">{selectedBrand.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên thương hiệu</label>
                  <p className="text-base font-semibold mt-1">{selectedBrand.name}</p>
                </div>
              </div>

              {selectedBrand.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="text-base mt-1 text-gray-700">{selectedBrand.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Giá thuê cơ bản</label>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    {formatCurrency(selectedBrand.baseDailyRate)} / ngày
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tiền đặt cọc</label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedBrand.depositAmount ? formatCurrency(selectedBrand.depositAmount) : 'Chưa thiết lập'}
                  </p>
                </div>
              </div>

              {/* Manufacturer Info */}
              {selectedBrand.manufacturer && (selectedBrand.manufacturer.country || selectedBrand.manufacturer.website) && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-3 block">
                    <span role="img" aria-label="manufacturer">🏭</span> Thông tin nhà sản xuất
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBrand.manufacturer.country && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Quốc gia</p>
                        <p className="font-medium">{selectedBrand.manufacturer.country}</p>
                      </div>
                    )}
                    {selectedBrand.manufacturer.website && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Website</p>
                        <a
                          href={selectedBrand.manufacturer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {selectedBrand.manufacturer.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specs */}
              {selectedBrand.specs && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-3 block">
                    <span role="img" aria-label="specs">⚙️</span> Thông số kỹ thuật
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedBrand.specs.seats && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Số chỗ ngồi</p>
                        <p className="font-medium">{selectedBrand.specs.seats} chỗ</p>
                      </div>
                    )}
                    {selectedBrand.specs.range && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Quãng đường</p>
                        <p className="font-medium">{selectedBrand.specs.range} km</p>
                      </div>
                    )}
                    {selectedBrand.specs.horsePower && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Công suất</p>
                        <p className="font-medium">{selectedBrand.specs.horsePower} HP</p>
                      </div>
                    )}
                    {selectedBrand.specs.batteryCapacity && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Dung lượng pin</p>
                        <p className="font-medium">{selectedBrand.specs.batteryCapacity} kWh</p>
                      </div>
                    )}
                    {selectedBrand.specs.transmission && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Hộp số</p>
                        <p className="font-medium capitalize">{selectedBrand.specs.transmission}</p>
                      </div>
                    )}
                    {selectedBrand.specs.fuelType && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Loại năng lượng</p>
                        <p className="font-medium capitalize">{selectedBrand.specs.fuelType}</p>
                      </div>
                    )}
                    {selectedBrand.specs.carType && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kiểu xe</p>
                        <p className="font-medium capitalize">{selectedBrand.specs.carType}</p>
                      </div>
                    )}
                    {selectedBrand.specs.trunkCapacity && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Dung tích cốp</p>
                        <p className="font-medium">{selectedBrand.specs.trunkCapacity} lít</p>
                      </div>
                    )}
                    {selectedBrand.specs.airbags !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Túi khí</p>
                        <p className="font-medium">{selectedBrand.specs.airbags} túi</p>
                      </div>
                    )}
                    {selectedBrand.specs.wheelSize && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kích thước la-zăng</p>
                        <p className="font-medium">{selectedBrand.specs.wheelSize} inch</p>
                      </div>
                    )}
                    {selectedBrand.specs.screenSize && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Màn hình</p>
                        <p className="font-medium">{selectedBrand.specs.screenSize} inch</p>
                      </div>
                    )}
                    {selectedBrand.specs.dailyKmLimit && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Giới hạn km/ngày</p>
                        <p className="font-medium">{selectedBrand.specs.dailyKmLimit} km</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {selectedBrand.features && selectedBrand.features.length > 0 && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-3 block">
                    <span role="img" aria-label="features">✨</span> Tính năng nổi bật
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrand.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Dates */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedBrand.isActive ? "default" : "secondary"}
                      className={selectedBrand.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                    >
                      {selectedBrand.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm mt-1">{formatDate(selectedBrand.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                  <p className="text-sm mt-1">{formatDate(selectedBrand.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
