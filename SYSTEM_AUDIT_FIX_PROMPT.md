# Zino One Platform — Comprehensive System Audit & Remediation Prompt

Use this prompt to systematically fix the remaining architectural, data-consistency, security, UX, and maintainability issues identified across the Zino One Unified Platform (`Next.js 14 App Router`).

---

## Instructions for the AI Agent

Audit and remediate the issues listed below in priority order. Do **not** introduce placeholder/mock data where real store or database records exist, and verify every phase with `npx tsc --noEmit`.

---

### Priority 1: Eliminate Remaining Hardcoded Mock Data & Unify All Views with Single Source of Truth

1. **Sync Apartment Room Boards with Live Catalog (`usePlatformStore`)**
   - **Files:** `app/(admin)/admin/page.tsx` (Real-Time Room Board) and `app/staff/dashboard/page.tsx` (`APARTMENT_ROOMS`).
   - **Issue:** Both dashboards render a hardcoded 4-room array (`suite_101`–`suite_301`) instead of reading the live `ServiceSlug.APARTMENTS` items from `usePlatformStore()`.
   - **Fix:** Derive the Room Board cards directly from `products.filter((p) => p.source === ServiceSlug.APARTMENTS)` and persist room status (`AVAILABLE` | `OCCUPIED` | `CLEANING`) in `usePlatformStore()` so Admin, Staff, and Public `/apartments` stay 100% synchronized.

2. **Compute Visitor Analytics Charts Dynamically**
   - **File:** `app/(admin)/admin/visitors/page.tsx`
   - **Issue:** `weeklyVisitorData` is hardcoded to `0` across static dates (`12 Nov - 18 Nov`).
   - **Fix:** Aggregate real `visitors` from `usePlatformStore()` grouped by `visitDate` over the last 7 days so the chart updates immediately when new visitors check in via `/visit`, Staff, or Admin.

3. **Generate Dynamic Alerts & Notifications**
   - **Files:** `app/(admin)/admin/page.tsx` and `app/staff/dashboard/page.tsx`
   - **Issue:** Attention alerts and staff notifications use static seed entries that do not update when stock is restocked, dues are settled, or visitors check out.
   - **Fix:** Dynamically compute notifications from live `products` (`totalStock <= lowStockAt`), unsettled `paymentDues`, and `visitors` currently `CHECKED_IN`.

---

### Priority 2: Standardize Currency Input Units (Naira vs. Kobo)

- **File:** `app/(admin)/admin/products/page.tsx` (lines 212–238)
- **Issue:** The product editor modal asks users to enter **Selling Price (₦ kobo)** and **Cost Price (₦ kobo)** (requiring `2,500,000` for ₦25,000), while `app/(admin)/admin/page.tsx`, `app/staff/dashboard/page.tsx`, and all other modules accept **Naira (₦)** directly.
- **Fix:** Change the inputs in `app/(admin)/admin/products/page.tsx` to accept **Naira (₦)** via `<NumberInput prefix="₦" />` and convert cleanly (`Math.round(naira * 100)`) when saving `priceKobo` and `costKobo`. Update all remaining unformatted numeric placeholders (e.g. `"e.g. 1000000"`) to comma-formatted examples (`"e.g. 1,000,000"`).

---

### Priority 3: Backend Persistence & Error Transparency

1. **Replace Silent Empty `catch {}` Blocks (21 occurrences)**
   - **Issue:** API calls across `app/(site)/visit/page.tsx`, `app/(admin)/admin/visitors/page.tsx`, and dashboard modules silently swallow errors in empty `catch {}` blocks.
   - **Fix:** Log structured error context and surface a subtle non-blocking "Offline / Local Sync Mode" badge or toast when backend API routes are unavailable, while continuing to fall back cleanly to `usePlatformStore`.

2. **Bridge `localStorage` Store with Prisma API Routes**
   - **File:** `lib/platform-store.ts`
   - **Issue:** Changes to products, invoices, visitors, targets, and payment dues are persisted only in browser `localStorage` across 7 files, so data does not sync across different devices or browsers.
   - **Fix:** Wire `saveProduct`, `deleteProduct`, `recordVisitorCheckIn`, `checkoutVisitor`, and `recordPlatformTransaction` to optimistically update local state while syncing with `/api/*` Prisma endpoints when authenticated.

---

### Priority 4: Authentication & Security Hardening

- **Files:** `app/staff/dashboard/page.tsx`, `app/staff/login/page.tsx`, `middleware.ts`
- **Issue:** Staff session cookies (`zino-staff-session`) are written/cleared via client-side `document.cookie` rather than server-issued `HttpOnly` cookies.
- **Fix:** Route staff login/logout through dedicated `/api/auth/staff/login` and `/api/auth/staff/logout` endpoints that issue signed `HttpOnly`, `SameSite=Lax` session cookies validated by `middleware.ts`.

---

### Priority 5: Code Architecture, Accessibility & Media Resilience

1. **Decompose Monolithic Dashboard Pages**
   - **Files:** `app/(admin)/admin/page.tsx` (~2,780 lines) and `app/staff/dashboard/page.tsx` (~1,830 lines).
   - **Fix:** Extract reusable subcomponents (`components/dashboard/UnifiedSectionsGrid.tsx`, `components/dashboard/ProductStudioModal.tsx`, `components/dashboard/RoomBoard.tsx`, `components/dashboard/VisitorLogTable.tsx`) so Admin and Staff share identical UI and logic with zero drift.

2. **Modal Keyboard Accessibility**
   - **Fix:** Add `Escape`-key dismissal, `role="dialog"`, `aria-modal="true"`, and initial focus management to all custom modals across `/admin` and `/staff`.

3. **Graceful Image Fallbacks (31 raw `<img>` tags)**
   - **Fix:** Add `onError` fallback handling (or a shared `<SafeImage />` wrapper using `next/image`) so broken external Unsplash URLs or missing uploads render a clean neutral placeholder instead of a broken image icon.

---

### Verification Checklist
- [ ] Run `npx tsc --noEmit` — 0 TypeScript errors.
- [ ] Run `npm run build` — clean production build with 0 errors.
- [ ] Verify typing `100000` in any numeric field formats live as `100,000`.
- [ ] Verify adding/editing/deleting a product updates Admin, Staff, and Public storefronts simultaneously.
- [ ] Verify checking in a visitor on `/visit` immediately updates the Visitor Management table and 7-day chart in both Admin and Staff dashboards.
