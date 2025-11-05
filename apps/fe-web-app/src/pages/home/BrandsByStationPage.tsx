import HeaderMain from '@/components/header/header-main';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import BrandCard from '@/components/shared/BrandCard';
import MapStations from '@/components/shared/MapStations';
import { useBrandHook } from '@/hooks/use-brand';
import { useStationHook } from '@/hooks/use-station';
import type { TBrand } from '@/schema/brand.schema';
import type { TStation } from '@/schema/station.schema';
import { AlertTriangle, Calendar, Clock, Loader2, Map } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function BrandsByStationPage() {
  const { useBrandsByStation } = useBrandHook();
  const { useStationList } = useStationHook();

  // Fetch stations
  const { data: stationsData, isLoading: stationsLoading } = useStationList();
  const stations = useMemo(
    () => stationsData?.data?.data || [],
    [stationsData]
  );

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // State for selected station and dates
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>(today);
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnDate, setReturnDate] = useState<string>(tomorrow);
  const [returnTime, setReturnTime] = useState<string>('10:00');
  const [dateError, setDateError] = useState<string>('');
  const [mapOpen, setMapOpen] = useState(false);

  // Handler for station selection from map
  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    setMapOpen(false);
  };

  // Validate dates
  useEffect(() => {
    if (!pickupDate || !returnDate) {
      setDateError('');
      return;
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const todayDate = new Date(today);

    // Check if pickup date is in the past
    if (pickup < todayDate) {
      setDateError('Ngày nhận xe không được là ngày trong quá khứ');
      return;
    }

    // Check if return date is in the past
    if (returnD < todayDate) {
      setDateError('Ngày trả xe không được là ngày trong quá khứ');
      return;
    }

    // Check if return date is before pickup date
    if (returnD < pickup) {
      setDateError('Ngày trả xe phải lớn hơn hoặc bằng ngày nhận xe');
      return;
    }

    setDateError('');
  }, [pickupDate, returnDate, today]);

  // Set default station (station-hcm-01 or first station)
  useEffect(() => {
    if (stations.length > 0 && !selectedStationId) {
      const defaultStation =
        stations.find((s: TStation) => s.code === 'station-hcm-01') ||
        stations[0];
      // ✅ FIX: Use station._id (ObjectId) instead of station.code
      setSelectedStationId(defaultStation._id);
    }
  }, [stations, selectedStationId]);

  // Fetch brands by station
  const {
    data: brandsData,
    isLoading: brandsLoading,
    isError,
  } = useBrandsByStation(selectedStationId);

  // Debug logs
  console.log('🔍 Selected Station ID:', selectedStationId);
  console.log('📦 Brands Data Full:', brandsData);
  console.log('📊 Brands Data.data:', brandsData?.data);
  console.log('🚗 Final Brands Array:', brandsData?.data?.data);

  const brands = brandsData?.data?.data || [];
  console.log('✅ Brands length:', brands.length);
  console.log('🎯 First brand item:', brands[0]);

  // Check structure - is it TBrand directly or {brand, availableVehicleCount, isAvailable}?
  const isNestedStructure = brands[0]?.brand !== undefined;
  console.log(
    '🏗️ Is nested structure (has .brand property)?',
    isNestedStructure
  );

  const isLoading = stationsLoading || brandsLoading;

  const handleSearch = () => {
    if (dateError) {
      alert(dateError);
      return;
    }
    console.log('🔍 Search:', {
      selectedStationId,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
    // TODO: Implement search logic with validated dates
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderMain title="Danh sách xe điện" />

      {/* Content */}
      <div className="flex-1 container mx-auto py-6 px-4 max-w-7xl">
        {/* Filter Bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Station Selector with Map Button */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              {stationsLoading ? (
                <div className="flex items-center justify-center h-12 border rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  aria-label="Chọn trạm thuê xe"
                  title="Chọn trạm thuê xe"
                >
                  {stations.map((station: TStation) => (
                    <option key={station._id} value={station._id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Pickup Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày nhận xe
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  title="Chọn ngày nhận xe"
                  placeholder="Chọn ngày nhận xe"
                />
              </div>
            </div>

            {/* Pickup Time */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  title="Chọn giờ nhận xe"
                  placeholder="Chọn giờ nhận xe"
                />
              </div>
            </div>

            {/* Return Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày trả xe
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || today}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  title="Chọn ngày trả xe"
                  placeholder="Chọn ngày trả xe"
                />
              </div>
            </div>

            {/* Return Time */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  title="Chọn giờ trả xe"
                  placeholder="Chọn giờ trả xe"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1">
              <Button
                onClick={handleSearch}
                disabled={!!dateError}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Tìm kiếm xe
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {dateError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{dateError}</p>
            </div>
          )}
        </div>

        {/* Brand List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-blue-600" />
            <span className="text-lg">Đang tải danh sách xe...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
            <AlertTriangle className="w-12 h-12 mb-3 text-red-500" />
            <p className="text-lg font-semibold text-red-600 mb-2">
              Không thể tải danh sách xe
            </p>
            <p className="text-sm text-gray-500">Vui lòng thử lại sau</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
            <span role="img" aria-label="car" className="text-6xl mb-4">
              🚗
            </span>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Không có xe tại trạm này
            </p>
            <p className="text-sm text-gray-500">Vui lòng chọn trạm khác</p>
          </div>
        ) : (
          <>
            {/* Brand Cards Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Check if data is nested structure or direct TBrand[]
                const isNestedStructure = brands[0]?.brand !== undefined;

                if (isNestedStructure) {
                  // New API format: {brand, availableVehicleCount, isAvailable}
                  const filteredBrands = brands.filter(
                    (item) => item?.brand?._id
                  );
                  console.log(
                    '🔍 Filtered brands (nested) count:',
                    filteredBrands.length
                  );
                  return filteredBrands.map((item) => (
                    <BrandCard
                      key={item.brand._id}
                      brand={item.brand}
                      availableCount={item.availableVehicleCount}
                      isAvailable={item.isAvailable}
                      stationId={selectedStationId}
                      pickupDate={pickupDate}
                      pickupTime={pickupTime}
                      returnDate={returnDate}
                      returnTime={returnTime}
                    />
                  ));
                } else {
                  // Old API format: TBrand[] directly - cast to unknown first
                  const directBrands = brands as unknown as TBrand[];
                  const filteredBrands = directBrands.filter(
                    (brand) => brand?._id
                  );
                  console.log(
                    '🔍 Filtered brands (direct) count:',
                    filteredBrands.length
                  );
                  return filteredBrands.map((brand) => (
                    <BrandCard
                      key={brand._id}
                      brand={brand}
                      stationId={selectedStationId}
                      pickupDate={pickupDate}
                      pickupTime={pickupTime}
                      returnDate={returnDate}
                      returnTime={returnTime}
                    />
                  ));
                }
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
