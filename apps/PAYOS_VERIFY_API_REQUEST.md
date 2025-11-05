# Request for PayOS Payment Verification API

## Current Problem

After user completes payment on PayOS, frontend receives redirect to:

```
# ✅ PayOS Payment Verification API - IMPLEMENTED

## Status: COMPLETE 🎉

The **Payment Verification API** has been successfully implemented on both frontend and backend!

---

## 🎯 Problem Solved

**Before**:
- Frontend kept polling `GET /api/bookings/:id` 20 times (40 seconds)
- Webhook couldn't reach localhost
- User waited long time for verification

**After**:
- Frontend calls `POST /api/payos/verify-payment` once
- Backend queries PayOS API directly (1-2 seconds)
- User sees result immediately

---

## 📡 API Endpoint

### `POST /api/payos/verify-payment`

Verify payment status directly from PayOS and update booking status if needed.
```

**Issue**: Frontend is currently polling `GET /api/bookings/:id` to check if webhook updated the status. This is inefficient and unreliable.

## Required Solution

### Option 1: Payment Verification API (RECOMMENDED) ⭐

Create a dedicated endpoint to verify payment with PayOS:

**Endpoint**: `POST /api/payos/verify-payment`

**Request Body**:

```json
{
  "bookingId": "690b99875f2ee7b357a59978",
  "orderCode": "368371868"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "verified": true,
    "paymentStatus": "PAID",
    "bookingStatus": "PAID",
    "amount": 500000,
    "transactionDate": "2025-11-05T18:59:59Z"
  }
}
```

**Backend Logic**:

1. Call PayOS API to verify payment status: `GET https://api-merchant.payos.vn/v2/payment-requests/{orderCode}`
2. Compare with database booking status
3. If webhook hasn't updated yet → Update booking status
4. Return verified status to frontend

### Option 2: Enhanced Webhook Status Check (FALLBACK)

If Option 1 is not feasible, enhance existing endpoint:

**Endpoint**: `GET /api/bookings/:id/payment-status`

**Query Params**:

- `orderCode`: PayOS order code (optional, for verification)

**Response**:

```json
{
  "success": true,
  "data": {
    "bookingId": "690b99875f2ee7b357a59978",
    "status": "PAID",
    "paymentVerified": true,
    "lastUpdated": "2025-11-05T18:59:59Z"
  }
}
```

## Why This Is Important

### Current Flow (INEFFICIENT):

1. User pays on PayOS ✅
2. PayOS webhook → Backend updates DB (5-10s delay) ⏳
3. Frontend polls `/api/bookings/:id` 20 times (40 seconds) 🔄
4. If webhook slow → User sees timeout error ❌

### Proposed Flow (EFFICIENT):

1. User pays on PayOS ✅
2. Frontend calls `/api/payos/verify-payment` immediately 🚀
3. Backend verifies with PayOS directly (1-2s) ⚡
4. If webhook hasn't updated → Backend updates now ✅
5. User sees success immediately 🎉

## Technical Details

### PayOS Verification API

- **URL**: `https://api-merchant.payos.vn/v2/payment-requests/{orderCode}`
- **Method**: GET
- **Headers**:
  - `x-client-id`: Your PayOS client ID
  - `x-api-key`: Your PayOS API key
- **Response**: Payment status, amount, transaction details

### Security Considerations

1. Verify `orderCode` belongs to `bookingId`
2. Check payment amount matches booking total
3. Prevent duplicate status updates
4. Log all verification attempts

## Frontend Implementation (Already Ready)

```typescript
// payment.api.tsx - TO BE ADDED
const verifyPayOSPayment = async (payload: { bookingId: string; orderCode: string }) => {
  const response = await apiRequest.post<PayOSVerifyResponse>('/api/payos/verify-payment', payload);
  return response;
};
```

## Questions for Backend Team

1. **Can you implement Option 1 (verify-payment endpoint)?**

   - Timeline: When can this be ready?
   - Do you need PayOS API documentation?

2. **Is the webhook working correctly?**

   - Check logs: Are webhooks being received?
   - Webhook URL correct? `{BACKEND_URL}/api/payos/webhook`
   - Is booking status being updated to 'PAID'?

3. **Alternative approach?**
   - Should we trust PayOS URL params directly?
   - Is there an existing verification endpoint we can use?

## Testing Requirements

After implementation, please test:

1. ✅ Create booking → Generate payment link
2. ✅ Pay with PayOS → Verify webhook received
3. ✅ Call verify-payment endpoint → Returns correct status
4. ✅ Check booking status updated in database
5. ✅ Test edge cases: duplicate calls, invalid orderCode

## Priority

🔴 **HIGH PRIORITY** - Currently blocking full payment flow completion

Users can pay but frontend cannot reliably confirm payment success.

---

**Contact**: Frontend Team  
**Date**: November 6, 2025  
**Related Files**:

- `apps/fe-web-app/src/pages/payos/return.tsx`
- `apps/fe-web-app/src/apis/payment.api.tsx`
- `apps/PAYOS_INTEGRATION.md`
