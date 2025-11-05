# 🚨 URGENT: Backend Config Check for Production PayOS

## Issue Summary

**Problem**: PayOS payment succeeds but production frontend crashes with Server Components error

**URL**: User on PayOS page (`pay.payos.vn`) but redirect fails → Shows error page

---

## ✅ Frontend Fixes Applied

1. ✅ Added `'use client'` directive to `/payos/return.tsx`
2. ✅ Added `'use client'` directive to `/payos/cancel.tsx`
3. ✅ Added `useRef` to prevent double execution
4. ✅ Ready for production deployment

---

## ⚠️ BACKEND ACTION REQUIRED

### 1. Check Production `FRONTEND_URL`

**Current production backend**: `https://electric-rental-p4ohi.ondigitalocean.app`

**Question**: What is `process.env.FRONTEND_URL` in production Doppler config?

Run this command in backend project:

```bash
doppler run -- node -e "console.log('FRONTEND_URL:', process.env.FRONTEND_URL)"
```

**Expected answer**:

```
FRONTEND_URL: https://electric-vehicle-rental.pages.dev
```

**If different → THIS IS THE PROBLEM!**

---

### 2. Verify PayOS Controller Code

**File**: `src/controllers/payos.controller.js`

Check the `checkout` function (around line 60-80):

```javascript
const paymentData = {
  orderCode: orderCode,
  amount: totalAmount,
  description: `Thanh toan booking ${booking.bookingCode}`,

  // ⚠️ CRITICAL: Check these URLs
  returnUrl: `${process.env.FRONTEND_URL}/payos/return?b=${booking._id}`,
  cancelUrl: `${process.env.FRONTEND_URL}/payos/cancel?b=${booking._id}`,

  // ...
};
```

**Question**: Are `returnUrl` and `cancelUrl` using `process.env.FRONTEND_URL`?

---

### 3. Push Latest Code to GitHub

If you made any changes to PayOS controller, please push to GitHub:

```bash
git add .
git commit -m "fix(payos): Update return URLs for production"
git push origin feat/implement-realpayos
```

**Files frontend needs to verify**:

- `src/controllers/payos.controller.js`
- `src/routes/payos.routes.js`
- `.env.example` (template)

---

## 🧪 Test Request

After confirming config, please test checkout API manually:

### Step 1: Create a test booking in production

### Step 2: Call checkout API

```bash
curl -X POST https://electric-rental-p4ohi.ondigitalocean.app/api/payos/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"bookingId": "YOUR_BOOKING_ID"}'
```

### Step 3: Check response

```json
{
  "success": true,
  "data": {
    "orderCode": "368371868",
    "checkoutData": {
      "checkoutUrl": "https://pay.payos.vn/web/..."
      // ...
    }
  }
}
```

### Step 4: Extract returnUrl from PayOS dashboard

1. Login to PayOS dashboard
2. Find the payment link
3. Check what returnUrl was registered
4. **Should be**: `https://electric-vehicle-rental.pages.dev/payos/return?b=...`

---

## 📋 Checklist

### Backend Team:

- [ ] Confirm `FRONTEND_URL` in production Doppler config
- [ ] Verify it equals: `https://electric-vehicle-rental.pages.dev`
- [ ] Check `payos.controller.js` uses `process.env.FRONTEND_URL`
- [ ] Push latest code to GitHub (if changed)
- [ ] Share Doppler output: `echo $FRONTEND_URL`
- [ ] Test checkout API and share response

### Frontend Team:

- [x] Added `'use client'` to PayOS pages
- [x] Added double-execution protection
- [x] Documented fix
- [ ] Waiting for backend confirmation
- [ ] Ready to deploy after backend confirms

---

## 🔴 Why This Is Critical

**Current situation**:

1. User approves booking ✅
2. Clicks "Thanh toán ngay" ✅
3. Redirects to PayOS ✅
4. Completes payment ✅
5. **PayOS redirects to wrong URL** ❌
6. **Page crashes with SSR error** ❌
7. **Money deducted but booking not updated** ❌

**Impact**:

- Users lose trust
- Money transferred but no confirmation
- Manual refunds required
- Bad user experience

---

## 💬 Response Template

Please reply with:

```
✅ Checked production FRONTEND_URL
Value: [PASTE VALUE HERE]

✅ Verified payos.controller.js uses FRONTEND_URL
Line 75: returnUrl: `${process.env.FRONTEND_URL}/payos/return?b=${booking._id}`

✅ Code pushed to GitHub
Commit: [COMMIT HASH]

✅ Test checkout response:
[PASTE CHECKOUT API RESPONSE]
```

---

**Priority**: 🔴 CRITICAL  
**Impact**: Production users affected  
**Action**: Backend config verification needed ASAP  
**ETA**: Please respond within 30 minutes
