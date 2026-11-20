# Zino One — Unified Business Platform & Master Enhancement Prompt

## 1. Executive Summary & Problem Statement
The **Zino One Unified Business Platform** brings **6 distinct businesses** (**Billstacks**, **Top Builders**, **Zino Spark**, **Zino Apartments**, **Device Galaxy**, and **Visitor Management**) under a single login, unified financial engine, and cross-service admin dashboard.

This specification and prompt covers:
1. **End-to-End Unified State Synchronization (`lib/platform-store.ts`)** — Every important activity (sales, room bookings, online orders, material dispatches, SaaS subscriptions, visitor check-ins, and product edits) across any section of the website communicates in real time with the **Admin Financial & Sales Dashboard (`/admin`)** and **Activity Feed (`/admin/activity`)**.
2. **100% Functional Admin Dashboard (`/admin`)** — Interactive Revenue/Expenses/Net Profit summary, editable Monthly Targets, functional Sales/Purchase Payment Due settlement, instant Low-Stock & Quality Alert restocking, 30-Day Sales chart grouping (`By service` vs `By location`), and live Cross-Service Scope filtering.
3. **Rich Visual Photography & Descriptive Section Designs** — Curated visual imagery, architectural cards, and capability badges on both the **Admin Dashboard (`/admin`)** and **Main Home Screen (`/`)** describing what every section of the website is built for and what can be done on it, replacing plain text boxes.
4. **Drag-and-Drop Local Image Upload & Storage (`components/ui/image-dropzone.tsx`)** — Instead of requiring external image URLs, admins can drag and drop image files directly from their computer's local storage into the dashboard; images are compressed, uploaded to `/api/uploads` (`public/uploads/products/`), and persisted across the platform.
5. **Unified Invoice Activity & Multi-Format Exports (`components/ui/data-table.tsx`)** — Every invoice row is labeled with its **Source Section Badge** and **Activity Carried Out**, with one-click export to **CSV**, **Excel**, **PDF**, **Print**, and persistent **Column visibility**.
6. **External Partner Portals on Home Screen (`/`)** — High-visibility styled buttons and gradient cards for **Neadston Limited** (`https://sales.neadstonltd.com/`) and **Esto World** (`https://sales.estoworld.com/login`).
7. **Complete Viewport & Component Overflow Fixes** — Global `overflow-x: hidden; max-width: 100vw`, flex container `min-w-0` guards, modal `max-h-[90vh] overflow-y-auto`, and dropdown clipping fixes.

---

## 2. Issues Discovered & Resolved in the Codebase

