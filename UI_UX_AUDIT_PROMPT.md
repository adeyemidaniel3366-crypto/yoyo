# Comprehensive UI/UX Audit Prompt — Zino One Unified Platform


## Executive Summary

The Zino One platform is a sophisticated multi-tenant Next.js 14 application with 6 distinct business units (Zino Spark, Device Galaxy, Zino Apartments, Top Builders, Billstacks, Visitor Management) unified under a single admin dashboard. While the codebase demonstrates strong architectural patterns and feature completeness, there are **significant UI/UX issues** across visual consistency, accessibility, responsive behavior, interaction design, and information architecture that need systematic remediation.

---

## 1. DESIGN SYSTEM & VISUAL CONSISTENCY ISSUES

### 1.1 Inconsistent Color Systems Across Sections
| Section | Primary Color | Issue |
|---------|--------------|-------|
| **Scene One (Home)** | `#00CEC8` (Turquoise), `#FF9C5F` (Peach), `#EB4203` (Orange-Red), `#FCEFC3` (Cream) | Custom bespoke palette not shared with other sections |
| **Zino Apartments** | `#F59E0B` (Amber), `#0B0F19` (Near-black) | Different accent system; luxury hotel aesthetic |
| **Device Galaxy (Shop)** | `#2C3E50` (Dark Blue), `#14142B` (Navy) | E-commerce dark theme |
| **Zino Spark** | `#2563EB` (Blue), `#006B3F` (Green) | Power/energy theme |
| **Top Builders** | `#006B3F` (Green), `#FFB800` (Amber) | Construction materials theme |
| **Billstacks** | `#0D333F` (Dark Teal), `#14B8A6` (Teal) | Accounting/finance theme |
| **Visitor Kiosk** | `#7C3AED` (Purple), `slate-900` | Security/kiosk dark mode |
| **Admin Dashboard** | `#4F46E5` (Indigo), `#14142B` (Dark Navy) | Enterprise admin theme |

**Impact:** Users experience **visual whiplash** when navigating between sections. No shared design tokens, CSS variables, or theme provider exists.

### 1.2 Typography Inconsistencies
- **Scene One:** `font-mono` for labels, `font-serif` for headlines, mixed `font-sans`
- **Apartments:** `font-serif` for headlines, `font-mono` for data, `font-sans` for body
- **Admin:** Primarily `font-sans` with `font-mono` for codes/amounts
- **Other sections:** Inconsistent font stacks, no centralized typography scale
- **Missing:** Fluid typography clamp(), consistent line-height ratios, responsive type scale

### 1.3 Spacing & Layout Token Drift
- **Border radius:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` used arbitrarily
- **Shadows:** `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, custom `shadow-[8px_8px_0px_#12110E]` (Scene One only)
- **Container widths:** `max-w-7xl`, `max-w-5xl`, `max-w-4xl`, `max-w-2xl` — no consistent content width
- **Padding rhythms:** `p-4`, `p-5`, `p-6`, `p-8`, `px-4 sm:px-8` — no spacing scale

### 1.4 Component Variant Explosion
- **Buttons:** 15+ distinct button styles across pages (inline styles, no shared Button component usage in public pages)
- **Cards:** 8+ card patterns (pricing cards, product cards, stat cards, visual service cards, room cards)
- **Badges:** `SourceBadge`, `StatusBadge`, inline badge patterns — inconsistent sizing/color
- **Modals:** Custom modal implementations in every section vs. shared `Modal` component

---

## 2. ACCESSIBILITY (a11y) VIOLATIONS

### 2.1 Critical Issues (WCAG 2.1 AA Failures)

