// ---------------------------------------------------------------------------
// Zino One — Unified Invoice Activity API
// GET /api/dashboard/invoices
// Returns all transaction activity across all 6 services, merged and sorted.
// Query: service (comma-sep slugs), type (SALE|BOOKING|ORDER|INVOICE|EXPENSE|VISIT),
//        from, to (YYYY-MM-DD), page (default 1), perPage (default 25)
// ---------------------------------------------------------------------------
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveServices } from "@/lib/scope";
import { lagosStartOfDayUTC, lagosEndOfDayUTC } from "@/lib/dates";
import { formatNGN } from "@/lib/money";
import { SERVICE_CONFIG, ServiceSlug } from "@/lib/constants";
import { SaleStatus, BookingStatus, OrderStatus } from "@prisma/client";

export type ActivityType = "SALE" | "BOOKING" | "ORDER" | "INVOICE" | "EXPENSE" | "VISIT";

export interface UnifiedInvoiceRow {
  id: string;
  source: ServiceSlug;
  serviceLabel: string;
  location: string | null;
  activityType: ActivityType;
  invoiceNo: string;
  customer: string;
  amountKobo: number | null;
  amountDisplay: string | null;
  status: string;
  createdAt: string;
}

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);

  const { searchParams } = new URL(req.url);
  const serviceParam = searchParams.get("service");
  const typeParam = searchParams.get("type") as ActivityType | null;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const perPage = Math.min(100, Math.max(10, Number(searchParams.get("perPage") || "25")));

  // Service scope
  const requestedServices = serviceParam
    ? (serviceParam.split(",").map((s) => s.trim().toUpperCase()) as ServiceSlug[])
    : undefined;
  const allowedServices = getEffectiveServices(ctx.user, requestedServices);

    // Date filters
    const fromDate = fromParam ? lagosStartOfDayUTC(fromParam) : undefined;
    const toDate = toParam ? lagosEndOfDayUTC(toParam) : undefined;
    const dateFilter = fromDate || toDate
      ? { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) }
      : undefined;

    const rows: UnifiedInvoiceRow[] = [];

    // ── SALES ──────────────────────────────────────────────────────────────
    if (!typeParam || typeParam === "SALE") {
      const sales = await prisma.sale.findMany({
        where: {
          source: { in: allowedServices },
          isParked: false,
          status: { not: SaleStatus.VOID },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: {
          contact: { select: { name: true } },
          location: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      });
      for (const s of sales) {
        rows.push({
          id: `sale_${s.id}`,
          source: s.source as ServiceSlug,
          serviceLabel: SERVICE_CONFIG[s.source as ServiceSlug]?.name ?? s.source,
          location: s.location?.name ?? null,
          activityType: "SALE",
          invoiceNo: s.receiptNo,
          customer: s.contact?.name ?? "Walk-in",
          amountKobo: s.totalKobo,
          amountDisplay: formatNGN(s.totalKobo),
          status: s.status,
          createdAt: s.createdAt.toISOString(),
        });
      }
    }

    // ── BOOKINGS ───────────────────────────────────────────────────────────
    if (!typeParam || typeParam === "BOOKING") {
      if (allowedServices.includes(ServiceSlug.APARTMENTS)) {
        const bookings = await prisma.booking.findMany({
          where: {
            source: { in: allowedServices },
            ...(dateFilter ? { createdAt: dateFilter } : {}),
          },
          include: { contact: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        for (const b of bookings) {
          rows.push({
            id: `booking_${b.id}`,
            source: b.source as ServiceSlug,
            serviceLabel: SERVICE_CONFIG[b.source as ServiceSlug]?.name ?? b.source,
            location: "Zino Apartments",
            activityType: "BOOKING",
            invoiceNo: b.ref,
            customer: b.contact?.name ?? "Guest",
            amountKobo: b.totalKobo,
            amountDisplay: formatNGN(b.totalKobo),
            status: b.status,
            createdAt: b.createdAt.toISOString(),
          });
        }
      }
    }

    // ── ORDERS ─────────────────────────────────────────────────────────────
    if (!typeParam || typeParam === "ORDER") {
      if (allowedServices.includes(ServiceSlug.GALAXY)) {
        const orders = await prisma.order.findMany({
          where: {
            status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
            ...(dateFilter ? { createdAt: dateFilter } : {}),
          },
          include: { contact: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        for (const o of orders) {
          rows.push({
            id: `order_${o.id}`,
            source: ServiceSlug.GALAXY,
            serviceLabel: SERVICE_CONFIG[ServiceSlug.GALAXY].name,
            location: "Galaxy Online",
            activityType: "ORDER",
            invoiceNo: o.orderNo,
            customer: o.contact?.name ?? "Online Customer",
            amountKobo: o.totalKobo,
            amountDisplay: formatNGN(o.totalKobo),
            status: o.status,
            createdAt: o.createdAt.toISOString(),
          });
        }
      }
    }

    // ── INVOICES ───────────────────────────────────────────────────────────
    if (!typeParam || typeParam === "INVOICE") {
      const invoices = await prisma.invoice.findMany({
        where: {
          source: { in: allowedServices },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: { contact: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      for (const inv of invoices) {
        rows.push({
          id: `invoice_${inv.id}`,
          source: inv.source as ServiceSlug,
          serviceLabel: SERVICE_CONFIG[inv.source as ServiceSlug]?.name ?? inv.source,
          location: null,
          activityType: "INVOICE",
          invoiceNo: inv.invoiceNo,
          customer: inv.contact?.name ?? "—",
          amountKobo: inv.totalKobo,
          amountDisplay: formatNGN(inv.totalKobo),
          status: inv.status,
          createdAt: inv.createdAt.toISOString(),
        });
      }
    }

    // ── VISITS ─────────────────────────────────────────────────────────────
    if (!typeParam || typeParam === "VISIT") {
      if (allowedServices.includes(ServiceSlug.VISITORS)) {
        const visits = await prisma.visit.findMany({
          where: { ...(dateFilter ? { createdAt: dateFilter } : {}) },
          include: { contact: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        for (const v of visits) {
          rows.push({
            id: `visit_${v.id}`,
            source: ServiceSlug.VISITORS,
            serviceLabel: SERVICE_CONFIG[ServiceSlug.VISITORS].name,
            location: "HQ Office",
            activityType: "VISIT",
            invoiceNo: `VIS-${v.id.slice(0, 6).toUpperCase()}`,
            customer: v.contact?.name ?? "Visitor",
            amountKobo: null,
            amountDisplay: null,
            status: v.status,
            createdAt: v.createdAt.toISOString(),
          });
        }
      }
    }

    // Sort all merged rows by date desc
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = rows.length;
    const paginated = rows.slice((page - 1) * perPage, page * perPage);

    return ok({ rows: paginated, total, page, perPage }, 200, requestId);
});
