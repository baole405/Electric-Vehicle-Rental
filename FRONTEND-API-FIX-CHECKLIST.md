# ✅ Frontend API Fix Checklist - COMPLETED

## 🎯 Vấn đề đã sửa

Backend đã reset database với **ObjectId mới**. Frontend cần refetch data mới thay vì dùng ObjectId cũ.

---

## ✨ Thay đổi đã thực hiện

### 1. **Cập nhật Brand Schema** ✅

- File: `apps/fe-web-app/src/schema/brand.schema.ts`
- **Thay đổi**: `TBrandWithAvailability` type

```typescript
// CŨ (sai format)
type TBrandWithAvailability = TBrand & {
  availability?: BrandAvailability;
};

// MỚI (đúng theo API response)
type TBrandWithAvailability = {
  brand: TBrand;
  availableVehicleCount: number;
  isAvailable: boolean;
};
```

### 2. **Cập nhật BrandCard Component** ✅

- File: `apps/fe-web-app/src/components/shared/BrandCard.tsx`
- **Thay đổi Props**:

```typescript
// CŨ
interface BrandCardProps {
  brand: TBrandWithAvailability; // Sai - expect full object
  stationId: string;
  // ...
}

// MỚI
interface BrandCardProps {
  brand: TBrand; // Brand info
  availableCount?: number; // Số xe có sẵn
  isAvailable?: boolean; // Có xe không
  stationId: string;
  // ...
}
```

- **Cập nhật logic hiển thị**:
  - Hiển thị số xe có sẵn: `"Chọn xe (${availableCount} xe)"`
  - Check availability: `isAvailable && availableCount > 0`
  - Badge status dựa trên `isAvailable` thay vì `brand.availability?.status`

### 3. **Cập nhật BrandsByStationPage** ✅

- File: `apps/fe-web-app/src/pages/home/BrandsByStationPage.tsx`
- **Thay đổi data mapping**:

```typescript
// CŨ
{brands.map((brand) => (
  <BrandCard
    key={brand._id}
    brand={brand}  // Sai - brand là wrapped object
    ...
  />
))}

// MỚI
{brands.map((item) => (
  <BrandCard
    key={item.brand._id}
    brand={item.brand}                    // Extract brand object
    availableCount={item.availableVehicleCount}  // Pass count
    isAvailable={item.isAvailable}        // Pass availability
    ...
  />
))}
```

---

## 🔧 API Đang Sử Dụng

### ✅ Brand API

```http
GET /api/brands/by-station?stationId={stationId}
```

**Response Format:**

```json
{
  "data": [
    {
      "brand": {
        "_id": "6908d0bc0222ed11d2901d7c",
        "code": "TESLA-M3",
        "name": "Tesla Model 3",
        "baseDailyRate": 1450000,
        "specs": { ... }
      },
      "availableVehicleCount": 5,
      "isAvailable": true
    }
  ]
}
```

### ✅ Station API

```http
GET /api/stations
```

**Response Format:**

```json
{
  "data": [
    {
      "_id": "6908d0bb0222ed11d2901d78",
      "code": "HCM-01",
      "name": "Trạm Quận 1",
      ...
    }
  ]
}
```

---

## 🧪 Testing Checklist

- [x] Schema types updated to match API response
- [x] BrandCard component accepts new props
- [x] BrandsByStationPage correctly maps API data
- [x] Lint passes (no errors, only warnings)
- [x] No hardcoded ObjectIds in code
- [x] No localStorage cache for brands/vehicles

---

## 🚀 Cách Test

### 1. **Xóa cache (nếu có)**

```javascript
localStorage.clear();
sessionStorage.clear();
```

### 2. **Restart dev server**

```bash
npx nx run fe-web-app:dev
```

### 3. **Truy cập page**

```
http://localhost:5173/brands-by-station
```

### 4. **Kiểm tra Console**

- ✅ Có log: `"🔍 Selected Station ID: ..."`
- ✅ Có log: `"📦 Brands Data Full: ..."`
- ✅ Response phải có format: `{ brand: {...}, availableVehicleCount: ..., isAvailable: ... }`

### 5. **Kiểm tra UI**

- ✅ Brand cards hiển thị đúng
- ✅ Nút "Chọn xe" hiển thị số lượng: `"Chọn xe (5 xe)"`
- ✅ Badge "Miễn phí sạc" hiển thị khi có xe
- ✅ Badge "Hết xe" hiển thị khi không có xe

---

## 📊 Database Status

```
✅ Total vehicles: 50
✅ Total brands: 10
✅ Total stations: 4
```

**Stations:**

- `HCM-01`: Trạm Quận 1 (14 xe)
- `HCM-02`: Trạm Tân Bình (12 xe)
- `HN-01`: Trạm Hoàn Kiếm (13 xe)
- `DN-01`: Trạm Hải Châu (11 xe)

---

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG hardcode ObjectId** - Luôn fetch từ API
2. **Backend API format đã thay đổi** - Cần update schema và types
3. **API response có nested structure** - `data.data.data` hoặc `data.data`
4. **Type casting với `unknown`** - Là temporary solution cho type mismatch giữa schema và API

---

## 🔗 Related Files

- `apps/fe-web-app/src/schema/brand.schema.ts`
- `apps/fe-web-app/src/apis/brand.api.tsx`
- `apps/fe-web-app/src/hooks/use-brand.tsx`
- `apps/fe-web-app/src/components/shared/BrandCard.tsx`
- `apps/fe-web-app/src/pages/home/BrandsByStationPage.tsx`

---

## ✅ Status: READY FOR TESTING

Tất cả thay đổi đã được apply và pass lint. Frontend đã sẵn sàng để test với backend mới.
