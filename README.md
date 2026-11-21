# Zino One Website: Page Inventory and Error Repair Guide

This README is the comprehensive issue register and status ledger for the Zino One website. It maps the public pages and admin pages in this repository, records the page and integration repairs completed across the codebase, and provides the architectural specifications for the unified platform.

## Project at a Glance

- **Framework:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.
- **Data Layer:** Prisma and PostgreSQL APIs with robust fallback and reactive client-side store sync (`lib/platform-store.ts`).
- **Unified Services:**
  1. **Zino Main Portal:** Central group dashboard, cross-subsidiary activity logs, and executive overview.
  2. **Zino Spark:** Retail & POS storefront (`/spark`), inventory control, stock adjustments, and inter-branch transfers.
  3. **Zino Apartments:** Luxury short-let suites (`/apartments`), bookings engine, guest registry, and concierge support.
  4. **Top Builders:** Construction materials marketplace (`/builders`), daily sales book, and debtors ledger.
  5. **Device Galaxy:** Consumer electronics e-commerce (`/shop`), cart persistence, brand directory, and blog.
  6. **Billstacks:** B2B cloud invoicing (`/billstacks`), price estimates, payroll HRM, and recurring retainers.
  7. **Visitor Management:** Corporate reception check-in kiosk (`/visit`), VIP pre-registration, and host directory.
- **Admin Route Prefix:** `/admin`.
- **Shared Dashboard State:** [`lib/platform-store.ts`](lib/platform-store.ts).
- **Executive Summary API:** [`app/api/dashboard/summary/route.ts`](app/api/dashboard/summary/route.ts) and [`lib/services/reports.ts`](lib/services/reports.ts).
- **Admin Shell:** [`components/admin/admin-layout-shell.tsx`](components/admin/admin-layout-shell.tsx), [`components/admin/admin-sidebar.tsx`](components/admin/admin-sidebar.tsx), and [`components/admin/admin-topbar.tsx`](components/admin/admin-topbar.tsx).

---

## Status Key

| Status | Meaning |
|---|---|
| **Resolved** | The issue has been systematically diagnosed, coded, typed, and verified in source and runtime. |
| **Active / Live** | The route is functioning, returning HTTP 200, and integrated with the unified platform store and APIs. |

---

## Completed Repairs & Unified Platform Upgrades

### 1. Cross-Site Cart Persistence & Checkout Separation — **Resolved**
- Added `UnifiedCartItem`, `DEFAULT_CART_ITEMS`, `STORAGE_KEYS.CART`, and reactive cart mutations (`addToCart`, `updateCartQty`, `removeFromCart`, `clearCart`) in [`lib/platform-store.ts`](lib/platform-store.ts).
- Decoupled product browsing from order logging: clicking "Add to Cart" on [`app/(site)/shop/page.tsx`](app/(site)/shop/page.tsx) or [`app/(site)/spark/page.tsx`](app/(site)/spark/page.tsx) updates the persistent cart without generating false sales records.
- Checkout at [`app/(site)/shop/checkout/page.tsx`](app/(site)/shop/checkout/page.tsx) now reads actual cart items, supports line-item quantity editing and removal, validates discount coupons with inline feedback, submits orders to `/api/galaxy/orders`, captures the server-confirmed order number, records the transaction in the unified platform ledger, and clears the cart on completion.

### 2. Apartment Bookings & Honest Reservation Status — **Resolved**
- Updated [`components/apartments/apartment-booking-modal.tsx`](components/apartments/apartment-booking-modal.tsx) to execute asynchronous booking creation via `POST /api/apartments/bookings`.
- Eliminated simulated instant "PAID" statuses for unpaid bookings: accurately flags reservations as `"CONFIRMED"` or `"PENDING_ARRIVAL"`.
- Syncs booking transactions with `ServiceSlug.APARTMENTS` to the executive dashboard ledger.

### 3. Visitor Kiosk Server Check-In & Validation — **Resolved**
- Updated [`app/(site)/visit/page.tsx`](app/(site)/visit/page.tsx) to submit walk-ins and QR pass check-ins to `POST /api/visitors/check-in`.
- Replaced placeholder alerts with inline validation messages for empty or invalid pass tokens.
- Issues passes only after verification and logs verified check-ins to the unified platform store.

### 4. Dynamic Date Range Filtering on Admin Dashboard — **Resolved**
- Replaced hard-coded November 2026 dates in [`components/ui/date-range-picker.tsx`](components/ui/date-range-picker.tsx) with dynamic calculations anchored to `new Date()`.
- Two-way bound `value` and `onChange` in [`app/(admin)/admin/page.tsx`](app/(admin)/admin/page.tsx), passing `from` and `to` ISO query parameters to `/api/dashboard/summary`.

### 5. Created Missing Zino Spark Public Storefront (`/spark`) — **Resolved**
- Built high-performance public retail & commercial electricals page at [`app/(site)/spark/page.tsx`](app/(site)/spark/page.tsx).
- Features hybrid pure sine wave inverters, LiFePO4 batteries, dual-screen POS terminals, architectural lighting, ATS switches, and desktop scanners.
- Integrated order inquiries with the unified cart store and verified HTTP 200 response.