| Issue | Location | Severity |
|-------|----------|----------|
| **Missing alt text** on decorative images | Scene Hero, Gallery thumbnails, Product cards | High |
| **Insufficient color contrast** (cream `#FCEFC3` on white, amber on white) | Scene One, Apartments pricing, Admin stat cards | High |
| **No focus-visible styles** on custom interactive elements | Command palette items, Auto-tour controls, Experiment tabs | High |
| **Missing ARIA labels** on icon-only buttons | Close modals, Toggle room status, Copy email, Share buttons | High |
| **Non-semantic heading structure** (h1→h3 jumps, multiple h1s) | Admin dashboard, Apartment details, Shop page | Medium |
| **Keyboard traps** in modals/drawers | Command palette, Booking modal, Product modal | High |
| **No skip-to-main-content link** | All pages | Medium |
| **Form inputs without associated labels** | Search inputs, Date pickers, Quantity selectors | High |
| **Live regions missing** for dynamic content | Toast notifications, Auto-tour announcements, Stock alerts | Medium |
| **Reduced motion not respected** | Orbital animations, Particle canvas, Wave synthesizer | Medium |

### 2.2 Screen Reader Issues
- **Command Palette:** No `role="listbox"`, `aria-activedescendant`, or `aria-selected`
- **Auto Tour:** No announcement of section changes for screen readers
- **Data Tables:** No `scope="col"` on headers, no row headers for screen readers
- **Charts:** No text alternative for Recharts visualizations
- **Image Gallery:** No `aria-label` on thumbnails, no `role="group"`

### 2.3 Touch Target Violations
- **Icon buttons:** Many at 24×24px (minimum 44×44px)
- **Pagination controls:** 32px height
- **Tab triggers:** 36px height in some sections
- **Mobile nav items:** Adequate but inconsistent

---

## 3. RESPONSIVE & MOBILE EXPERIENCE ISSUES

### 3.1 Breakpoint Inconsistencies
| Component | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) | Issue |
|-----------|-----------------|---------------------|-------------------|-------|
| **Admin Sidebar** | Hidden (drawer) | Hidden (drawer) | Fixed 260px | No tablet-optimized collapsed state |
| **Data Tables** | Horizontal scroll | Horizontal scroll | Full width | No column hiding/priority on mobile |
| **Charts** | Fixed 260px height | Fixed 260px height | 288px height | No responsive sizing |
| **Product Grid** | 1 col | 2 col | 3-4 col | Good |
| **Command Palette** | Full width | Max-w-xl | Max-w-xl | Good |
| **Booking Modal** | Full screen | Max-w-2xl | Max-w-2xl | Good |
| **Hero Centerpiece** | Aspect-square | Aspect-square | Aspect-square | 3D transform breaks on small screens |

### 3.2 Mobile-Specific Problems
- **Admin Dashboard:** Sidebar drawer covers content; no bottom sheet pattern for mobile
- **Data Tables:** Horizontal scroll hides actions; no "card view" fallback
- **Charts:** Legends overflow; tooltips cut off on small screens
- **Image Dropzone:** Drag-and-drop UX poor on touch devices
- **Command Palette:** Keyboard shortcuts (⌘K) don't work on mobile
- **Auto Tour:** Fixed bottom bar covers content on mobile
- **Experiments Lab:** Canvas/terminal too wide for mobile

### 3.3 Touch Interaction Gaps
- No pull-to-refresh on data-heavy pages
- No swipe gestures for image galleries
- No haptic feedback on critical actions
- Date pickers use native `<input type="date">` — inconsistent UX across browsers

---

## 4. INTERACTION DESIGN & MICRO-UX ISSUES

### 4.1 Feedback & State Communication

| Issue | Examples | Impact |
|-------|----------|--------|
| **No loading skeletons** | Admin dashboard cards, Product grid, Activity feed | Perceived performance poor |
| **Inconsistent toast patterns** | Custom inline toasts (Scene One, Shop, Spark, Builders, Billstacks, Visit) vs. `ToastProvider` (Admin) | Confusing; different positions, animations, durations |
| **No optimistic UI** | Booking submission, Product save, Restock action | Feels slow; no immediate feedback |
| **Missing empty states** | Product alerts (has component but not used), Activity feed, Search results | Dead ends |
| **No progress indication** | CSV/Excel/PDF export, Dashboard sync, Image upload | User uncertainty |