| # | Issue Found | Root Cause | Fix Implemented |
|---|---|---|---|
| **1** | **Public Storefronts & Admin Dashboard Were Isolated** | `/admin`, `/admin/products`, `/`, `/shop`, `/apartments`, `/builders`, `/billstacks`, and `/visit` each used isolated local arrays. Changes in admin did not appear on public pages, and customer actions did not appear on the dashboard. | Created [`lib/platform-store.ts`](file:///c:/Users/Administrator/Desktop/yoyo/lib/platform-store.ts) with `localStorage` persistence + custom `zino-platform-store-sync` event broadcasting across all pages. |
| **2** | **Product Images Used Manual URL Text Inputs** | Both [`app/admin/page.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/app/admin/page.tsx) and [`app/admin/products/page.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/app/admin/products/page.tsx) required pasting external `https://...` URLs. | Built [`components/ui/image-dropzone.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/components/ui/image-dropzone.tsx) with drag-and-drop from local storage, client-side WebP canvas compression, and server disk storage via `POST /api/uploads`. |
| **3** | **30-Day Sales Chart "By service" vs "By location" Toggle Bug** | Clicking `"By service"` in [`app/admin/page.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/app/admin/page.tsx) updated `chartGrouping` state, but the `<LineChart>` hardcoded location lines (`MedicalRoad`, `Adepele`, `Olayeni`). | Connected `<LineChart>` conditionally to `sales30DaysByService` (5 service lines) and `sales30DaysByLocation` (4 location lines). |
| **4** | **Topbar Service Filter Did Not Filter Dashboard** | `selectedService` state in [`components/admin/admin-layout-shell.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/components/admin/admin-layout-shell.tsx) was not shared with child pages. | Linked `AdminLayoutShell` and `AdminTopbar` to `globalServiceFilter` in `usePlatformStore()` so selecting any service dynamically filters the dashboard. |
| **5** | **DataTable Column Visibility Clipping & Duplicate PDF Button** | [`components/ui/data-table.tsx`](file:///c:/Users/Administrator/Desktop/yoyo/components/ui/data-table.tsx) had `overflow-hidden` on its outer wrapper (clipping the Column Visibility menu on short tables), a duplicate `Export PDF` button, and missing `Source` column in exports. | Removed outer `overflow-hidden`, deduplicated `Export PDF`, added `localStorage` persistence for visible columns, and auto-included `Source` in CSV/Excel/PDF exports. |
| **6** | **Broken / 404 Links on Home & Public Pages** | Home page linked to `/spark`, `/register`, `/shop/cart`, `/account`, and `/admin/billstacks/invoices` which did not have dedicated page routes. | Updated links to point to valid active routes (`/admin/spark`, `/login`, `/shop`, `/admin`, `/admin/billstacks`). |
| **7** | **Demo Session Auth Guard Rejection on `/api/uploads`** | [`lib/auth.ts`](file:///c:/Users/Administrator/Desktop/yoyo/lib/auth.ts) `getSessionUser()` queried Prisma directly without handling `demo-` session tokens when PostgreSQL is offline. | Added offline/demo token recognition in `getSessionUser()` so authenticated API endpoints like `POST /api/uploads` work seamlessly. |
| **8** | **Horizontal Overflow Across Pages & Flex Layouts** | Glowing hero orbs, marquee tickers, and wide tables inside flex children lacked `min-w-0` and `overflow-x-hidden`. | Enforced `overflow-x: hidden; max-width: 100vw` on `html, body` in [`app/globals.css`](file:///c:/Users/Administrator/Desktop/yoyo/app/globals.css) and `min-w-0 overflow-x-hidden` on all page and layout shells. |

---

## 3. Master Prompt (Copy-Paste Ready for Future Enhancements)

```markdown
# Task: Unify All Website Sections with the Admin Financial & Sales Dashboard, Enable Drag-and-Drop Local Image Storage, Add Visual Section Designs, and Eliminate Overflow Issues

You are working on the **Zino One Unified Business Platform** (Next.js 14 App Router + TypeScript + Tailwind CSS + Prisma). Ensure the platform satisfies all requirements below:

### 1. Real-Time Cross-Website Unification with the Admin Dashboard (`lib/platform-store.ts`)
- Maintain a unified reactive store (`usePlatformStore` & `recordPlatformTransaction`) synchronized via `localStorage` and custom browser events:
  - **Customer & Staff Actions → Admin Dashboard**:
    - Any room reservation on `/apartments` or `/` logs a `BOOKING` invoice labeled `● Apartments`.
    - Any product purchase on `/shop` or `/` logs an `ORDER` invoice labeled `● Galaxy`.
    - Any POS checkout on `/admin/spark/pos` logs a `SALE` invoice labeled `● Spark`.
    - Any material order on `/builders` or `/admin/builders/sales/new` logs a `SALE` invoice labeled `● Builders`.
    - Any SaaS plan subscription on `/billstacks` logs an `INVOICE` labeled `● Billstacks`.
    - Any visitor check-in on `/visit` logs a `VISIT` pass labeled `● Visitors`.
  - **Admin Product/Service Edits → Public Website**:
    - Adding, editing, or deleting a product/service (including its image, name, custom label/badge, price, or stock status) on `/admin` or `/admin/products` immediately updates the live items shown on `/`, `/shop`, `/apartments`, `/builders`, and `/billstacks`.

### 2. 100% Functional Admin Dashboard (`app/admin/page.tsx`)
- **Service Scope Filter Bar**: Allow filtering the entire dashboard by `All 6 Unified Businesses` or any individual service (`Billstacks`, `Builders`, `Spark`, `Apartments`, `Galaxy`, `Visitors`), synced with the top navigation filter.
- **Financial Summary Cards**: Dynamically compute and display **Revenue This Month**, **Total Expenses This Month**, and **Net Profit This Month** with trend percentages.
- **Editable Monthly Targets**: Display progress bars for Sales & Revenue Target, Expense Budget Utilization, Apartment Bookings Target, and Visitor Check-In Target, with an **"Edit Targets"** modal to update targets live.
- **Visual Ecosystem Architecture Grid**: Display high-resolution photography cards with visual overlays, live item/invoice counters, and launch buttons describing each of the 6 website sections instead of plain text links.
- **Interactive 30-Day & Financial Year Charts**: Support toggling the 30-Day Sales chart between `"By service"` (rendering all service lines) and `"By location"` (rendering branch lines).
- **Actionable Alerts & Dues**:
  - **Needs Attention**: Allow resolving urgent alerts with instant feedback.
  - **Sales & Purchase Payment Due**: Clicking **"Settle Pay"** settles the balance, marks the corresponding invoice `PAID`, and logs the payment activity.
  - **Existing Low Stock & Quality Alerts**: Dynamically list all low-stock or out-of-stock products across services with product thumbnails and a **"+ Restock (25)"** button that replenishes stock, sets status to `ACTIVE`, and logs a restock transaction.
- **All Invoice & Transaction Activity Table**:
  - Every row must display its **Source Section Badge**, **Activity Type Badge** (`SALE`, `BOOKING`, `ORDER`, `INVOICE`, `EXPENSE`, `VISIT`), **Activity Carried Out**, **Invoice/Ref No.**, **Customer**, **Location**, **Amount**, **Status**, and **Date**.
  - Support filtering by service section, activity type, and date range, plus a **"+ Record Activity / Invoice"** modal.
  - Support one-click **Export CSV**, **Export Excel**, **Export PDF**, **Print**, and persistent **Column visibility** (always including the `Source` column in exports).

### 3. Drag-and-Drop Local Image Upload & Storage (`components/ui/image-dropzone.tsx`)
- Replace external URL text inputs in the Admin Dashboard and Products Manager modals with `<ImageDropzone />`:
  - Allow dragging and dropping image files (PNG, JPG, WebP, GIF) directly from the user's local device storage, or clicking to browse local files.
  - Compress images client-side into WebP Data URLs for instant persistent storage and upload to `POST /api/uploads` (`public/uploads/products/`).
  - Show a live thumbnail preview with **"Stored on Website"** confirmation, **"Replace"**, and **"Remove"** controls.

### 4. High-Quality Main Home Screen (`app/page.tsx`)
- **Hero & Continuous Scrolling Marquee Ticker**: Display a glassmorphic hero section and an infinite horizontal scrolling ticker (`animate-marquee`) showcasing live ecosystem operations.
- **Visual Section Cards**: Display photography headers and capability badges on all **"What This Website Is Built For & What Can Be Done"** and **"Our Six Core Services"** cards.
- **External Partner Buttons**: Include styled gradient buttons and partner cards for:
  - **Neadston Limited** → `https://sales.neadstonltd.com/`
  - **Esto World** → `https://sales.estoworld.com/login`
  across the sticky header, mobile drawer, hero CTA row, dedicated Connected Platforms section, and footer.

### 5. Overflow & Responsive Layout Protection
- Enforce `overflow-x: hidden; max-width: 100vw` on `html` and `body` in `app/globals.css`.
- Use `min-w-0 max-w-full overflow-x-hidden` on flex containers and `<main>` in `AdminLayoutShell` and public pages.
- Avoid `overflow-hidden` on outer `DataTable` cards so dropdown menus (`Column visibility`) never clip vertically, while keeping `.overflow-x-auto` on inner table wrappers.
- Constrain all modals with `max-h-[90vh] overflow-y-auto`.
```