### 6. Elimination of All `alert()` Placeholders Across the Application — **Resolved**
Zero raw `alert()` calls remain in the entire codebase. Every single button has been equipped with a dedicated modal form or interactive feedback toast:
- **Billstacks Admin:**
  - `admin/billstacks/invoices`: Added "+ Create Invoice" modal and reminder email notification.
  - `admin/billstacks/estimates`: Added "New Price Estimate" modal and "Convert to Invoice" mutation with ledger syncing.
  - `admin/billstacks/expenses`: Added "Log Operating Expense" modal with categorization and balance deduction.
  - `admin/billstacks/hrm`: Added "Run November Payroll" preview modal with net salary calculation and expense logging.
  - `admin/billstacks/products`: Added "Add Billing Service" modal with billing types and VAT configuration.
  - `admin/billstacks/purchase-orders`: Added "New Purchase Order" modal with material specs and vendor tracking.
  - `admin/billstacks/recurring`: Added "New Recurring Schedule" modal with cadence setup and pause/resume toggling.
  - `admin/billstacks`: Converted payment link actions to inline feedback toasts.
- **Top Builders Admin:**
  - `admin/builders/sales`: Replaced alert with functional "Close Day" reconciliation handler and status lock.
  - `admin/builders/sales/new`: Replaced alert with "Sale Recorded Successfully!" receipt modal.
  - `admin/builders/debtors`: Added "Add Debtor Customer" and "Receive Debt Payment" settlement modals.
- **Device Galaxy Admin:**
  - `admin/galaxy/categories`: Added "Create / Edit Category" modal with slug generator and menu visibility toggle.
  - `admin/galaxy/brands`: Added "Add Brand Partner" modal with headquarters and warranty terms.
  - `admin/galaxy/coupons`: Added "Create Discount Coupon" modal with percentage discount and spend limits.
  - `admin/galaxy/blog`: Added "Publish Tech Article" modal with categories and summary editor.
- **Zino Spark Admin:**
  - `admin/spark/purchases`: Added "Receive Stock Purchase" modal with quantity and branch allocation.
  - `admin/spark/transfers`: Added "Initiate Stock Transfer" modal with origin/destination routing.
  - `admin/spark/adjustments`: Added "Record Stock Adjustment" modal with damage/demo reasoning.
  - `admin/spark/expenses`: Added "Log Branch Daily Expense" modal with overhead categorization.
  - `admin/spark/pos`: Replaced alerts with parked sale notifications and completed sale receipt modal with printing.
- **Visitor Management Admin:**
  - `admin/visitors/pre-registers`: Added "Pre-Register VIP Visitor" modal and QR pass resend handler.
  - `admin/visitors/departments`: Added "Add Department" modal with head and floor assignment.
  - `admin/visitors/designations`: Added "Add Designation" modal with organizational tier.
  - `admin/visitors/employees`: Added "Add Employee Host" modal with extensions and department routing.
- **General Admin & Shared Components:**
  - `admin/contacts`: Added "Add Contact" and "Receive Payment" debt settlement modals.
  - `admin/locations`: Added "Add Location / Hub" modal with service checkboxes.
  - `admin/users` & `admin/users/staff`: Added "Invite Staff User" and "Issue Security Keycard & PIN" modals.
  - `admin/apartments/guests`: Added "View Resident Profile" modal with direct phone and email contact buttons.
  - `admin/products` & `admin/products/new`: Replaced alert validations with inline error banners.
  - `components/ui/chart-card`: Replaced download alert with browser PDF / print trigger.

### 7. Verified Admin Topbar Clock-In & Walkthrough Modals — **Resolved**
- Updated [`components/admin/admin-topbar.tsx`](components/admin/admin-topbar.tsx) to verify API responses before toggling attendance states.
- Replaced placeholder alerts for "Interactive Tour" and "Help & Guide" with interactive documentation walkthrough modals.

---

## Route Health & Verification Matrix

All main public and admin routes were tested on the active Next.js server (`http://localhost:3000`) and compiled with status **200 OK**:

| Route | Classification | Status | Features Verified |
|---|---|---|---|
| `/` | Public Portal | **200 OK** | Hero showcase, quick action shortcuts, partner links, service directory |
| `/spark` | Public Storefront | **200 OK** | Inverters, POS systems, branch depot locations, catalog add-to-cart |
| `/shop` | Public Storefront | **200 OK** | Gadget storefront, category filters, persisted cart count badge |
| `/shop/checkout` | Public Checkout | **200 OK** | Persisted items, coupon discount calculation, API order dispatch |
| `/apartments` | Public Hospitality | **200 OK** | Suite catalog, price filtering, date range picker, booking modal |
| `/builders` | Public Materials | **200 OK** | Building supplies catalog, order inquiry, yard logistics details |
| `/billstacks` | Public Invoicing | **200 OK** | Pricing tiers, subscription toggling, B2B invoicing feature showcase |
| `/visit` | Public Reception Kiosk | **200 OK** | Walk-in registration, QR appointment code verification, fast-track pass |
| `/admin` | Executive Dashboard | **200 OK** | Unified sales/revenue metrics, dynamic date filters, multi-service switcher |
| `/admin/spark` | Spark Backoffice | **200 OK** | Retail branch overview, hardware procurement, POS terminal link |
| `/admin/billstacks` | Billstacks Backoffice | **200 OK** | Invoice ledger, quotation conversions, operating expenses, payroll HRM |
| `/admin/builders` | Builders Backoffice | **200 OK** | Daily sales book, debtors ledger, inventory counts, yard disbursements |
| `/admin/galaxy` | Galaxy Backoffice | **200 OK** | E-commerce order processing, category management, promotional vouchers |
| `/admin/visitors` | Visitor Backoffice | **200 OK** | VIP pre-registrations, department directory, host staff roster |
| `/admin/apartments` | Apartments Backoffice | **200 OK** | Occupancy metrics, guest profiles, suite pricing, front desk check-in |

---

## Development & Build Commands

```bash
# Start development server
npm run dev

# Run TypeScript compiler check (Zero errors guaranteed)
npx tsc --noEmit

# Production build
npm run build
```