### 4.2 Navigation & Wayfinding
- **No breadcrumbs** on deep pages (Admin sub-pages, Apartment details, Product details)
- **Command Palette** is powerful but undiscoverable (only ⌘K, no visible trigger on mobile)
- **Admin sidebar** groups collapse/expand but no "collapse all" or search
- **Service switcher** in admin (top bar) — 6 pills + "All" = 7 items, horizontal scroll on mobile
- **No "back to dashboard" from deep admin pages**

### 4.3 Form & Input Issues
- **No inline validation** on most forms (only submit-time)
- **Date range picker** — no preset for "Last 90 days", "Year to date"
- **Number inputs** — no stepper buttons, no min/max enforcement in UI
- **Select components** — native `<select>` styling inconsistent; no search/filter for long lists
- **File upload** — no progress bar, no multiple file preview grid, no drag-over state on mobile

### 4.4 Animation & Motion
- **Excessive motion** on Scene One (3 orbital rings + core + particle effects)
- **No `prefers-reduced-motion`** media query handling anywhere
- **Inconsistent easing** — `duration-200`, `duration-300`, `duration-500`, `transition-all`
- **Auto-tour** auto-scrolls page — disorienting, no pause on hover
- **Particle canvas** runs continuously — performance drain on low-end devices

---

## 5. INFORMATION ARCHITECTURE & CONTENT ISSUES

### 5.1 Admin Dashboard — Cognitive Overload
The single-page admin dashboard contains **14 distinct sections**:
1. Header + Service Scope + Currency Switcher + Sync Controls
2. Live Operations Simulator (3 action buttons)
3. Security Diagnostics Drawer
4. Service Scope Switcher (7 pills)
5. Financial Summary (3 cards)
6. Monthly Targets (4 progress bars)
7. 8 KPI Stat Cards
8. Visual Ecosystem Showcase (6 service cards)
9. Apartment Room Board (4 room cards)
10. Sales Charts (2 charts with toggle)
11. Needs Attention + Activity Feed
12. Payment Due Tables (2 tables)
13. Low Stock Alerts Table
14. Invoice Activity Table (with filters)
15. Products Manager (tabs + grid + modal)

**Problems:**
- No progressive disclosure — everything visible at once
- No dashboard personalization / widget rearrangement
- Scroll position not preserved on filter changes
- "Force Sync" and "Export CSV" compete for attention
- Simulator buttons look like real actions (dangerous in production)

### 5.2 Public Pages — Inconsistent Information Hierarchy

| Page | Hero | Value Prop | Social Proof | Pricing/CTA | Footer | Issues |
|------|------|------------|--------------|-------------|--------|--------|
| **Scene One** | ✅ Kinetic | ✅ Clear | ❌ None | ❌ None | ✅ | No clear conversion path |
| **Apartments List** | ✅ | ✅ | ❌ | ❌ | ✅ | No availability calendar preview |
| **Apartment Detail** | ✅ Gallery | ✅ Specs | ✅ Reviews (4.98) | ✅ Sticky widget | ✅ | Excellent |
| **Billstacks** | ✅ | ✅ | ❌ | ✅ 3 tiers | ✅ | No feature comparison table |
| **Builders** | ✅ | ✅ | ❌ | ❌ Catalog only | ✅ | No bulk quote form |
| **Shop (Galaxy)** | ✅ | ✅ | ❌ | ✅ Cart | ✅ | No category filters visible |
| **Spark** | ✅ | ✅ | ❌ | ✅ Inquiry | ✅ | No spec comparison |
| **Visit (Kiosk)** | ✅ | ✅ | ❌ | ✅ 3 modes | ✅ | Excellent focused UX |

