# Dashboard - Electric Vehicle Rental

## 📁 Cấu trúc thư mục

```
dashboard/
├── admin/                      # Admin pages & components (RIÊNG BIỆT)
│   ├── AdminDashboard.tsx
│   ├── AdminBrandManagement.tsx
│   ├── components/             # Components chỉ dành cho Admin
│   │   ├── BrandFormDialog.tsx
│   │   ├── DeleteBrandDialog.tsx
│   │   ├── AdminStatCards.tsx
│   │   ├── RevenueAreaChart.tsx
│   │   ├── TableLayout.tsx
│   │   ├── FormDialog.tsx
│   │   └── index.ts
│   ├── index.ts
│   └── README.md
├── staff/                      # Staff pages & components (RIÊNG BIỆT)
│   ├── StaffBookingManagement.tsx
│   ├── StaffBrandView.tsx
│   ├── components/             # Components chỉ dành cho Staff (sẵn sàng)
│   ├── index.ts
│   └── README.md
├── index.ts                    # Main export file
└── README.md                   # File này
```

## 🎯 Nguyên tắc tổ chức

### ⚠️ QUAN TRỌNG: TÁCH BIỆT HOÀN TOÀN

- **Admin** và **Staff** KHÔNG dùng chung components
- Mỗi role có folder `components/` riêng
- Khi cần customize cho từng role → dễ dàng maintain
- Không có folder `shared/` - tất cả đều tách biệt

### Lý do tách biệt:

1. **Dễ customize**: Admin và Staff có thể custom giao diện riêng
2. **Dễ maintain**: Thay đổi Admin không ảnh hưởng Staff
3. **Rõ ràng**: Biết component nào thuộc role nào
4. **Scalable**: Thêm role mới dễ dàng (e.g., Manager)

## 📦 Import

### Import Admin pages

```tsx
import { AdminDashboard, AdminBrandManagement } from '@/pages/dashboard/admin';

// Hoặc import components nếu cần
import { BrandFormDialog, AdminStatCards } from '@/pages/dashboard/admin';
```

### Import Staff pages

```tsx
import { StaffBookingManagement, StaffBrandView } from '@/pages/dashboard/staff';
```

### ❌ KHÔNG nên import cross-role

```tsx
// ❌ BAD - Staff import Admin components
import { BrandFormDialog } from '@/pages/dashboard/admin';

// ✅ GOOD - Staff tạo component riêng hoặc dùng shadcn/ui
import { Dialog } from '@/components/shadcn/ui/dialog';
```

## 🔐 Role-based Access

### Admin Role

- Full permissions (tất cả CRUD operations)
- Access: `/admin/dashboard`
- Pages: AdminDashboard, AdminBrandManagement

### Staff Role

- Limited permissions (chủ yếu xem và booking)
- Access: `/staff/dashboard`
- Pages: StaffBookingManagement, StaffBrandView

## 📚 Chi tiết từng role

### 📘 [Admin Documentation](./admin/README.md)

- AdminDashboard: Tổng quan hệ thống
- AdminBrandManagement: Quản lý brands (CRUD)
- Components: BrandFormDialog, DeleteBrandDialog, AdminStatCards, v.v.

### 📗 [Staff Documentation](./staff/README.md)

- StaffBookingManagement: Quản lý bookings (CRUD)
- StaffBrandView: Xem brands (Read-only)
- Components: (Sẵn sàng cho tương lai)

## 🚀 Development Workflow

### Thêm feature mới cho Admin:

1. Tạo component trong `admin/components/`
2. Export trong `admin/components/index.ts`
3. Sử dụng trong `AdminDashboard.tsx` hoặc `AdminBrandManagement.tsx`
4. Cập nhật `admin/README.md`

### Thêm feature mới cho Staff:

1. Tạo component trong `staff/components/`
2. Export trong `staff/components/index.ts`
3. Sử dụng trong `StaffBookingManagement.tsx` hoặc `StaffBrandView.tsx`
4. Cập nhật `staff/README.md`

## 🔄 Migration Guide

Nếu bạn đang migration từ cấu trúc cũ (có folder `shared/`):

### Old structure:

```
dashboard/
├── shared/
│   └── BrandFormDialog.tsx   # Dùng chung
├── AdminDashboard.tsx
└── StaffBookingManagement.tsx
```

### New structure:

```
dashboard/
├── admin/
│   ├── AdminDashboard.tsx
│   └── components/
│       └── BrandFormDialog.tsx  # Riêng Admin
└── staff/
    ├── StaffBookingManagement.tsx
    └── components/
        └── BookingFormDialog.tsx  # Riêng Staff (nếu cần)
```

### Update imports:

