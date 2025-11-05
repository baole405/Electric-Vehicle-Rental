# 🔧 Frontend PayOS Integration - READY

## ✅ Frontend Implementation Complete

### **Created Pages:**

1. **`/payos/return`** - Success page with polling logic
2. **`/payos/cancel`** - Cancel page

### **Routes Added:**

```typescript
<Route path="/payos/return" element={<PayOSReturnPage />} />
<Route path="/payos/cancel" element={<PayOSCancelPage />} />
```

---

## 🎯 Backend Action Required

### **Update PayOS ReturnURL & CancelURL:**

**File:** `payos.controller.js` (Line 75-76)

**BEFORE:**

```javascript
returnUrl: `${process.env.FRONTEND_URL}/payos/return?b=${booking._id}`,
cancelUrl: `${process.env.FRONTEND_URL}/payos/cancel?b=${booking._id}`,
```

**AFTER (Update FRONTEND_URL):**

```javascript
// Development
returnUrl: `http://localhost:4200/payos/return?b=${booking._id}`,
cancelUrl: `http://localhost:4200/payos/cancel?b=${booking._id}`,

// Production (update when deploy)
returnUrl: `https://your-domain.com/payos/return?b=${booking._id}`,
cancelUrl: `https://your-domain.com/payos/cancel?b=${booking._id}`,
```

---

## 🔄 Payment Flow (Final)

### **Success Flow:**

```
1. User clicks "Thanh toán ngay"
   → Redirect to PayOS page

2. User scans QR & pays
   → PayOS webhook → Backend updates booking status to PAID

3. PayOS redirects user to:
   /payos/return?b={bookingId}&code=00&status=PAID&cancel=false&...

4. Frontend polls booking status every 2s (max 20 attempts = 40s)
   → Check if booking.status === 'PAID'

5. When PAID detected:
   → Show success message
   → Redirect to /profile?tab=bookings
```

### **Cancel Flow:**

```
1. User clicks cancel on PayOS page

2. PayOS redirects to:
   /payos/cancel?b={bookingId}&code=00&status=CANCELLED&cancel=true&...

3. Frontend shows cancel message

4. Redirect to /profile?tab=bookings after 3s
```

---

## 🐛 Important Notes

### **Why Polling?**

- PayOS webhook có delay 1-5 giây
- Frontend không dựa vào URL params để update status
- Polling đảm bảo backend đã xác minh thanh toán qua webhook

### **Why NOT Trust URL Params?**

❌ **WRONG:**

```typescript
if (searchParams.get('status') === 'PAID') {
  showSuccess(); // User có thể fake URL!
}
```

✅ **CORRECT:**

```typescript
// Poll backend to verify webhook processed
const booking = await fetchBooking(bookingId);
if (booking.status === 'PAID') {
  showSuccess(); // Backend verified via webhook
}
```

---

## ✅ Backend Checklist

- [ ] Update `returnUrl` to point to `/payos/return`
- [ ] Update `cancelUrl` to point to `/payos/cancel`
- [ ] Ensure webhook handler updates booking status correctly
- [ ] Test full flow: Create booking → Pay → Verify webhook → Check status

---

## 🧪 Test Instructions

### **Test Success Payment:**

1. Create a booking (status: WAITING_PAYMENT)
2. Click "Thanh toán ngay"
3. Scan QR and pay on PayOS
4. Wait for redirect to `/payos/return`
5. **Expected:**
   - See "Đang xử lý thanh toán..."
   - Polling starts (attempt 1/20, 2/20, ...)
   - When webhook processed: "Thanh toán thành công! 🎉"
   - Redirect to bookings list
   - Booking status = PAID

### **Test Cancel Payment:**

1. Create a booking
2. Click "Thanh toán ngay"
3. Click "Hủy" on PayOS page
4. **Expected:**
   - Redirect to `/payos/cancel`
   - See "Thanh toán đã bị hủy"
   - Redirect to bookings after 3s

---

## 🔍 Debugging

### **Check Console Logs:**

```
[PayOS Return] Params: { bookingId, code, status, ... }
[PayOS Poll] Attempt 1/20
[PayOS Poll] Booking status: WAITING_PAYMENT
[PayOS Poll] Attempt 2/20
[PayOS Poll] Booking status: PAID ✅
```

### **If Timeout After 40s:**

- Check backend webhook logs
- Verify PayOS webhook URL is correct
- Check database: booking status still WAITING_PAYMENT?

---

## 📞 Contact

If any issues, check:

1. Backend logs for webhook errors
2. PayOS dashboard for webhook status
3. Frontend console for polling logs