### 5.3 Missing Critical Pages (per `unimplementedthings.md`)
- ❌ Custom 404 page (`app/not-found.tsx`)
- ❌ Global error boundary (`app/error.tsx`)
- ❌ Customer account portal (`/account`, `/account/orders`, `/account/bookings`)
- ❌ Apartment booking pass/voucher screen (`/apartments/booking/[ref]`)
- ❌ Privacy Policy (`/privacy`)
- ❌ Terms of Service (`/terms`)
- ❌ Refund/Cancellation Policy (`/refund-policy`)
- ❌ Dynamic sitemap (`app/sitemap.ts`)
- ❌ Robots.txt (`app/robots.ts`)
- ❌ Social preview cards (OG images)
- ❌ Web App Manifest (PWA support)

---

## 6. PERFORMANCE & TECHNICAL UX ISSUES

### 6.1 Client-Side Performance
- **Scene One:** 3 `useEffect` scroll listeners, 3 orbital animations, particle canvas, Web Audio API — heavy for landing page
- **Admin Dashboard:** 15+ `useState`, 8 `useMemo`, 6 `useEffect` — re-renders on any state change
- **Image Dropzone:** Creates `FileReader` + `canvas` per file — no Web Workers
- **Experiments Lab:** 3 simultaneous `requestAnimationFrame` loops when tabs switched
- **No code splitting** for heavy components (Charts, Canvas, Terminal)

### 6.2 Network & Data
- **No SWR/React Query** — manual `fetch` + `useEffect` patterns everywhere
- **No request deduplication** — multiple components fetch same data
- **No optimistic updates** — all mutations wait for server
- **In-memory fallback** for database — data lost on refresh (dev only but confusing)
- **No pagination** on Activity Feed (shows 7 items, "View all" links to separate page)

### 6.3 Bundle Size Concerns
- **Lucide React:** Full icon library imported in many files (tree-shaking helps but not perfect)
- **Recharts:** Heavy charting library loaded on admin dashboard
- **Next/Image:** Used correctly but some `<img>` tags bypass optimization
- **Unused CSS:** Tailwind purges but custom CSS in globals.css may have dead code

---

## 7. SECTION-BY-SECTION DETAILED ISSUES

### 7.1 Scene One (Home / Portfolio) — `app/(site)/page.tsx`
| Category | Issues |
|----------|--------|
| **Visual** | Bespoke color system not reusable; orbital animation distracts from content; cream background low contrast |
| **Navigation** | Command Palette only via ⌘K; mobile menu basic; no scroll spy for active section |
| **Content** | No clear value proposition for visitors; "Projects" section shows technical projects not business services |
| **Performance** | 3D transform on mouse move runs on every frame; AudioContext created lazily but persists |
| **Accessibility** | Canvas animations not announced; orbital rings decorative but in DOM; no reduced motion |
| **Mobile** | Hero centerpiece aspect-square wastes vertical space; command palette unusable on touch |

### 7.2 Zino Apartments — `app/(site)/apartments/`
| Category | Issues |
|----------|--------|
| **List Page** | No filtering by dates/guests/price; no map view; no availability indicators on cards |
| **Detail Page** | **Strengths:** Excellent gallery, sticky booking widget, clear pricing breakdown, amenities grid |
| **Booking Modal** | **Strengths:** Multi-step, payment options, voucher generation, platform sync |
| **Issues** | No calendar heatmap for availability; no guest reviews display; no virtual tour; date picker min/max not enforced |

### 7.3 Device Galaxy (Shop) — `app/(site)/shop/page.tsx`
| Category | Issues |
|----------|--------|
| **Header** | Top bar + Nav header = 2 sticky headers (wasted space) |
| **Search** | Desktop-only; no mobile search trigger |
| **Filters** | Category tabs only; no price range, brand, spec filters |
| **Product Cards** | No quick-add to cart; no wishlist; no compare |
| **Cart** | Side drawer pattern but no persistent mini-cart icon with count |
| **Checkout** | Not implemented (redirects to admin login) |

