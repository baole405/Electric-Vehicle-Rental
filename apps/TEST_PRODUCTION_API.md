# Test Production PayOS API

## Problem

- Using production backend: `https://electric-rental-p4ohi.ondigitalocean.app`
- PayOS payment succeeds
- But `/payos/return` page crashes with SSR error

## Debug Steps

### 1. Check CORS

Open browser console and try:

```javascript
fetch('https://electric-rental-p4ohi.ondigitalocean.app/api/bookings')
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected**: Should return bookings data
**If blocked**: CORS error → Need to add `localhost:4200` to backend CORS whitelist

---

### 2. Check PayOS Verify API

```javascript
fetch('https://electric-rental-p4ohi.ondigitalocean.app/api/payos/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 'YOUR_BOOKING_ID',
    orderCode: 'YOUR_ORDER_CODE',
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

---

### 3. Check Backend Return URL Config

**Question for Backend Team**:

What is `FRONTEND_URL` in production `.env`?

**Options**:

- ❌ If `http://localhost:4200` → Won't work in production
- ✅ Should be `https://your-production-domain.com`

**PayOS Return URL Format**:

```
{FRONTEND_URL}/payos/return?b={bookingId}&orderCode={orderCode}
```

---

### 4. Check Production Frontend Deployment

Is frontend deployed to production?

- ✅ If yes → What's the URL?
- ❌ If no → PayOS will redirect to localhost (won't work)

---

## Possible Solutions

### Option 1: Test with Local Backend (RECOMMENDED for dev)

```bash
# In .env
VITE_API_URL="http://localhost:5000"
```

### Option 2: Fix Production CORS

Add to backend production config:

```javascript
cors({
  origin: ['http://localhost:4200', 'https://production-frontend.com'],
  credentials: true,
});
```

### Option 3: Use ngrok for Local Testing

```bash
ngrok http 4200
# Use ngrok URL as FRONTEND_URL in backend
```

---

## Expected Flow (Production)

```
Production Frontend (deployed)
  ↓
Production Backend API
  ↓
PayOS Payment
  ↓
Redirect to Production Frontend /payos/return
  ↓
Call verify API on Production Backend
  ↓
Success ✅
```

---

## Questions to Answer

1. **Is frontend deployed to production?** (URL?)
2. **What is backend `FRONTEND_URL` in production?**
3. **Does production backend allow localhost CORS?**
4. **What error appears in production browser console?**

---

## Quick Test

If you just want to test payment flow:

1. **Use local backend**:

   ```bash
   # .env
   VITE_API_URL="http://localhost:5000"
   ```

2. **Ensure local backend has**:

   ```bash
   FRONTEND_URL="http://localhost:4200"
   PAYOS_API_KEY="..."
   PAYOS_CHECKSUM_KEY="..."
   PAYOS_CLIENT_ID="..."
   ```

3. **Test flow**:
   - Create booking
   - Pay on PayOS
   - Should redirect to `localhost:4200/payos/return`
   - Verify API works ✅
