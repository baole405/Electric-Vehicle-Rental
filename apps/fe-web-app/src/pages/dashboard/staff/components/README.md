# Staff Booking Management Components

Đây là cấu trúc components đã được tách nhỏ từ file `StaffBookingManagement.tsx` ban đầu để dễ quản lý và maintain.

## 📁 Cấu trúc thư mục

```
staff/
├── components/
│   ├── index.ts                        # Export tất cả components
│   ├── booking-constants.ts            # Constants và helper functions
│   ├── BookingDetailDialog.tsx         # Dialog xem chi tiết booking
│   ├── PaymentDialog.tsx               # Dialog ghi nhận thanh toán
│   ├── CreateRentalDialog.tsx          # Dialog tạo rental
│   ├── HandoverDialog.tsx              # Dialog bàn giao xe
│   ├── AssignVehicleDialog.tsx         # Dialog gán xe cho booking
│   └── UpdateBookingStatusDialog.tsx   # Dialog cập nhật trạng thái
├── StaffBookingManagement.tsx          # Main component (452 lines)
└── StaffBookingManagement.old.tsx      # Backup file cũ (1742 lines)
```

## 📦 Components

### 1. **booking-constants.ts**

Chứa tất cả constants và helper functions:

- `STATUS_COLORS`: Mapping màu sắc cho từng status
- `STATUS_LABELS`: Mapping labels tiếng Việt cho status
- `getNextStatuses()`: Helper function xác định trạng thái tiếp theo hợp lệ

### 2. **BookingDetailDialog.tsx**

Dialog hiển thị chi tiết đầy đủ của booking:

- Thông tin khách hàng
- Thông tin xe
- Thời gian thuê
- Địa điểm
- Chi phí
- Trạng thái & phương thức thanh toán
- Nút **Duyệt** và **Từ chối** (cho PENDING_APPROVAL)

**Props:**

```typescript
{
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (booking: TBooking) => void;
  onReject?: (booking: TBooking) => void;
  isUpdating?: boolean;
}
```

### 3. **PaymentDialog.tsx**

Dialog ghi nhận thanh toán trực tiếp:

- Chọn phương thức thanh toán
- Nhập số tiền
- Ghi chú

**Props:**

```typescript
{
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createPayment: ReturnType<typeof usePaymentHook>['createPayment'];
  onSuccess: () => void;
}
```

### 4. **CreateRentalDialog.tsx**

Dialog tạo rental từ booking:

- Chọn xe từ danh sách xe khả dụng
- Nhập mã trạm bàn giao
- Ghi chú

**Props:**

```typescript
{
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: TVehicle[];
  createRental: ReturnType<typeof useRentalHook>['createRental'];
  onSuccess: () => void;
}
```

### 5. **HandoverDialog.tsx**

Dialog bàn giao xe (nhận/trả):

- Mã trạm
- Số km (ODO)
- % pin
- Upload ảnh
- Ghi chú

**Props:**

```typescript
{
  context: { rental: TRental; type: 'pickup' | 'return' } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createHandover: ReturnType<typeof useHandoverHook>['createHandover'];
  onSuccess: (message?: string) => void;
}
```

### 6. **AssignVehicleDialog.tsx**

Dialog gán xe cụ thể cho booking:

- Hiển thị dòng xe
- Chọn xe từ danh sách xe khả dụng

**Props:**

```typescript
{
  booking: TBooking | null;
  availableVehicles: TVehicle[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

### 7. **UpdateBookingStatusDialog.tsx**

Dialog cập nhật trạng thái booking:

- Hiển thị trạng thái hiện tại
- Chọn trạng thái mới (dựa trên workflow)
- Nhập lý do hủy (nếu chọn CANCELLED)

**Props:**

```typescript
{
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

## 🎯 Main Component: StaffBookingManagement.tsx

File chính giờ chỉ còn **452 lines** (giảm từ 1742 lines - 74% nhỏ gọn hơn!)

**Chức năng:**

- Hiển thị danh sách bookings
- Search và filter
- Stats cards (tổng số, chờ duyệt, đã thanh toán, hoàn thành)
- Quản lý state cho tất cả dialogs
- Event handlers

## 🔧 Import và sử dụng

```typescript
import { AssignVehicleDialog, BookingDetailDialog, CreateRentalDialog, HandoverDialog, PaymentDialog, STATUS_COLORS, STATUS_LABELS, UpdateBookingStatusDialog } from './components';
```

Tất cả components đều được export từ `./components/index.ts` nên chỉ cần import một lần.

## ✅ Lợi ích

1. **Dễ maintain**: Mỗi component có trách nhiệm rõ ràng
2. **Tái sử dụng**: Các dialog có thể dùng ở nơi khác
3. **Testing dễ hơn**: Test từng component độc lập
4. **Code ngắn gọn**: File chính giảm 74% số dòng
5. **Type-safe**: Tất cả đều có TypeScript types rõ ràng
6. **Separation of Concerns**: UI, logic, constants tách biệt

## 🚀 Next Steps

Nếu muốn tối ưu thêm:

- Tách phần table thành `BookingTable.tsx`
- Tách stats cards thành `BookingStats.tsx`
- Tách search/filter thành `BookingFilters.tsx`
- Tạo custom hooks: `useBookingFilters()`, `useBookingDialogs()`