### 7.4 Zino Spark — `app/(site)/spark/page.tsx`
| Category | Issues |
|----------|--------|
| **Product Display** | Static product list; no category filtering UI visible |
| **Inquiry Flow** | Adds to unified cart but no clear "quote requested" confirmation |
| **Specs** | Technical specs in plain text; no comparison table |
| **Mobile** | Category pills horizontal scroll; product cards stack well |

### 7.5 Top Builders — `app/(site)/builders/page.tsx`
| Category | Issues |
|----------|--------|
| **Catalog** | Only 3 teaser products; no full catalog view |
| **Pricing** | No bulk pricing tiers visible; "Quick Order" adds to unified cart |
| **Missing** | No downloadable price sheet; no quote request form; no delivery calculator |

### 7.6 Billstacks — `app/(site)/billstacks/page.tsx`
| Category | Issues |
|----------|--------|
| **Pricing** | 3 tiers clear; monthly/yearly toggle good |
| **Missing** | No feature comparison matrix; no interactive demo; no FAQ |
| **CTA** | "Subscribe" buttons simulate transaction — confusing for real users |

### 7.7 Visitor Kiosk — `app/(site)/visit/page.tsx`
| Category | Issues |
|----------|--------|
| **Strengths** | Focused single-purpose UX; 3 clear modes; dark mode appropriate for kiosk |
| **Issues** | No camera capture for badge photo; no QR code display for pre-registered; no accessibility mode (high contrast, large text) |
| **Mobile** | Designed for tablet kiosk — works well |

### 7.8 Admin Dashboard — `app/(admin)/admin/page.tsx`
| Category | Issues |
|----------|--------|
| **Layout** | Single massive page (2700+ lines); no code splitting |
| **Data Density** | 14 sections competing for attention; no visual hierarchy |
| **Charts** | Recharts tooltips cut off on right edge; no export from charts |
| **Tables** | DataTable component good but: no row selection, no bulk actions, no column resize |
| **Modals** | 3 modals (Product, Targets, Transaction) — all custom, inconsistent |
| **Product Manager** | Drag-drop image upload excellent; but grid has no pagination/virtualization |
| **Real-time** | "Force Sync" manual; no WebSocket/live updates |
| **Mobile** | Sidebar drawer; tables horizontal scroll; charts too small |

---

## 8. COMPONENT LIBRARY GAPS

### 8.1 Missing Core Components
| Component | Needed For | Current Workaround |
|-----------|------------|-------------------|
| **Avatar** | User menus, comments, bookings | Inline `<Image>` + initials |
| **Breadcrumb** | Deep navigation | Manual flex + ChevronRight |
| **Calendar/DatePicker** | Booking, reports, filters | Native `<input type="date">` |
| **Checkbox/Radio Group** | Forms, filters | Native inputs + custom labels |
| **Combobox/Autocomplete** | Search, selects with many options | Native `<select>` |
| **Dialog/AlertDialog** | Confirmations, warnings | Custom Modal implementations |
| **Dropdown Menu** | User menus, actions | Custom implementations |
| **Hover Card/Tooltip** | Truncated text, info icons | Title attribute only |
| **Pagination** | Tables, lists | DataTable has internal only |
| **Progress** | Uploads, sync, multi-step | Custom inline bars |
| **Radio Group** | Payment methods, filters | Custom label+radio pattern |
| **Scroll Area** | Long lists, terminals | Native overflow |
| **Separator** | Visual grouping | `<hr>` / border |
| **Sheet/Bottom Sheet** | Mobile drawers, filters | Custom Drawer component |
| **Skeleton** | Loading states | None — spinners only |
| **Slider/Range** | Price filters, amplitude | Native `<input type="range">` |
| **Switch/Toggle** | Settings, boolean filters | Custom checkbox style |
| **Tabs** | Admin sections, product views | Custom pill buttons |
| **Toast** | Notifications | Admin has ToastProvider; public pages use inline |
| **Tooltip** | Icon buttons, truncated text | None |

