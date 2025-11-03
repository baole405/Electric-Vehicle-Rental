# Electric Vehicle Rental Frontend – API & User Flow Guide

## Runtime API Configuration
- The frontend reads the REST base URL from `VITE_API_URL` in the root `.env` (`.env:4`).
- All requests go through the shared Axios client `apiRequest`, which applies the base URL, cleans query params, and attaches a persisted bearer token when present (`apps/fe-web-app/src/lib/http.ts:21`).
- Concrete path segments for each domain are centralised in `API_SUFFIX` (`apps/fe-web-app/src/apis/util.api.tsx:1`), so every API module composes `baseURL + suffix`.

## API Modules and Endpoints
| Domain | Client file | Methods and endpoints | Primary screens/hooks |
| --- | --- | --- | --- |
| Authentication | `src/apis/auth.api.tsx` | `POST /api/auth/login`, `POST /api/auth/register` | `LoginPage`, `RegisterPage`, `AuthContext` |
| Users | `src/apis/user.api.tsx` | `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`, `PUT /api/users/:id/change-password` | Auth hydration, profile settings, admin dashboard |
| User documents | `src/apis/user-document.api.tsx` | `GET /api/user-documents`, `GET /api/user-documents?userId=`, `POST /api/user-documents` (multipart), `PUT /api/user-documents/:id`, `DELETE /api/user-documents/:id` | Profile document tab, admin KYC review |
| Stations | `src/apis/station.api.tsx` | `GET /api/stations`, `GET /api/stations/:id`, `POST /api/stations`, `PUT /api/stations/:id`, `DELETE /api/stations/:id` | Home filters, admin station management |
| Brands | `src/apis/brand.api.tsx` | `GET /api/brands`, `GET /api/brands/by-station?stationId=`, `GET /api/brands/:id`, `POST /api/brands`, `PUT /api/brands/:id`, `DELETE /api/brands/:id` | Home listing, brand detail page, admin brand management |
| Vehicles | `src/apis/vehicle.api.tsx` | `GET /api/vehicles`, `GET /api/vehicles?brandCode=&stationCode=`, `GET /api/vehicles/:id`, `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` | Vehicle list/detail, booking flow, admin vehicle management |
| Bookings | `src/apis/booking.api.tsx` | `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/:id`, `PUT /api/bookings/:id`, `DELETE /api/bookings/:id`, `PUT /api/bookings/:id/cancel`, `POST /api/bookings/:id/assign-vehicle`, `PATCH /api/bookings/:id/status`, `POST /api/bookings/:id/confirm` | Booking form, profile booking tab, admin booking workflows |
| Rentals | `src/apis/rental.api.tsx` | `GET /api/rentals`, `GET /api/rentals/:id`, `POST /api/rentals`, `PUT /api/rentals/:id`, `DELETE /api/rentals/:id` | Admin rental operations, handover flow |
| Handovers | `src/apis/handover.api.tsx` | `GET /api/handovers`, `GET /api/handovers?rentalId=`, `POST /api/handovers` (multipart with photos) | Admin/staff handover logging |
| Payments | `src/apis/payment.api.tsx` | `GET /api/payments`, `GET /api/payments/:id`, `POST /api/payments`, `PUT /api/payments/:id`, `DELETE /api/payments/:id` | Profile payments tab, admin finance view |

All API modules are wrapped in `@tanstack/react-query` hooks (see `apps/fe-web-app/src/hooks`) that provide caching, mutations, and cache invalidation for the relevant domain.

## User-Facing Workflows
### 1. Guest browsing and discovery
- Landing on `/` renders `BrandsByStationPage`, which loads stations (`useStationList` → `GET /api/stations`) and, once a station is picked, loads available brands for that station (`useBrandsByStation` → `GET /api/brands/by-station?stationId=`).
- Station and date pickers stay client-side for now; the search action will later feed into vehicle availability queries.

### 2. Brand and vehicle exploration
- `ListBrandPage` shows all brands via `GET /api/brands`, while `BrandDetailPage` filters the vehicle inventory returned from `GET /api/vehicles` to surface cars of the selected brand at the active station.
- Selecting a specific vehicle navigates to `/vehicles/:id`, where `VehicleDetailPage` fetches `GET /api/vehicles/:id` to display status, battery, odometer, and station.

### 3. Booking creation
- From a brand or vehicle card, the user moves to `/booking` (`CreateBookingPage`). The form defaults to the logged-in profile info and validates with `CreateBookingFormSchema`.
- On submit, the form is transformed into the backend format (`convertFormToBookingAPI`) and posted through `BookingApi.createBooking` (`POST /api/bookings`).
- Successful bookings expose a confirmation modal and prompt the renter to monitor status in their profile.

### 4. Authentication and session hydration
- `LoginPage` and `RegisterPage` call `POST /api/auth/login` and `POST /api/auth/register` respectively; responses deliver a JWT plus user object.
- `AuthContext` persists `{ userId, token, role }` in `localStorage` and rehydrates by calling `GET /api/users/:id` on app start, injecting the bearer token into subsequent calls.
- Role-aware routes (see `ProtectedRoute`) gate `/dashboard` to `admin` and `staff`, and `/profile` to any authenticated role.

### 5. Profile management for renters
- `ProfilePage` presents tabs:
  - **Overview** targets cached user data from `AuthContext`.
  - **Bookings** uses `useBookingList` (`GET /api/bookings`) and allows cancellation via `PUT /api/bookings/:id/cancel`.
  - **Payments** lists transactions from `GET /api/payments`.
  - **Documents** loads KYC submissions (`GET /api/user-documents?userId=`) and uploads new records with multipart `POST /api/user-documents`.
  - **Settings** relies on user update endpoints (`PUT /api/users/:id`, `PUT /api/users/:id/change-password`).
- Logging out clears the stored token and context state.

### 6. Staff and admin operations
- `/dashboard` renders `AdminDashboard`, which orchestrates many hooks:
  - Booking oversight (`GET /api/bookings`, `POST /api/bookings/:id/assign-vehicle`, `PATCH /api/bookings/:id/status`, etc.).
  - Rental lifecycle management (`GET/POST/PUT /api/rentals`) tied to handovers (`GET /api/handovers`, `POST /api/handovers` with photos).
  - Fleet maintenance through vehicle endpoints.
  - Station and brand CRUD for network coverage.
  - Payment reconciliation with the payments API.
  - User and document reviews to verify renters.
- `AdminBrandManagement` and related dialogs wrap brand CRUD, while staff users are routed to the lighter `StaffBrandView`.

### 7. Handover and rental workflow
- After a booking is confirmed, staff can create rentals (`POST /api/rentals`) and capture pickup/return events by uploading photos with `POST /api/handovers`.
- Each handover invalidates cached rental queries, ensuring the dashboard and profile views reflect the latest odometer, battery, and status data.

## Supporting Infrastructure
- React Query centralises caching and invalidation patterns (`apps/fe-web-app/src/hooks`), so any mutation automatically refreshes affected lists/detail views.
- Error handling is centralised in `handleApiError`, invoked from the Axios response interceptor to surface toast notifications on failures.

This document should give new contributors a quick map from each screen to the backend endpoints it consumes, along with the supporting hooks that keep client state in sync.
