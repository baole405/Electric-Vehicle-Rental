import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/ui/tabs';
import { useBrandHook } from '@/hooks/use-brand';
import { toast } from 'sonner';
import type { TBrand } from '@/schema/brand.schema';

type BrandFormValues = {
  code: string;
  name: string;
  description: string;
  baseDailyRate: number;
  depositAmount: number;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  specs: {
    seats?: number;
    range?: number;
    horsePower?: number;
    batteryCapacity?: number;
    transmission?: string;
    fuelType?: string;
    carType?: string;
    trunkCapacity?: number;
    airbags?: number;
    wheelSize?: number;
    screenSize?: number;
    dailyKmLimit?: number;
  };
  manufacturer: {
    country?: string;
    website?: string;
  };
  features: { value: string }[];
};

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: TBrand | null;
}

export default function BrandFormDialog({
  open,
  onOpenChange,
  brand,
}: BrandFormDialogProps) {
  const { createBrand, updateBrand } = useBrandHook();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('basic');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<BrandFormValues>({
    mode: 'onBlur', // Validate khi blur khỏi field
    reValidateMode: 'onChange', // Re-validate khi thay đổi sau lần validate đầu
    defaultValues: {
      code: '',
      name: '',
      description: '',
      baseDailyRate: undefined as unknown as number,
      depositAmount: undefined as unknown as number,
      imageUrl: '',
      images: [],
      isActive: true,
      specs: {
        seats: undefined,
        range: undefined,
        horsePower: undefined,
        batteryCapacity: undefined,
        transmission: undefined,
        fuelType: undefined,
        carType: undefined,
        trunkCapacity: undefined,
        airbags: undefined,
        wheelSize: undefined,
        screenSize: undefined,
        dailyKmLimit: undefined,
      },
      manufacturer: {
        country: '',
        website: '',
      },
      features: [],
    },
  });

  // Register select fields for validation
  useEffect(() => {
    register('specs.transmission', { required: 'Hộp số là bắt buộc' });
    register('specs.fuelType', { required: 'Loại năng lượng là bắt buộc' });
    register('specs.carType', { required: 'Kiểu xe là bắt buộc' });
  }, [register]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const imageUrl = watch('imageUrl');

  // Watch all form values for button state
  const formValues = watch();

  // Memoize form completion check to avoid infinite loops
  const isFormComplete =
    formValues.code &&
    formValues.name &&
    formValues.baseDailyRate &&
    formValues.specs?.seats &&
    formValues.specs?.range &&
    formValues.specs?.horsePower &&
    formValues.specs?.batteryCapacity &&
    formValues.specs?.transmission &&
    formValues.specs?.fuelType &&
    formValues.specs?.carType;

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
        images: brand.images || [],
        isActive: brand.isActive ?? true,
        specs: {
          seats: brand.specs?.seats,
          range: brand.specs?.range,
          horsePower: brand.specs?.horsePower,
          batteryCapacity: brand.specs?.batteryCapacity,
          transmission: brand.specs?.transmission,
          fuelType: brand.specs?.fuelType,
          carType: brand.specs?.carType,
          trunkCapacity: brand.specs?.trunkCapacity,
          airbags: brand.specs?.airbags,
          wheelSize: brand.specs?.wheelSize,
          screenSize: brand.specs?.screenSize,
          dailyKmLimit: brand.specs?.dailyKmLimit,
        },
        manufacturer: {
          country: brand.manufacturer?.country || '',
          website: brand.manufacturer?.website || '',
        },
        features: (brand.features || []).map((f) => ({ value: f })),
      });
      setImagePreview(brand.imageUrl || '');
      setImageError(false);
    } else if (!brand && open) {
      reset({
        code: '',
        name: '',
        description: '',
        baseDailyRate: undefined as unknown as number,
        depositAmount: undefined as unknown as number,
        imageUrl: '',
        images: [],
        isActive: true,
        specs: {
          seats: undefined,
          range: undefined,
          horsePower: undefined,
          batteryCapacity: undefined,
          transmission: undefined,
          fuelType: undefined,
          carType: undefined,
          trunkCapacity: undefined,
          airbags: undefined,
          wheelSize: undefined,
          screenSize: undefined,
          dailyKmLimit: undefined,
        },
        manufacturer: {
          country: '',
          website: '',
        },
        features: [],
      });
      setImagePreview('');
      setImageError(false);
      setCurrentTab('basic');
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
      // Validate required specs fields when creating
      if (!brand) {
        const requiredSpecsFields = ['seats', 'range', 'horsePower', 'batteryCapacity', 'transmission', 'fuelType', 'carType'];
        const missingFields = requiredSpecsFields.filter(field => !data.specs[field as keyof typeof data.specs]);

        if (missingFields.length > 0) {
          toast.error('Vui lòng điền đầy đủ thông số kỹ thuật bắt buộc (tab Thông số)');
          setCurrentTab('specs'); // Navigate to specs tab to show missing fields
          return;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || undefined,
        baseDailyRate: Number(data.baseDailyRate),
        depositAmount: data.depositAmount ? Number(data.depositAmount) : undefined,
        imageUrl: data.imageUrl || undefined,
        images: data.images.filter((img) => img.trim() !== ''),
        isActive: data.isActive,
        specs: {
          seats: data.specs.seats ? Number(data.specs.seats) : undefined,
          range: data.specs.range ? Number(data.specs.range) : undefined,
          horsePower: data.specs.horsePower ? Number(data.specs.horsePower) : undefined,
          batteryCapacity: data.specs.batteryCapacity ? Number(data.specs.batteryCapacity) : undefined,
          transmission: data.specs.transmission || undefined,
          fuelType: data.specs.fuelType || undefined,
          carType: data.specs.carType || undefined,
          trunkCapacity: data.specs.trunkCapacity ? Number(data.specs.trunkCapacity) : undefined,
          airbags: data.specs.airbags ? Number(data.specs.airbags) : undefined,
          wheelSize: data.specs.wheelSize ? Number(data.specs.wheelSize) : undefined,
          screenSize: data.specs.screenSize ? Number(data.specs.screenSize) : undefined,
          dailyKmLimit: data.specs.dailyKmLimit ? Number(data.specs.dailyKmLimit) : undefined,
        },
        manufacturer: {
          country: data.manufacturer.country || undefined,
          website: data.manufacturer.website || undefined,
        },
        features: data.features.map((f) => f.value).filter((v) => v.trim() !== ''),
      };

      if (brand) {
        await updateBrand.mutateAsync({
          id: brand._id,
          payload,
        });
        toast.success('Cập nhật thương hiệu thành công!');
      } else {
        await createBrand.mutateAsync(payload);
        toast.success('Tạo thương hiệu thành công!');
      }
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by axios interceptor (handleApiError)
      // Only log for debugging purposes
      console.error('Form submission error:', error);
    }
  };

  // Handle next button click
  const handleNext = async () => {
    let isValid = false;

    if (currentTab === 'basic') {
      // Validate basic fields
      isValid = await trigger(['code', 'name', 'baseDailyRate']);
      if (isValid) {
        setCurrentTab('specs');
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
      }
    } else if (currentTab === 'specs') {
      // Validate required specs fields
      isValid = await trigger([
        'specs.seats',
        'specs.range',
        'specs.horsePower',
        'specs.batteryCapacity',
        'specs.transmission',
        'specs.fuelType',
        'specs.carType',
      ]);

      // Additional check for Select fields (they might not trigger validation properly)
      const formData = watch();
      const hasAllSpecs = !!(
        formData.specs.seats &&
        formData.specs.range &&
        formData.specs.horsePower &&
        formData.specs.batteryCapacity &&
        formData.specs.transmission &&
        formData.specs.fuelType &&
        formData.specs.carType
      );

      if (isValid && hasAllSpecs) {
        setCurrentTab('manufacturer');
      } else {
        toast.error('Vui lòng điền đầy đủ các trường thông số bắt buộc');
      }
    } else if (currentTab === 'manufacturer') {
      // Manufacturer is optional, just move to next
      setCurrentTab('features');
    }
  };

  const isLoading = createBrand.isPending || updateBrand.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{brand ? 'Chỉnh sửa thương hiệu' : 'Tạo thương hiệu mới'}</DialogTitle>
          <DialogDescription>
            {brand
              ? 'Cập nhật thông tin thương hiệu xe điện'
              : 'Nhập thông tin để tạo thương hiệu xe điện mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="specs">Thông số</TabsTrigger>
              <TabsTrigger value="manufacturer">Nhà SX</TabsTrigger>
              <TabsTrigger value="features">Tính năng</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Mã thương hiệu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="VD: TESLA-M3"
                    {...register('code', {
                      required: 'Mã thương hiệu là bắt buộc',
                      minLength: {
                        value: 3,
                        message: 'Mã phải có ít nhất 3 ký tự'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Mã không được quá 20 ký tự'
                      },
                      pattern: {
                        value: /^[A-Z0-9-_]+$/,
                        message: 'Mã chỉ được chứa chữ IN HOA, số, dấu gạch ngang (-) và gạch dưới (_)'
                      }
                    })}
                    disabled={isLoading || !!brand}
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                  )}
                  {!errors.code && (
                    <p className="text-xs text-gray-500">Mã sẽ tự động chuyển sang IN HOA</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên thương hiệu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="VD: Tesla Model 3"
                    {...register('name', {
                      required: 'Tên thương hiệu là bắt buộc',
                      minLength: {
                        value: 2,
                        message: 'Tên phải có ít nhất 2 ký tự'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Tên không được quá 100 ký tự'
                      }
                    })}
                    disabled={isLoading}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về thương hiệu xe"
                  rows={3}
                  {...register('description')}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseDailyRate">
                    Giá thuê/ngày (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="baseDailyRate"
                    type="number"
                    placeholder="VD: 500000"
                    {...register('baseDailyRate', {
                      required: 'Giá thuê/ngày là bắt buộc',
                      min: {
                        value: 50000,
                        message: 'Giá thuê tối thiểu 50,000 VNĐ'
                      },
                      max: {
                        value: 10000000,
                        message: 'Giá thuê tối đa 10,000,000 VNĐ'
                      },
                      validate: {
                        isNumber: (value) => !isNaN(Number(value)) || 'Phải là số hợp lệ',
                        isPositive: (value) => Number(value) > 0 || 'Giá phải lớn hơn 0'
                      }
                    })}
                    disabled={isLoading}
                    className={errors.baseDailyRate ? 'border-red-500' : ''}
                  />
                  {errors.baseDailyRate && (
                    <p className="text-sm text-red-500">{errors.baseDailyRate.message}</p>
                  )}
                  {!errors.baseDailyRate && (
                    <p className="text-xs text-gray-500">Từ 50,000 đến 10,000,000 VNĐ</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Tiền đặt cọc (VNĐ)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    placeholder="VD: 2000000 (tùy chọn)"
                    {...register('depositAmount', {
                      min: {
                        value: 0,
                        message: 'Tiền đặt cọc không được âm'
                      },
                      max: {
                        value: 50000000,
                        message: 'Tiền đặt cọc tối đa 50,000,000 VNĐ'
                      },
                      validate: {
                        isNumber: (value) => {
                          if (!value) return true; // Optional field
                          return !isNaN(Number(value)) || 'Phải là số hợp lệ';
                        }
                      }
                    })}
                    disabled={isLoading}
                    className={errors.depositAmount ? 'border-red-500' : ''}
                  />
                  {errors.depositAmount && (
                    <p className="text-sm text-red-500">{errors.depositAmount.message}</p>
                  )}
                  {!errors.depositAmount && (
                    <p className="text-xs text-gray-500">Tùy chọn, tối đa 50,000,000 VNĐ</p>
                  )}
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL Logo</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/logo.png"
                  {...register('imageUrl', {
                    pattern: {
                      value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i,
                      message: 'URL phải là đường dẫn hình ảnh hợp lệ (jpg, png, gif, webp, svg)'
                    }
                  })}
                  disabled={isLoading}
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
                {!errors.imageUrl && (
                  <p className="text-xs text-gray-500">
                    Đường dẫn tới hình ảnh logo của thương hiệu (http:// hoặc https://)
                  </p>
                )}

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

              {/* Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Kích hoạt thương hiệu
                </Label>
              </div>
            </TabsContent>

            {/* Specs Tab */}
            <TabsContent value="specs" className="space-y-4 mt-4">
              <p className="text-sm text-gray-600 mb-4">
                <span className="text-red-500">*</span> Các trường bắt buộc để hiển thị thông tin chi tiết
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seats">
                    Số chỗ ngồi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="seats"
                    type="number"
                    placeholder="VD: 5"
                    {...register('specs.seats', {
                      required: 'Số chỗ ngồi là bắt buộc',
                      min: { value: 2, message: 'Tối thiểu 2 chỗ ngồi' },
                      max: { value: 9, message: 'Tối đa 9 chỗ ngồi' },
                      validate: {
                        isInteger: (value) => {
                          if (!value) return true;
                          return Number.isInteger(Number(value)) || 'Số chỗ ngồi phải là số nguyên';
                        }
                      }
                    })}
                    disabled={isLoading}
                    className={errors.specs?.seats ? 'border-red-500' : ''}
                  />
                  {errors.specs?.seats && (
                    <p className="text-sm text-red-500">{errors.specs.seats.message}</p>
                  )}
                  {!errors.specs?.seats && (
                    <p className="text-xs text-gray-500">Từ 2 đến 9 chỗ</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range">
                    Quãng đường (km) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="range"
                    type="number"
                    placeholder="VD: 450"
                    {...register('specs.range', {
                      required: 'Quãng đường là bắt buộc',
                      min: { value: 50, message: 'Quãng đường tối thiểu 50 km' },
                      max: { value: 1000, message: 'Quãng đường tối đa 1000 km' },
                    })}
                    disabled={isLoading}
                    className={errors.specs?.range ? 'border-red-500' : ''}
                  />
                  {errors.specs?.range && (
                    <p className="text-sm text-red-500">{errors.specs.range.message}</p>
                  )}
                  {!errors.specs?.range && (
                    <p className="text-xs text-gray-500">Từ 50 đến 1000 km</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horsePower">
                    Công suất (HP) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="horsePower"
                    type="number"
                    placeholder="VD: 204"
                    {...register('specs.horsePower', {
                      required: 'Công suất là bắt buộc',
                      min: { value: 10, message: 'Công suất tối thiểu 10 HP' },
                      max: { value: 2000, message: 'Công suất tối đa 2000 HP' },
                    })}
                    disabled={isLoading}
                    className={errors.specs?.horsePower ? 'border-red-500' : ''}
                  />
                  {errors.specs?.horsePower && (
                    <p className="text-sm text-red-500">{errors.specs.horsePower.message}</p>
                  )}
                  {!errors.specs?.horsePower && (
                    <p className="text-xs text-gray-500">Từ 10 đến 2000 HP</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batteryCapacity">
                    Dung lượng pin (kWh) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="batteryCapacity"
                    type="number"
                    step="0.1"
                    placeholder="VD: 75.5"
                    {...register('specs.batteryCapacity', {
                      required: 'Dung lượng pin là bắt buộc',
                      min: { value: 10, message: 'Dung lượng pin tối thiểu 10 kWh' },
                      max: { value: 200, message: 'Dung lượng pin tối đa 200 kWh' },
                    })}
                    disabled={isLoading}
                    className={errors.specs?.batteryCapacity ? 'border-red-500' : ''}
                  />
                  {errors.specs?.batteryCapacity && (
                    <p className="text-sm text-red-500">{errors.specs.batteryCapacity.message}</p>
                  )}
                  {!errors.specs?.batteryCapacity && (
                    <p className="text-xs text-gray-500">Từ 10 đến 200 kWh</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">
                    Hộp số <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => {
                      setValue('specs.transmission', value);
                      trigger('specs.transmission');
                    }}
                    value={watch('specs.transmission') || ''}
                  >
                    <SelectTrigger className={errors.specs?.transmission ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn loại hộp số" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-speed">Số điện (Single-speed)</SelectItem>
                      <SelectItem value="automatic">Tự động (Automatic)</SelectItem>
                      <SelectItem value="manual">Số sàn (Manual)</SelectItem>
                      <SelectItem value="cvt">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specs?.transmission && (
                    <p className="text-sm text-red-500">{errors.specs.transmission.message}</p>
                  )}
                  {!watch('specs.transmission') && !errors.specs?.transmission && (
                    <p className="text-xs text-amber-600">
                      <span role="img" aria-label="warning">⚠️</span> Vui lòng chọn loại hộp số
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">
                    Loại năng lượng <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => {
                      setValue('specs.fuelType', value);
                      trigger('specs.fuelType');
                    }}
                    value={watch('specs.fuelType') || ''}
                  >
                    <SelectTrigger className={errors.specs?.fuelType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn loại năng lượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electric">Điện (100% Electric)</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specs?.fuelType && (
                    <p className="text-sm text-red-500">{errors.specs.fuelType.message}</p>
                  )}
                  {!watch('specs.fuelType') && !errors.specs?.fuelType && (
                    <p className="text-xs text-amber-600">
                      <span role="img" aria-label="warning">⚠️</span> Vui lòng chọn loại năng lượng
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carType">
                    Kiểu xe <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => {
                      setValue('specs.carType', value);
                      trigger('specs.carType');
                    }}
                    value={watch('specs.carType') || ''}
                  >
                    <SelectTrigger className={errors.specs?.carType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn kiểu xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="minivan">Minivan</SelectItem>
                      <SelectItem value="crossover">Crossover</SelectItem>
                      <SelectItem value="minicar">Minicar</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specs?.carType && (
                    <p className="text-sm text-red-500">{errors.specs.carType.message}</p>
                  )}
                  {!watch('specs.carType') && !errors.specs?.carType && (
                    <p className="text-xs text-amber-600">
                      <span role="img" aria-label="warning">⚠️</span> Vui lòng chọn kiểu xe
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trunkCapacity">Dung tích cốp (lít)</Label>
                  <Input
                    id="trunkCapacity"
                    type="number"
                    placeholder="VD: 520 (tùy chọn)"
                    {...register('specs.trunkCapacity', {
                      min: { value: 0, message: 'Không được âm' },
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="airbags">Số túi khí</Label>
                  <Input
                    id="airbags"
                    type="number"
                    placeholder="VD: 8 (tùy chọn)"
                    {...register('specs.airbags', {
                      min: { value: 0, message: 'Không được âm' },
                      max: { value: 12, message: 'Tối đa 12 túi' },
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelSize">La-zăng (inch)</Label>
                  <Input
                    id="wheelSize"
                    type="number"
                    placeholder="VD: 19 (tùy chọn)"
                    {...register('specs.wheelSize', {
                      min: { value: 13, message: 'Tối thiểu 13 inch' },
                      max: { value: 22, message: 'Tối đa 22 inch' },
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenSize">Màn hình (inch)</Label>
                  <Input
                    id="screenSize"
                    type="number"
                    step="0.1"
                    placeholder="VD: 12.3 (tùy chọn)"
                    {...register('specs.screenSize', {
                      min: { value: 5, message: 'Tối thiểu 5 inch' },
                      max: { value: 17, message: 'Tối đa 17 inch' },
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyKmLimit">Giới hạn km/ngày</Label>
                  <Input
                    id="dailyKmLimit"
                    type="number"
                    placeholder="VD: 300 (mặc định: 300km)"
                    {...register('specs.dailyKmLimit', {
                      min: { value: 1, message: 'Phải lớn hơn 0' },
                    })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Manufacturer Tab */}
            <TabsContent value="manufacturer" className="space-y-4 mt-4">
              <p className="text-sm text-gray-600 mb-4">
                Thông tin nhà sản xuất (tùy chọn nhưng nên điền)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Quốc gia sản xuất</Label>
                  <Input
                    id="country"
                    placeholder="VD: USA, Vietnam, China, Germany"
                    {...register('manufacturer.country')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website chính thức</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.tesla.com"
                    {...register('manufacturer.website', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'URL phải bắt đầu với http:// hoặc https://',
                      },
                    })}
                    disabled={isLoading}
                  />
                  {errors.manufacturer?.website && (
                    <p className="text-sm text-red-500">{errors.manufacturer.website.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tính năng</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: '' })}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tính năng
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        placeholder="VD: Camera 360, Sạc nhanh"
                        {...register(`features.${index}.value`)}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có tính năng nào. Click "Thêm tính năng" để bắt đầu.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>

            {/* Back button - show if not on first tab */}
            {!brand && currentTab !== 'basic' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentTab === 'specs') setCurrentTab('basic');
                  else if (currentTab === 'manufacturer') setCurrentTab('specs');
                  else if (currentTab === 'features') setCurrentTab('manufacturer');
                }}
                disabled={isLoading}
              >
                Quay lại
              </Button>
            )}

            {/* Next/Submit button */}
            {brand ? (
              // Edit mode - always show Update button
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Cập nhật
              </Button>
            ) : isFormComplete ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tạo mới
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Tiếp
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