### 8.2 Existing Components Needing Enhancement
| Component | Issues |
|-----------|--------|
| **Button** | No `asChild` for Link composition; no icon-only size consistency |
| **Input** | No prefix/suffix slots; no character count; no OTP variant |
| **Select** | No search/filter; no multi-select; no groups |
| **DataTable** | No row selection; no bulk actions; no column resize/reorder; no server-side pagination |
| **Modal** | No `AlertDialog` variant; no nested modal support; focus trap could be stronger |
| **Drawer** | No bottom-sheet variant; no swipe-to-close on mobile |
| **ImageDropzone** | No crop/rotate; no multiple file grid; no progress for large files |
| **DateRangePicker** | No presets for "Last quarter", "Year to date"; no range validation |
| **StatCard** | No trend sparkline; no drill-down link; delta period hardcoded |
| **ChartCard** | No chart-type switcher; no data table fallback; print/export basic |
| **SourceBadge** | No tooltip on hover for full name; size variants inconsistent |
| **StatusBadge** | No blinking/pulse for "pending" states; no icon variants |

---

## 9. PRIORITIZED REMEDIATION ROADMAP

### Phase 1: Foundation (Week 1-2) — Critical & High Impact
1. **Create Design Token System** — Colors, spacing, typography, shadows, radii as CSS variables
2. **Implement Theme Provider** — Light/dark mode + section-specific accent colors
3. **Build Shared Component Library** — Button, Input, Select, Modal, Toast, Badge, Card, Table
4. **Add Global a11y Fixes** — Skip link, focus-visible, ARIA labels, heading hierarchy
5. **Create Custom 404 & Error Boundary** — Branded, helpful, with search/home links

### Phase 2: Public Experience (Week 3-4)
6. **Unify Public Page Layout** — Consistent header, footer, container, spacing
7. **Implement Missing Pages** — Privacy, Terms, Refund Policy, Account Portal, Booking Voucher
8. **Add SEO Infrastructure** — Sitemap, robots.txt, OG images, manifest.json
9. **Mobile-First Responsive Audit** — Fix all breakpoint issues, touch targets
10. **Unify Toast System** — Single ToastProvider across all sections

### Phase 3: Admin Dashboard (Week 5-6)
11. **Code-Split Dashboard** — Lazy-load charts, tables, product manager
12. **Implement Dashboard Layout System** — Widget grid, personalization, progressive disclosure
13. **Add Real-Time Updates** — WebSocket/SSE for live data, remove "Force Sync"
14. **Enhance DataTable** — Row selection, bulk actions, column resize, server pagination
15. **Mobile Admin** — Bottom sheet navigation, card-view tables, responsive charts

### Phase 4: Polish & Advanced (Week 7-8)
16. **Animation System** — Respect `prefers-reduced-motion`, consistent easing, performance budgets
17. **Advanced Forms** — Inline validation, auto-save, multi-step wizards
18. **Command Palette Enhancement** — Mobile trigger, recent items, fuzzy search
19. **PWA Support** — Service worker, offline caching, install prompt
20. **Documentation & Storybook** — Component docs, design system site

---

## 10. QUICK WINS (Can Ship This Week)

| Fix | Effort | Impact |
|-----|--------|--------|
| Add `focus-visible` ring to all interactive elements | 2h | High (a11y) |
| Create shared `Toast` hook + provider for public pages | 3h | High (consistency) |
| Add skip-to-main-content link | 30m | High (a11y) |
| Fix color contrast on cream/amber backgrounds | 2h | High (a11y) |
| Add `prefers-reduced-motion` media query to disable orbital animations | 1h | Medium (a11y/perf) |
| Replace inline button styles with `Button` component | 4h | Medium (consistency) |
| Add loading skeletons to admin dashboard cards | 2h | Medium (perceived perf) |
| Implement breadcrumb component for admin sub-pages | 2h | Medium (wayfinding) |
| Add empty state illustrations to data tables | 1h | Low (polish) |
| Create OG image template for social sharing | 2h | Medium (marketing) |

