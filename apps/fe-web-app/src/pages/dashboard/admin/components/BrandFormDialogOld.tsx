import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Label } from '@/components/shadcn/ui/label';
import { useBrandHook } from '@/hooks/use-brand';
import { toast } from 'sonner';

type BrandFormValues = {
    code: string;
    name: string;
    description: string;
    baseDailyRate: number;
    depositAmount: number;
    imageUrl: string;
};

interface BrandFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand?: {
        _id: string;
        code: string;
        name: string;
        description?: string | null;
        baseDailyRate: number;
        depositAmount?: number;
        imageUrl?: string | null;
    } | null;
}

export default function BrandFormDialog({
    open,
    onOpenChange,
    brand,
}: BrandFormDialogProps) {
    const { createBrand, updateBrand } = useBrandHook();
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageError, setImageError] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue,
    } = useForm<BrandFormValues>({
        defaultValues: {
            code: '',
            name: '',
            description: '',
            baseDailyRate: 0,
            depositAmount: 0,
            imageUrl: '',
        },
    });

    const imageUrl = watch('imageUrl');

    // Reset form when brand changes or dialog opens
    useEffect(() => {
        if (brand && open) {
            reset({
                code: brand.code,
                name: brand.name,
                description: brand.description || '',
                baseDailyRate: brand.baseDailyRate,
                depositAmount: brand.depositAmount || 0,
                imageUrl: brand.imageUrl || '',
            });
            setImagePreview(brand.imageUrl || '');
            setImageError(false);
        } else if (!brand && open) {
            reset({
                code: '',
                name: '',
                description: '',
                baseDailyRate: 0,
                depositAmount: 0,
                imageUrl: '',
            });
            setImagePreview('');
            setImageError(false);
        }
    }, [brand, open, reset]);

    // Watch imageUrl changes for live preview
    useEffect(() => {
        if (imageUrl && imageUrl.trim() !== '') {
            setImagePreview(imageUrl);
            setImageError(false);
        } else {
            setImagePreview('');
            setImageError(false);
        }
    }, [imageUrl]);

    const onSubmit = async (data: BrandFormValues) => {
        try {
            if (brand) {
                // Update existing brand
                await updateBrand.mutateAsync({
                    id: brand._id,
                    payload: data,
                });
                toast.success('Cập nhật thương hiệu thành công!');
            } else {
                // Create new brand
                await createBrand.mutateAsync(data);
                toast.success('Tạo thương hiệu thành công!');
            }
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(errorMessage);
        }
    };

    const isLoading = createBrand.isPending || updateBrand.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {brand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
                    </DialogTitle>
                    <DialogDescription>
                        {brand
                            ? 'Cập nhật thông tin thương hiệu xe điện'
                            : 'Nhập thông tin thương hiệu xe điện mới'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Code */}
                        <div className="space-y-2">
                            <Label htmlFor="code">Mã thương hiệu *</Label>
                            <Input
                                id="code"
                                placeholder="VD: TESLA"
                                {...register('code', { required: 'Mã thương hiệu là bắt buộc' })}
                                disabled={isLoading || !!brand}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Mã duy nhất của thương hiệu (viết hoa, không dấu)
                            </p>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên thương hiệu *</Label>
                            <Input
                                id="name"
                                placeholder="VD: Tesla Motors"
                                {...register('name', { required: 'Tên thương hiệu là bắt buộc' })}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả về thương hiệu..."
                            rows={3}
                            {...register('description')}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Base Daily Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="baseDailyRate">Giá thuê cơ bản (VNĐ/ngày) *</Label>
                            <Input
                                id="baseDailyRate"
                                type="number"
                                placeholder="1000000"
                                {...register('baseDailyRate', {
                                    required: 'Giá thuê là bắt buộc',
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Giá thuê phải lớn hơn 0' },
                                })}
                                disabled={isLoading}
                            />
                            {errors.baseDailyRate && (
                                <p className="text-sm text-red-500">{errors.baseDailyRate.message}</p>
                            )}
                        </div>

                        {/* Deposit Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="depositAmount">Tiền đặt cọc (VNĐ)</Label>
                            <Input
                                id="depositAmount"
                                type="number"
                                placeholder="3000000"
                                {...register('depositAmount', {
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Tiền đặt cọc phải lớn hơn 0' },
                                })}
                                disabled={isLoading}
                            />
                            {errors.depositAmount && (
                                <p className="text-sm text-red-500">{errors.depositAmount.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL Logo</Label>
                        <Input
                            id="imageUrl"
                            placeholder="https://example.com/logo.png"
                            {...register('imageUrl')}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                            Đường dẫn tới hình ảnh logo của thương hiệu
                        </p>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-700">Xem trước logo:</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setValue('imageUrl', '');
                                            setImagePreview('');
                                            setImageError(false);
                                        }}
                                        className="h-6 px-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                {!imageError ? (
                                    <div className="flex justify-center items-center bg-white border rounded p-4">
                                        <img
                                            src={imagePreview}
                                            alt="Logo preview"
                                            className="max-w-full max-h-48 object-contain"
                                            onError={() => setImageError(true)}
                                            onLoad={() => setImageError(false)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center bg-white border border-red-200 rounded p-8 text-red-500">
                                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                        <p className="text-sm">Không thể tải hình ảnh</p>
                                        <p className="text-xs text-gray-500 mt-1">Vui lòng kiểm tra lại đường dẫn</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {brand ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
