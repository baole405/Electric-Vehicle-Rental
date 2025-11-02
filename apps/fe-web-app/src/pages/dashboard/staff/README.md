# Staff Dashboard Pages

## 📁 Cấu trúc thư mục

```
staff/
├── StaffBookingManagement.tsx  # Quản lý bookings (CRUD)
├── StaffBrandView.tsx          # Xem thông tin brands (Read-only)
├── components/                 # Components dùng RIÊNG cho Staff (empty - sẵn sàng cho tương lai)
├── index.ts                    # Export file
└── README.md                   # File này
```

⚠️ **LƯU Ý**: Staff có folder `components/` riêng biệt, KHÔNG dùng chung components với Admin. Khi cần custom components cho Staff, tạo trong `staff/components/`.

## 🎯 Vai trò (Role)

Trang này dành riêng cho **Staff** - nhân viên vận hành hệ thống.

## ✨ Tính năng

### 1. StaffBookingManagement

- **Danh sách Bookings**: Table view toàn bộ bookings
- **Tạo Booking**: Form đầy đủ thông tin khách hàng
  - Thông tin KH: Tên, SĐT, Email
  - Chọn brand, station
  - Thời gian lấy/trả xe
  - Phương thức thanh toán
- **Cập nhật Status**: Thay đổi trạng thái booking
  - pending → held → confirmed → paid → checked_out → completed
  - cancelled
- **Xóa Booking**: Confirm dialog trước khi xóa
- **Search**: Tìm theo tên, SĐT, email (coming soon)
- **Filter**: Lọc theo status (coming soon)

### 2. StaffBrandView

- **Xem danh sách Brands**: Table view (Read-only)
- **Search Brands**: Tìm theo tên hoặc mã
- **Xem chi tiết Brand**: Dialog hiển thị:
  - Thông tin cơ bản (mã, tên, giá)
  - Nhà sản xuất (quốc gia, website)
  - Thông số kỹ thuật (seats, range, battery, etc.)
  - Tính năng nổi bật
  - Ngày tạo/cập nhật

⚠️ **Lưu ý**: Staff KHÔNG có quyền tạo/sửa/xóa brands

## 🔐 Permissions

Staff có quyền:

- ✅ Quản lý Bookings (CRUD)
- ✅ Xem Brands (Read-only)
- ✅ Xem Vehicles
- ✅ Xem Stations
- ❌ KHÔNG được quản lý Users
- ❌ KHÔNG được tạo/sửa/xóa Brands
- ❌ KHÔNG được thay đổi system settings

```tsx
const isStaff = effectiveRole === 'staff';
const hasStaffAccess = isAdmin || isStaff;

if (!hasStaffAccess) {
  return <AccessDenied />;
}
```

## 📦 Import

```tsx
// Import tất cả staff pages
import { StaffBookingManagement, StaffBrandView } from '@/pages/dashboard/staff';

// Hoặc import riêng lẻ
import { StaffBookingManagement } from '@/pages/dashboard/staff';
import { StaffBrandView } from '@/pages/dashboard/staff';
```

## 🚀 Sử dụng

### Trong AdminDashboard:

```tsx
import { StaffBookingManagement, StaffBrandView } from '@/pages/dashboard/staff';

const AdminDashboard = () => {
  const { role } = useAuthContext();

  return (
    <DashboardLayout>
      {activeSection === 'bookings' && <StaffBookingManagement />}

      {activeSection === 'brands' && (role === 'admin' ? <AdminBrandManagement /> : <StaffBrandView />)}
    </DashboardLayout>
  );
};
```

### Standalone Staff Dashboard:

```tsx
import { StaffBookingManagement } from '@/pages/dashboard/staff';

const StaffDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h1>Staff Workspace</h1>
      <StaffBookingManagement />
    </div>
  );
};
```

## 🛠️ Components được sử dụng

### shadcn/ui Components

- `Button`, `Card`, `Input`, `Label`
- `Table`, `Dialog`, `Select`
- `Badge`

### Custom Components

- `BadgeStatus` - Badge màu theo status
- `TableLoader` - Loading state
- `EmptyState` - Empty state
- `RefreshButton` - Button refresh với animation

## 📊 Data Flow

```
StaffBookingManagement
  ↓
useBooking() Hook
  ↓
BookingApi
  ↓
Backend API (/api/bookings)
  ↓
Response → React Query Cache → UI Update
```