```tsx
// Old
import { BrandFormDialog } from '../shared/BrandFormDialog';

// New (Admin)
import { BrandFormDialog } from './components/BrandFormDialog';

// New (Staff - tạo mới nếu cần)
import { BookingFormDialog } from './components/BookingFormDialog';
```

## 🎨 UI Guidelines

### Admin UI

- Full-featured dialogs
- Complex forms (nhiều fields)
- Charts & analytics
- Màu theme: Primary (admin brand color)

### Staff UI

- Simplified dialogs
- Quick-action forms (ít fields hơn)
- Table views (ít charts)
- Màu theme: Secondary (staff brand color)

## 🧪 Testing

### Test isolation:

- Test Admin pages KHÔNG nên mock Staff components
- Test Staff pages KHÔNG nên mock Admin components
- Mỗi role test riêng biệt

## 📊 Architecture Decision

**Tại sao tách biệt thay vì dùng chung?**

### ✅ Pros (Tách biệt):

- Dễ customize cho từng role
- Không conflict khi update
- Clear ownership (ai maintain component nào)
- Scalable (thêm role mới)

### ❌ Cons (Dùng chung):

- Hard to customize (thay đổi ảnh hưởng cả 2 roles)
- Conflict khi merge code
- Unclear ownership
- Hard to scale

➡️ **Quyết định: TÁCH BIỆT HOÀN TOÀN**

## 🔗 Related

- [BE API Requirements](../../../BE_API_REQUIREMENTS.md)
- [Booking Flow Complete](../../../BOOKING_FLOW_COMPLETE.md)
- [Admin README](./admin/README.md)
- [Staff README](./staff/README.md)

---

**Last Updated**: November 2, 2025  
**Maintainer**: Frontend Team  
**Architecture**: Role-separated (Admin | Staff)

## 🎯 Tính năng

### 1. Tạo Booking mới

- Form đầy đủ thông tin khách hàng
- Chọn thương hiệu xe, trạm lấy xe
- Chọn thời gian lấy/trả xe
- Hỗ trợ nhiều phương thức thanh toán

### 2. Cập nhật trạng thái

- Thay đổi trạng thái booking theo luồng:
  - `pending` → Chờ xử lý
  - `held` → Đang giữ chỗ
  - `confirmed` → Đã xác nhận
  - `paid` → Đã thanh toán
  - `checked_out` → Đã giao xe
  - `completed` → Hoàn thành
  - `cancelled` → Đã hủy

### 3. Danh sách Bookings

- Hiển thị tất cả bookings dạng bảng
- Màu sắc trạng thái trực quan:
  - 🟡 Vàng: Chờ xử lý, Chờ thanh toán
  - 🔵 Xanh dương: Đã xác nhận
  - 🟢 Xanh lá: Đã thanh toán, Hoàn thành
  - 🔴 Đỏ: Đã hủy, Hết hạn
- Tìm kiếm và lọc (coming soon)
- Phân trang (coming soon)

### 4. Xóa Booking

- Xóa booking với xác nhận
- Auto refresh danh sách sau khi xóa

## 🚀 Cách sử dụng

### Import component

```tsx
import { StaffBookingManagement } from '@/pages/dashboard';

// Hoặc
import { StaffBookingManagement } from '@/pages/dashboard/StaffBookingManagement';
```

### Sử dụng trong AdminDashboard

Trong file `AdminDashboard.tsx`:

```tsx
import { StaffBookingManagement } from '@/pages/dashboard';

// ...

{
  activeSection === 'bookings' && (
    <div className="pt-6">
      <StaffBookingManagement />
    </div>
  );
}
```

### Sử dụng độc lập

```tsx
import { StaffBookingManagement } from '@/pages/dashboard';

const BookingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Quản lý Booking</h1>
      <StaffBookingManagement />
    </div>
  );
};

export default BookingPage;
```

## 📦 Dependencies

Component này sử dụng các hooks và thư viện sau:

- `react-hook-form` - Quản lý form
- `@tanstack/react-query` - Data fetching & caching
- `lucide-react` - Icons
- shadcn/ui components:
  - `Button`
  - `Card`
  - `Input`
  - `Label`
  - `Select`

## 🔧 API Hooks

Component sử dụng các hooks sau từ `@/hooks`:

- `useBooking()` - CRUD operations cho bookings

  - `useBookingList()` - Lấy danh sách
  - `createBooking` - Tạo mới
  - `updateBooking` - Cập nhật
  - `deleteBooking` - Xóa

- `useBrandHook()` - Lấy danh sách thương hiệu
- `useStationHook()` - Lấy danh sách trạm

## 📝 Form Validation

### Create Booking Form

Các trường bắt buộc (\*):