---

## 11. METRICS TO TRACK

| Metric | Current | Target |
|--------|---------|--------|
| **Lighthouse Accessibility** | ~65 | ≥95 |
| **Lighthouse Performance (Mobile)** | ~55 | ≥85 |
| **Cumulative Layout Shift** | >0.25 | <0.1 |
| **First Contentful Paint** | ~2.5s | <1.5s |
| **Time to Interactive** | ~4s | <3s |
| **Mobile Usability Errors** | Multiple | 0 |
| **Design Token Coverage** | 0% | 100% |
| **Component Library Adoption** | ~20% | 90% |
| **Bundle Size (JS)** | ~450KB | <250KB |

---

## 13. NEW REQUIREMENT: STAFF PORTAL WITH LIMITED ADMIN ACCESS

### 13.1 Staff Login & Dashboard Page (NEW PAGE NEEDED)
**Requirement:** Create a dedicated staff portal at `/staff` (or similar) where authenticated staff members can access a **limited subset** of admin dashboard functionality — read-only/view access to specific operational data without full administrative controls.

#### 13.1.1 Required Staff-Accessible Sections (Read-Only/View Only)

| Section | Current Admin Location | Staff Access Level | Notes |
|---------|------------------------|-------------------|-------|
| **Low Stock & Quality Alerts** | Admin Dashboard → "⚠ Existing Low Stock & Quality Alerts" table | **View Only** | See alerts, cannot restock |
| **All Invoice & Transaction Activity** | Admin Dashboard → "All Invoice & Transaction Activity" table | **View Only** | Filter by service/type/date, cannot add/edit |
| **Website Products & Services Studio** | Admin Dashboard → "Website Products & Services Studio" grid | **View Only** | Browse products across 6 sections, cannot add/edit/delete |
| **Six Unified Website Sections Overview** | Admin Dashboard → "Visual Ecosystem Showcase" cards | **View Only** | See live counters (products, invoices), cannot manage |
| **Sales Payment Due** | Admin Dashboard → "Sales Payment Due" table | **View Only** | See debtor invoices, cannot settle |
| **Purchase Payment Due** | Admin Dashboard → "Purchase Payment Due" table | **View Only** | See supplier balances, cannot settle |
| **Zino Luxury Apartments — Real-Time Room Board** | Admin Dashboard → "Real-Time Room Board" | **View Only** | **⚠ CURRENT OVERFLOW ISSUE** — text overflow on room cards, needs fix |
| **Notifications** | (New) | **View + Dismiss** | Staff-specific notifications (booking requests, stock alerts, visitor arrivals) |