## 🎨 Status Colors

```tsx
const statusColors = {
  pending: '🟡 Vàng', // Chờ xử lý
  held: '⚪ Xám', // Đang giữ chỗ
  confirmed: '🔵 Xanh dương', // Đã xác nhận
  paid: '🟢 Xanh lá', // Đã thanh toán
  checked_out: '🟢 Xanh lá', // Đã giao xe
  completed: '🟢 Xanh lá', // Hoàn thành
  cancelled: '🔴 Đỏ', // Đã hủy
  expired: '🔴 Đỏ', // Hết hạn
};
```

## 🔄 State Management

### Form State (React Hook Form)

```tsx
const bookingForm = useForm<CreateBookingForm>({
  defaultValues: {
    renterName: '',
    phoneNumber: '',
    email: '',
    // ...
  },
});
```

### Data Fetching (TanStack Query)

```tsx
const { useBookingList, createBooking } = useBooking();
const bookingQuery = useBookingList();

const handleSubmit = async (values) => {
  await createBooking.mutateAsync(values);
  bookingForm.reset();
};
```

### Feedback Messages

```tsx
const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

// Success
setBookingFeedback('✅ Booking created successfully.');

// Error
setBookingFeedback('❌ Failed to create booking.');
```

## 🧪 Testing

### Manual Testing Checklist

**StaffBookingManagement**:

- [ ] Tạo booking thành công
- [ ] Form reset sau khi tạo
- [ ] Cập nhật status thành công
- [ ] Xóa booking (với confirm)
- [ ] Loading states hoạt động
- [ ] Feedback messages hiển thị

**StaffBrandView**:

- [ ] Hiển thị danh sách brands
- [ ] Search brands hoạt động
- [ ] Xem chi tiết brand
- [ ] KHÔNG có nút Edit/Delete

## 📝 Form Validation

### Create Booking Form

**Required fields** (\*):

- Tên khách hàng (min 1 char)
- Số điện thoại (format: 0xxxxxxxxx)
- Email (email format)
- Thương hiệu
- Trạm lấy xe
- Phương thức thanh toán
- Ngày/giờ lấy xe
- Ngày/giờ trả xe

**Optional fields**:

- Địa điểm lấy xe
- Mã khuyến mãi
- Ghi chú

### Update Status Form

**Required fields**:

- Booking ID
- Trạng thái mới

## 🎯 User Experience

### Loading States

```tsx
{
  bookingQuery.isLoading ? <TableLoader /> : <BookingTable data={bookings} />;
}
```

### Empty States

```tsx
{
  bookings.length === 0 ? <EmptyState message="Không có booking nào." /> : <BookingTable />;
}
```

### Feedback

```tsx
{
  bookingFeedback && <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">{bookingFeedback}</div>;
}
```

## 🔗 Related

- **Admin Pages**: `/admin` - Trang quản trị (full permissions)
- **Shared Components**: `/shared` - Components dùng chung
- **Hooks**: `/hooks/use-booking.tsx`, `/hooks/use-brand.tsx`

## 🐛 Known Issues

- Search & filter chưa implement
- Pagination chưa có
- Confirm dialog dùng native `confirm()`
- Chưa validate form trước khi submit

## 🚧 TODO

- [ ] Implement search & filter
- [ ] Add pagination
- [ ] Custom confirm dialog (thay thế native)
- [ ] Form validation (Zod schema)
- [ ] Export bookings (CSV)
- [ ] Bulk actions
- [ ] Print booking confirmation
- [ ] QR code for booking

## 💡 Best Practices

1. **Always check permissions**

   ```tsx
   if (role === 'staff') {
     // Show read-only view
     return <StaffBrandView />;
   }
   ```

2. **Reset form sau submit**

   ```tsx
   await createBooking.mutateAsync(data);
   bookingForm.reset();
   ```

3. **Disable buttons khi pending**

   ```tsx
   <Button disabled={createBooking.isPending}>{createBooking.isPending ? 'Đang tạo...' : 'Tạo Booking'}</Button>
   ```

4. **Show feedback messages**
   ```tsx
   try {
     await mutation.mutateAsync(data);
     setFeedback('✅ Success');
   } catch (error) {
     setFeedback('❌ Error');
   }
   ```

---

**Last Updated**: November 2, 2025  
**Maintainer**: Staff Team
