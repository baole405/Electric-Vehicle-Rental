# Staff Check-in Simplified Flow

## 📋 Tổng quan

Flow đơn giản: **Staff xác nhận check-in → Rental COMPLETED, Booking SUCCESS**

### Các bước:

1. ✅ Customer thanh toán PayOS → **Booking = PAID**
2. ✅ Background job (5 phút sau) → **Rental = READY_FOR_PICKUP**
3. ✅ Staff confirm check-in → **Rental = COMPLETED**, **Booking = SUCCESS**

**Không cần bước ký contract** - Staff xác nhận là xong!

---

## 🎯 Những gì đã implement

### 1. Staff Dashboard - Tab Check-in

**File**: `apps/fe-web-app/src/pages/dashboard/staff/StaffDashboard.tsx`

- ✅ Thêm Tabs component với 2 tabs:
  - 📋 **Bookings**: Quản lý booking (tab cũ)
  - ✅ **Check-in**: Confirm check-in cho khách (tab mới)

### 2. StaffCheckinList Component (Hardcoded)

**File**: `apps/fe-web-app/src/pages/dashboard/staff/components/StaffCheckinList.tsx`

**Mock Data** - 3 rentals sẵn sàng check-in:

- user - VinFast VF e34 - Trạm Quận 1
- user - Dat Bike Weaver 200 - Trạm Quận 1
- Customer User 1 - Yadea E8S - Trạm Quận 3

**UI hiển thị**:

- Booking Code
- Customer (tên + SĐT)
- Vehicle (biển số + model)
- Pickup Time
- Station
- Button "✅ Confirm Check-in"

### 3. StaffCheckinDialog Component

**File**: `apps/fe-web-app/src/pages/dashboard/staff/components/StaffCheckinDialog.tsx`

**Form xác nhận**:

- Auto-fill: Staff name, Current time
- Input: Notes (optional)
- Button: Submit

**Khi submit**:

- Toast success: "Check-in thành công! Rental completed, Booking SUCCESS"
- Đóng dialog
- Refresh danh sách

---

## 🔧 Backend API cần implement

### Endpoint: Staff Confirm Check-in → Complete

```http
POST /api/rentals/:rentalId/staff-complete-checkin
```

**Request Body**:

```json
{
  "staffId": "staff-user-id",
  "checkinTime": "2024-11-06T10:00:00.000Z",
  "notes": "Khách đến đúng giờ, xe tình trạng tốt"
}
```

**Backend Logic**:

```javascript
exports.staffCompleteCheckin = async (req, res) => {
  const { rentalId } = req.params;
  const { staffId, checkinTime, notes } = req.body;

  // 1. Validate rental status
  const rental = await Rental.findById(rentalId).populate('booking');
  if (rental.status !== 'READY_FOR_PICKUP') {
    return res.status(400).json({
      message: 'Rental must be READY_FOR_PICKUP',
    });
  }

  // 2. Update rental to COMPLETED
  rental.status = 'COMPLETED';
  rental.checkedInAt = checkinTime;
  rental.checkedInBy = staffId;
  rental.checkinNotes = notes;
  rental.startTime = checkinTime;
  rental.completedAt = checkinTime;
  await rental.save();

  // 3. Update booking to SUCCESS
  await Booking.findByIdAndUpdate(rental.booking._id, {
    status: 'SUCCESS',
    updatedAt: new Date(),
  });

  res.json({
    success: true,
    data: {
      rental: {
        _id: rental._id,
        status: 'COMPLETED',
        checkedInAt: rental.checkedInAt,
      },
      booking: {
        _id: rental.booking._id,
        status: 'SUCCESS',
      },
    },
  });
};
```

**Route**:

```javascript
router.post('/rentals/:rentalId/staff-complete-checkin', authMiddleware, roleMiddleware(['staff', 'admin']), rentalController.staffCompleteCheckin);
```

---

## 🧪 Testing với Hardcoded Data

### 1. Chạy dev server

```bash
npm run dev
```

### 2. Login as Staff

- URL: `http://localhost:5173/login`
- Account: staff user

### 3. Navigate to Staff Dashboard

- URL: `http://localhost:5173/dashboard/staff`
- Click tab **✅ Check-in**

