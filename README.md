# Zino One — Unified Business Platform

> **Six businesses, one front door, one login, one admin.**
> Every single transaction, product, booking, visit and alert labelled with its source service.

---

## 🏢 The Six Unified Services

| Service | Category | Source Badge | Core Functions |
|---|---|---|---|
| **Billstacks** | SaaS Invoicing & Accounting | `● Billstacks` (`#28A745`) | Invoices (paid/unpaid/partial), estimates, recurring bills, expenses, purchase orders, tax, HRM |
| **Top Builders** | Construction Supplies | `● Builders` (`#006B3F`) | Daily sales book, fast POS new sale, stock sheets (ST-00021), stock in, counts, debtors ledger |
| **Zino Spark** | Multi-Shop Electronics POS | `● Spark` (`#2563EB`) | Multi-shop POS, Computer Village inventory, stock alert table, inter-shop transfers, purchase due |
| **Zino Apartments** | Luxury Hospitality | `● Apartments` (`#1E3A5F`) | Public booking engine, hotel front desk, room status board (12 rooms), 10% tax math |
| **Device Galaxy** | Electronics E-Commerce | `● Galaxy` (`#E74C3C`) | Online storefront, 1:1 product cards, ratings, cart, compare, checkout, order tracking |
| **Visitor Management**| Enterprise Security & Kiosk| `● Visitors` (`#7C3AED`) | Tablet self check-in kiosk, pre-registered guest passes, employee clock in/out, attendance |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS 3
- **Database**: PostgreSQL + Prisma ORM (Unified single database)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Dates**: date-fns (`lib/dates.ts`)
- **Money Math**: Integer kobo everywhere (`store amountKobo: Int`). No floating point rounding bugs. Formatted via `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.

---

## 🗺️ Key Routes Map

### 🌐 Public Side (No Login Required)
- `/` — Unified Home Portal with 6 service tiles, live highlights & search
- `/apartments` — Zino Apartments booking site (room types, booking widget, FAQ)
- `/shop` — Device Galaxy e-commerce storefront (categories, catalog, cart)
- `/builders` — Top Builders materials catalog teaser & quote request
- `/billstacks` — Billstacks SaaS pricing (Basic ₦1,300 / Standard ₦2,000 / Premium ₦3,500)
- `/visit` — Visitor self-check-in kiosk (Appointment, Returning Visitor, New Pass)
- `/login` — Unified Login with Demo Role buttons (Admin / Employee / Reception)

### 🔒 Admin Workspace (`/admin`)
- `/admin` — Unified Executive Dashboard (8 Stat cards, 30-day & financial year charts, attention panel, payment due tables)
- `/admin/activity` — Cross-service chronological activity audit trail with service badges
- `/admin/contacts` — Unified contacts directory (customers, suppliers, guests, visitors, employees)
- `/admin/locations` — 8 Operating locations (5 Spark stores, Apartments Main, Galaxy Online, Builders yard)
- `/admin/settings` — Platform settings & Service Registry (Super Admin enable/disable)
- `/admin/reports/consolidated` — Multi-unit consolidated P&L report
- `/admin/builders/...` — Top Builders daily sales book, new sale, stock sheets, debtors
- `/admin/spark/...` — Zino Spark POS, product stock alert table (19 low stock items), transfers
- `/admin/apartments/...` — Hotel front desk, room inventory board, guest verification stats
- `/admin/visitors/...` — Visitor pass register, attendance logs, departments

---

## 🚀 Getting Started

When network access is active, run:

```bash
# 1. Install dependencies
npm install

# 2. Setup your database environment in .env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/zinoone?schema=public"

# 3. Push schema to PostgreSQL database
npx prisma db push

# 4. Seed demo data across all 6 business units
node prisma/seed.js

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public portal or [http://localhost:3000/admin](http://localhost:3000/admin) for the unified admin.
