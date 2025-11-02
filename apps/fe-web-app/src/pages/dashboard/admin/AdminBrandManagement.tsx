import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
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
import BrandFormDialog from './components/BrandFormDialog';
import DeleteBrandDialog from './components/DeleteBrandDialog';

export default function AdminBrandManagement() {
    const { useBrandList } = useBrandHook();
    const { data: brandsData, isLoading } = useBrandList();
    const brands = brandsData?.data?.data || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<TBrand | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Filter brands based on search
    const filteredBrands = brands.filter(
        (brand: TBrand) =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedBrand(null);
        setIsFormOpen(true);
    };

    const handleEdit = (brand: TBrand) => {
        setSelectedBrand(brand);
        setIsFormOpen(true);
    };

    const handleDelete = (brand: TBrand) => {
        setSelectedBrand(brand);
        setIsDeleteOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Quản lý Thương hiệu
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý danh sách thương hiệu xe điện
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm thương hiệu
                    </Button>
                </div>

                {/* Search and Filter */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc mã thương hiệu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" />
                                Lọc
                            </Button>
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
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(brand)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(brand)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
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

            {/* Form Dialog */}
            <BrandFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                brand={selectedBrand}
            />

            {/* Delete Dialog */}
            <DeleteBrandDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                brand={selectedBrand}
            />
        </div>
    );
}