### 4. Test Flow

1. ✅ Thấy 3 rentals trong bảng
2. ✅ Click "Confirm Check-in" → Dialog mở
3. ✅ Nhập notes (optional)
4. ✅ Submit → Toast success
5. ✅ Verify: "Rental completed, Booking SUCCESS"

---

## 📝 Khi nào connect Backend?

Khi backend API `/staff-complete-checkin` đã sẵn sàng:

### Sửa file: `StaffCheckinList.tsx`

**Bước 1**: Uncomment hook

```tsx
const { useReadyForPickupRentals, staffCompleteCheckin } = useRentalHook();
const readyRentalsQuery = useReadyForPickupRentals({
  stationId,
  date: date || new Date().toISOString().split('T')[0],
});
const rentals = (readyRentalsQuery.data?.data?.data ?? []) as TRental[];
```

**Bước 2**: Xóa mock data

```tsx
// Xóa dòng này:
// const rentals = MOCK_RENTALS;
```

**Bước 3**: Sửa `handleSubmitCheckin`

```tsx
const handleSubmitCheckin = async (data: { staffId: string; notes: string }) => {
  if (!selectedRental) return;

  try {
    // Gọi API thật
    await staffCompleteCheckin.mutateAsync({
      rentalId: selectedRental._id,
      data: {
        staffId: data.staffId,
        checkinTime: new Date().toISOString(),
        notes: data.notes,
      },
    });

    toast.success('✅ Check-in thành công!');
    setDialogOpen(false);
    setSelectedRental(null);
  } catch (error) {
    toast.error('❌ Lỗi check-in!', {
      description: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

**Bước 4**: Update button disabled state

```tsx
<Button size="sm" onClick={() => handleConfirmCheckin(rental)} disabled={staffCompleteCheckin.isPending}>
  ✅ Confirm Check-in
</Button>
```

---

## 🔥 So sánh vs Flow cũ

### Flow cũ (phức tạp):

1. PAID → READY_FOR_PICKUP
2. Staff confirm → CHECKED_IN
3. Customer ký contract → IN_PROGRESS
4. Booking SUCCESS sau khi ký

### Flow mới (đơn giản) ✅:

1. PAID → READY_FOR_PICKUP
2. Staff confirm → **COMPLETED** + Booking **SUCCESS**

**Lợi ích**:

- ✅ Nhanh hơn (1 bước thay vì 2 bước)
- ✅ Không cần màn hình ký contract
- ✅ Staff kiểm soát toàn bộ
- ✅ Ít lỗi hơn (less moving parts)

---

## ✅ Checklist hoàn thành

### Frontend (Hardcoded - DONE ✅)

- [x] Staff Dashboard có tab Check-in
- [x] StaffCheckinList hiển thị mock data (3 rentals)
- [x] StaffCheckinDialog hoạt động
- [x] Toast notification khi submit
- [x] Build thành công không lỗi

### Backend (TODO ⏳)

- [ ] API endpoint `/staff-complete-checkin`
- [ ] Update Rental status → COMPLETED
- [ ] Update Booking status → SUCCESS
- [ ] Validation: rental phải READY_FOR_PICKUP
- [ ] Ghi log: staffId, checkinTime, notes

### Integration (TODO ⏳)

- [ ] Tạo `staffCompleteCheckin` hook trong `use-rental.tsx`
- [ ] Connect StaffCheckinList với API thật
- [ ] Test E2E: Booking → Payment → BGJ → Staff Check-in → SUCCESS

---

## 🚀 Deployment

Sau khi backend ready:

```bash
# 1. Sửa StaffCheckinList.tsx (uncomment API calls)
# 2. Test local
npm run dev

# 3. Build production
npm run build

# 4. Deploy
git add .
git commit -m "feat: staff check-in simplified flow - direct to COMPLETED"
git push origin feature/map-leaflet

# 5. Open PR to dev branch
```

---

## 📞 Contact & Support

Nếu cần support backend implementation, cung cấp:

- File này (STAFF-CHECKIN-SIMPLIFIED-FLOW.md)
- Backend logic example (section 🔧)
- Test cases (section 🧪)
