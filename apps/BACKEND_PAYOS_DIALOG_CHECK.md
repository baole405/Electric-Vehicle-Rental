# 📨 Message for Backend Team - PayOS Dialog Implementation

---

## 🔄 **TL;DR: Frontend đã chuyển sang PayOS Embedded Dialog**

Frontend đã implement **PayOS Embedded Dialog** (popup) thay vì redirect flow cũ.

**Impact:** Backend cần check xem có hardcode `returnURL`/`cancelURL` trong PayOS create payment không.

---

## ✅ **Frontend Changes Summary**

### **Old Flow (Redirect):**

```
User click "Thanh toán"
  → Redirect to pay.payos.vn
  → Return to /payos/return?b={bookingId}
  → Poll booking status
```

### **New Flow (Embedded Dialog):**

```
User click "Thanh toán"
  → PayOS Dialog hiển thị on page (with QR code)
  → User scan QR → Pay
  → Dialog onSuccess callback
  → Refetch booking list
  → Status update real-time
```

**Key Difference:**

- ❌ **NO REDIRECT** - Stay on `/profile?tab=bookings`
- ❌ **NO NEED** for `/payos/return` or `/payos/cancel` pages
- ✅ Dialog handles everything with callbacks

---

## 🎯 **Frontend Implementation Details**

### **Package Installed:**

```bash
npm install payos-checkout --save
```

### **Dialog Config:**

```typescript
// Frontend sets returnURL to stay on page
setPayosConfig({
  RETURN_URL: window.location.origin + '/profile?tab=bookings',
  ELEMENT_ID: 'payos-checkout',
  CHECKOUT_URL: checkoutUrl, // From backend API
  embedded: true,
  onSuccess: (event) => {
    toast.success('Thanh toán thành công!');
    bookingsQuery.refetch(); // Real-time status update
    exit();
  },
  onCancel: (event) => {
    toast.warning('Bạn đã hủy thanh toán');
    exit();
  },
  onExit: () => setPayosConfig(null),
});
```

---

## ⚠️ **Backend Action Required**

### **❓ Question 1: Does Backend Hardcode returnURL?**

**Check if backend code has this:**

```javascript
// ❌ If backend hardcodes returnURL like this:
const paymentLinkData = {
  returnUrl: `${process.env.FRONTEND_URL}/payos/return?b=${bookingId}`,
  cancelUrl: `${process.env.FRONTEND_URL}/payos/cancel?b=${bookingId}`,
};
```

**Search command:**

```bash
# Search in backend codebase
grep -r "returnUrl\|return_url" backend/
grep -r "cancelUrl\|cancel_url" backend/
```

---

### **✅ Solution Option 1: Let Frontend Control returnURL (RECOMMENDED)**

Backend **ONLY creates checkoutUrl**, does NOT hardcode returnURL:

```javascript
// ✅ Backend code (recommended)
const paymentLink = await payos.createPaymentLink({
  orderCode,
  amount,
  description,
  // ❌ DO NOT hardcode returnUrl/cancelUrl here
});

return {
  checkoutUrl: paymentLink.checkoutUrl,
  qrCode: paymentLink.qrCode,
  // ... other data
};
```

**Why?**

- Frontend can control where to "return" (stay on page for dialog)
- More flexible for different UI flows

---

### **✅ Solution Option 2: Accept returnURL from Frontend**

Backend accepts optional `returnUrl`/`cancelUrl` from frontend request:

```javascript
// ✅ Backend API endpoint
POST /api/payos/checkout
Body: {
  bookingId: string,
  returnUrl?: string,  // ✅ Optional, frontend sends
  cancelUrl?: string
}

// ✅ Backend logic
const paymentLinkData = {
  returnUrl: req.body.returnUrl || `${FRONTEND_URL}/payos/return?b=${bookingId}`,
  cancelUrl: req.body.cancelUrl || `${FRONTEND_URL}/payos/cancel?b=${bookingId}`,
  // Use frontend URL if provided, otherwise fallback to default
};
```

**Frontend will send:**

```typescript
await createPayOSCheckout.mutateAsync({
  bookingId,
  returnUrl: window.location.origin + '/profile?tab=bookings',
  cancelUrl: window.location.origin + '/profile?tab=bookings',
});
```

---

## 🧪 **Testing Checklist**

### **Backend Team:**

1. ✅ Check if returnURL/cancelURL is hardcoded
2. ✅ Choose Solution 1 or 2 and implement
3. ✅ Test that webhook still works properly
4. ✅ Confirm with Frontend team

### **Frontend Team (Already Done):**

1. ✅ Install `payos-checkout` package
2. ✅ Implement `usePayOS` dialog
3. ✅ Setup `onSuccess` callback with refetch
4. ✅ Remove `/payos/return` and `/payos/cancel` pages

### **Integration Test:**

```
1. User clicks "Thanh toán ngay" in /profile?tab=bookings
2. Dialog opens with QR code
3. User scans QR and pays
4. PayOS webhook → Backend updates booking.status = "PAID"
5. Dialog onSuccess → Frontend refetch booking list
6. Status updates to "PAID" without redirect
```

---

## 📋 **Backend Webhook Flow (No Changes Needed)**

```
User pays on PayOS
  → PayOS calls webhook: POST /api/payos/webhook
  → Backend validates signature
  → Backend updates booking.status = "PAID"
  → Backend creates Payment document
  → Backend creates Rental document
  → Frontend refetch → Gets updated status
```

**✅ Webhook flow remains the same!** No changes needed.

---

## 🔍 **Expected Behavior After Fix**

### **With Embedded Dialog:**

- User clicks "Thanh toán ngay"
- Dialog appears on current page
- User pays → Dialog shows success
- Page does NOT redirect
- Booking list auto-refreshes
- Status shows "PAID"

### **Without Redirect:**

- No `/payos/return` page navigation
- No loading spinner on separate page
- Better UX - stays on bookings page

---

## 📞 **Contact**

**Frontend Status:** ✅ Implementation Complete  
**Backend Action:** ⚠️ Need to check returnURL config

**Questions?**

- Check this document
- Test with frontend team
- Verify webhook logs

---

**Priority:** Medium  
**Estimated Backend Work:** 15-30 mins (if returnURL is hardcoded)  
**Impact:** UX improvement, no breaking changes to webhook

---

Frontend Team  
November 5, 2025