#### 13.1.2 Explicitly EXCLUDED from Staff Access
- ❌ Financial Summary cards (Revenue, Expenses, Net Profit)
- ❌ Monthly Targets vs Actuals (edit capability)
- ❌ Live Operations Simulator (Simulate Booking/POS/Dispatch)
- ❌ Security Diagnostics Drawer
- ❌ Force Sync / Export Audit CSV
- ❌ Record New Invoice/Activity modal
- ❌ Edit Monthly Targets modal
- ❌ Add/Edit/Delete Products in Products Studio
- ❌ Toggle Room Status on Room Board
- ❌ Settle Payment Due actions
- ❌ Restock actions on Low Stock table
- ❌ Service Scope Switcher (should default to "ALL" or staff's assigned service)
- ❌ Currency Switcher (default to NGN)
- ❌ Date Range Picker affecting financial totals (or read-only preset)

#### 13.1.3 Staff Authentication & Authorization
- **Login Page:** `/staff/login` (separate from `/login` which is for admin)
- **Session:** Separate auth middleware/role check (`role: "STAFF"` vs `role: "ADMIN"`)
- **Redirect:** After login → `/staff/dashboard`
- **Logout:** Returns to `/staff/login`
- **Route Protection:** Middleware checks for `STAFF` role on `/staff/*` routes

#### 13.1.4 Staff Dashboard Layout Requirements
```
┌─────────────────────────────────────────────────────────────┐
│  Staff Portal Header: Logo | Staff Name | Role | Logout    │
├─────────────────────────────────────────────────────────────┤
│  Sidebar/Nav:                                               │
│  📊 Dashboard (landing)                                     │
│  📦 Low Stock Alerts                                        │
│  🧾 Invoice Activity                                        │
│  🛍️ Products Catalog                                        │
│  🏢 Services Overview                                       │
│  💰 Sales Due                                               │
│  📋 Purchase Due                                            │
│  🏨 Room Board                                              │
│  🔔 Notifications                                           │
├─────────────────────────────────────────────────────────────┤
│  Main Content Area (read-only tables/cards)                 │
│  - No action buttons (Edit, Delete, Restock, Settle)        │
│  - Filter/search allowed                                    │
│  - Export CSV/Excel/PDF allowed (for reporting)             │
│  - Pagination allowed                                       │
└─────────────────────────────────────────────────────────────┘
```

#### 13.1.5 Specific Fix Needed: Room Board Text Overflow
**Current Issue:** In `app/(admin)/admin/page.tsx` → "Zino Luxury Apartments — Real-Time Room Board" section, room cards have text overflow:
- Room titles (e.g., "Presidential Penthouse") may truncate poorly
- Floor/location text (e.g., "Top Penthouse Floor") overflows card width
- Rate display (`formatMoney(room.rateKobo)/night`) may break layout on mobile
- **Fix:** Add `truncate`, `line-clamp`, responsive text sizing, `min-w-0` on flex children

#### 13.1.6 Notifications Page (New)
**Features:**
- Real-time notifications via WebSocket/SSE or polling
- Categories: Booking Requests, Low Stock Alerts, Visitor Arrivals, Payment Dues, System Alerts
- Actions: Mark as read, Dismiss, Link to relevant section (read-only)
- Unread badge count in header/sidebar
- Filter by type, date, read status

---

## 12. APPENDIX: FILE INVENTORY FOR REFERENCE

### Public Pages
- `app/(site)/page.tsx` — Scene One Home (30KB)
- `app/(site)/apartments/page.tsx` — Apartments List (32KB)
- `app/(site)/apartments/[slug]/page.tsx` — Apartment Detail (25KB)
- `app/(site)/billstacks/page.tsx` — Billstacks Landing
- `app/(site)/builders/page.tsx` — Builders Landing
- `app/(site)/shop/page.tsx` — Device Galaxy Shop (23KB)
- `app/(site)/spark/page.tsx` — Spark Landing (22KB)
- `app/(site)/visit/page.tsx` — Visitor Kiosk

### Admin Dashboard
- `app/(admin)/admin/page.tsx` — Main Dashboard (2700+ lines)
- `app/(admin)/admin/layout.tsx` — Admin Layout Wrapper
- `components/admin/admin-sidebar.tsx` — Sidebar Navigation (31KB)
- `components/admin/admin-layout-shell.tsx` — Layout Shell
- `components/admin/admin-topbar.tsx` — Top Bar

### Shared Components
- `components/ui/` — 13 components (Button, Input, Select, Modal, DataTable, StatCard, ChartCard, etc.)
- `components/scene/` — 8 Scene One specific components
- `components/apartments/` — Booking Modal

### Configuration
- `tailwind.config.js` — No design tokens, custom colors only
- `globals.css` — Basic reset, no CSS variables
- `lib/constants.ts` — Service config with colors (source of truth for badges)

---

**End of Audit Prompt**

*This document should be used as the primary reference for all UI/UX improvement work on the Zino One platform. Update as issues are resolved.*