- Tên khách hàng
- Số điện thoại (format: 0xxxxxxxxx)
- Email (format chuẩn)
- Thương hiệu
- Trạm lấy xe
- Phương thức thanh toán
- Ngày/giờ lấy xe
- Ngày/giờ trả xe

Các trường tùy chọn:

- Địa điểm lấy xe
- Mã khuyến mãi
- Ghi chú

### Update Status Form

Các trường bắt buộc:

- Booking ID (ObjectId hoặc bookingCode)
- Trạng thái mới

## 🎨 UI Components

### BadgeStatus

Hiển thị trạng thái với màu sắc:

```tsx
<BadgeStatus variant="success">Đã thanh toán</BadgeStatus>
<BadgeStatus variant="warning">Chờ xử lý</BadgeStatus>
<BadgeStatus variant="destructive">Đã hủy</BadgeStatus>
```

### TableLoader

Loading state khi fetch data:

```tsx
{
  isLoading ? <TableLoader /> : <TableContent />;
}
```

### EmptyState

Hiển thị khi không có data:

```tsx
<EmptyState message="Không có booking nào." />
```

### RefreshButton

Button refresh với animation:

```tsx
<RefreshButton onClick={() => refetch()} loading={isLoading} />
```

## 🔄 State Management

Component quản lý state sau:

```tsx
const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);
```

Feedback messages:

- ✅ Success: "Booking created successfully."
- ❌ Error: "Failed to create booking."

## 🧪 Testing

### Manual Testing Checklist

1. **Tạo Booking**

   - [ ] Fill form đầy đủ
   - [ ] Submit thành công
   - [ ] Form reset sau khi tạo
   - [ ] Hiển thị feedback message
   - [ ] Refresh danh sách tự động

2. **Cập nhật Status**

   - [ ] Nhập đúng Booking ID
   - [ ] Chọn status mới
   - [ ] Cập nhật thành công
   - [ ] Hiển thị feedback
   - [ ] Refresh danh sách

3. **Xóa Booking**

   - [ ] Click nút Xóa
   - [ ] Hiện confirm dialog
   - [ ] Xóa thành công
   - [ ] Refresh danh sách

4. **Loading States**
   - [ ] Loading khi fetch initial data
   - [ ] Loading khi submit form
   - [ ] Disable buttons khi pending
   - [ ] Refresh button animation

## 📊 Data Flow

```
Component
  ↓
useBooking() Hook
  ↓
BookingApi
  ↓
Backend API (/api/bookings)
  ↓
Response
  ↓
React Query Cache
  ↓
Component Re-render
```

## 🚧 Roadmap / TODO

- [ ] Thêm filter theo status
- [ ] Search box (tìm theo tên, số ĐT, email)
- [ ] Phân trang (pagination)
- [ ] Export CSV/Excel
- [ ] Bulk actions (xóa nhiều, cập nhật nhiều)
- [ ] Detail dialog (xem chi tiết booking)
- [ ] Edit dialog (sửa thông tin booking)
- [ ] Print booking confirmation
- [ ] Email/SMS notifications
- [ ] Calendar view cho bookings
- [ ] Real-time updates (WebSocket)

## 🐛 Known Issues

- Chưa validate form trước khi submit
- Chưa có loading state cho brand/station dropdowns
- Chưa xử lý case brand/station list rỗng
- Confirm dialog dùng native `confirm()` - cần thay bằng custom dialog

## 💡 Best Practices

1. **Form Handling**

   ```tsx
   // ✅ Good - Reset form sau khi submit thành công
   await createBooking.mutateAsync(data);
   bookingForm.reset();

   // ❌ Bad - Không reset form
   await createBooking.mutateAsync(data);
   ```

2. **Error Handling**

   ```tsx
   // ✅ Good - Hiển thị error message
   try {
     await createBooking.mutateAsync(data);
   } catch (error) {
     console.error(error);
     setBookingFeedback('❌ Failed');
   }
   ```

3. **Loading States**
   ```tsx
   // ✅ Good - Disable button khi pending
   <Button disabled={createBooking.isPending}>{createBooking.isPending ? 'Loading...' : 'Submit'}</Button>
   ```

## 📖 Related Documentation

- [Booking API Guide](../BOOKING_API_GUIDE.md)
- [Booking Flow Complete](../BOOKING_FLOW_COMPLETE.md)
- [BE API Requirements](../BE_API_REQUIREMENTS.md)

## 🤝 Contributing

Khi thêm tính năng mới:

1. Cập nhật types trong `booking.schema.ts`
2. Thêm API endpoint trong `booking.api.tsx`
3. Cập nhật hook trong `use-booking.tsx`
4. Cập nhật component này
5. Cập nhật README

---

**Last Updated**: November 2, 2025  
**Author**: Frontend Team  
**Version**: 1.0.0
