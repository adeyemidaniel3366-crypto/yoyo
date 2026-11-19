// ---------------------------------------------------------------------------
// Zino One — Dashboard Summary & Report Aggregations (§8.5, §9.8)
// Runs in parallel (Promise.all), strictly scoped to caller's service/location.
// ---------------------------------------------------------------------------

import { BookingStatus, InvoiceStatus, OrderStatus, Prisma, SaleStatus, ServiceSlug, VisitStatus } from "@prisma/client";
import { subDays, startOfYear, endOfYear } from "date-fns";
import { prisma } from "../prisma";
import {
  getEffectiveServices,
  getServiceLabelMap,
  isSuperAdmin,
  withSourceLabels,
  type ServiceContext,
} from "../scope";
import { addKobo, formatNGN, formatNGNCompact, subKobo } from "../money";
import { lagosEndOfDayUTC, lagosStartOfDayUTC, toDateOnly, toLagosDateString } from "../dates";

function computeDeltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

export async function getDashboardSummary(
  ctx: ServiceContext,
  params: {
    services?: ServiceSlug[];
    locationIds?: string[];
    from?: string;
    to?: string;
  }
) {
  const allowedServices = getEffectiveServices(ctx.user, params.services);
  const labelMap = await getServiceLabelMap();

  const todayStr = toLagosDateString();
  const fromDate = params.from
    ? lagosStartOfDayUTC(params.from)
    : lagosStartOfDayUTC(todayStr);
  const toDate = params.to
    ? lagosEndOfDayUTC(params.to)
    : lagosEndOfDayUTC(todayStr);

  const periodMs = Math.max(86400_000, toDate.getTime() - fromDate.getTime());
  const prevFrom = new Date(fromDate.getTime() - periodMs);
  const prevTo = new Date(fromDate.getTime() - 1);

  const locFilter =
    params.locationIds && params.locationIds.length > 0
      ? { in: params.locationIds }
      : !isSuperAdmin(ctx.user) && ctx.user.locationIds.length > 0
        ? { in: ctx.user.locationIds }
        : undefined;

  const last30Start = lagosStartOfDayUTC(toLagosDateString(subDays(new Date(), 29)));
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());
  const todayDateOnly = toDateOnly(todayStr);

  const [
    salesCurr,
    salesPrev,
    returnsCurr,
    expensesCurr,
    ordersCurr,
    poCurr,
    poDue,
    invoiceDue,
    activeBookings,
    delayedCheckouts,
    visitorsToday,
    recentActivityRaw,
    salesLast30Raw,
    salesYearRaw,
    lowStockCount,
    salesPaymentDueRows,
    purchasePaymentDueRows,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        isParked: false,
        status: { not: SaleStatus.VOID },
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { totalKobo: true, paidKobo: true },
    }),
    prisma.sale.aggregate({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        isParked: false,
        status: { not: SaleStatus.VOID },
        createdAt: { gte: prevFrom, lte: prevTo },
      },
      _sum: { totalKobo: true },
    }),
    prisma.sale.aggregate({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        status: SaleStatus.RETURNED,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { totalKobo: true },
    }),
    prisma.expense.aggregate({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        date: { gte: fromDate, lte: toDate },
      },
      _sum: { amountKobo: true },
    }),
    allowedServices.includes(ServiceSlug.GALAXY)
      ? prisma.order.aggregate({
          where: {
            status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
            createdAt: { gte: fromDate, lte: toDate },
          },
          _sum: { totalKobo: true },
        })
      : Promise.resolve({ _sum: { totalKobo: 0 } }),
    prisma.purchaseOrder.aggregate({
      where: {
        source: { in: allowedServices },
        status: { not: "CANCELLED" },
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { totalKobo: true },
    }),
    prisma.purchaseOrder.aggregate({
      where: {
        source: { in: allowedServices },
        status: { in: ["SENT", "PARTIAL"] },
      },
      _sum: { totalKobo: true },
    }),
    prisma.invoice.aggregate({
      where: {
        source: { in: allowedServices },
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PART_PAID, InvoiceStatus.OVERDUE] },
      },
      _sum: { totalKobo: true },
    }),
    allowedServices.includes(ServiceSlug.APARTMENTS)
      ? prisma.booking.count({
          where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } },
        })
      : Promise.resolve(0),
    allowedServices.includes(ServiceSlug.APARTMENTS)
      ? prisma.booking.count({
          where: {
            status: BookingStatus.CHECKED_IN,
            checkOut: { lte: todayDateOnly },
          },
        })
      : Promise.resolve(0),
    allowedServices.includes(ServiceSlug.VISITORS)
      ? prisma.visit.count({
          where: { createdAt: { gte: lagosStartOfDayUTC(todayStr) } },
        })
      : Promise.resolve(0),
    prisma.activityLog.findMany({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
      },
      include: { actor: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.sale.findMany({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        isParked: false,
        status: { not: SaleStatus.VOID },
        createdAt: { gte: last30Start },
      },
      select: { source: true, totalKobo: true, createdAt: true },
    }),
    prisma.sale.findMany({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        isParked: false,
        status: { not: SaleStatus.VOID },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { source: true, totalKobo: true, createdAt: true },
    }),
    prisma.stockLevel.count({
      where: {
        product: { source: { in: allowedServices }, status: "ACTIVE" },
        ...(locFilter ? { locationId: locFilter } : {}),
        qty: { lte: 5 },
      },
    }),
    prisma.sale.findMany({
      where: {
        source: { in: allowedServices },
        ...(locFilter ? { locationId: locFilter } : {}),
        status: { in: [SaleStatus.UNPAID, SaleStatus.PART_PAID] },
      },
      include: { contact: { select: { id: true, name: true } }, location: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.purchaseOrder.findMany({
      where: {
        source: { in: allowedServices },
        status: { in: ["SENT", "PARTIAL"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSalesKobo = addKobo(
    salesCurr._sum.totalKobo ?? 0,
    ordersCurr._sum.totalKobo ?? 0
  );
  const netKobo = subKobo(totalSalesKobo, expensesCurr._sum.amountKobo ?? 0);
  const salesDeltaPct = computeDeltaPct(
    totalSalesKobo,
    salesPrev._sum.totalKobo ?? 0
  );

  // Build 30-day chart series
  const labels30: string[] = [];
  for (let i = 29; i >= 0; i--) {
    labels30.push(toLagosDateString(subDays(new Date(), i)));
  }

  const series30 = allowedServices
    .filter((s) => ([ServiceSlug.SPARK, ServiceSlug.BUILDERS, ServiceSlug.GALAXY] as ServiceSlug[]).includes(s))
    .map((svc) => {
      const byDay = new Map<string, number>();
      for (const row of salesLast30Raw) {
        if (row.source !== svc) continue;
        const d = toLagosDateString(row.createdAt);
        byDay.set(d, addKobo(byDay.get(d) ?? 0, row.totalKobo));
      }
      const lbl = labelMap[svc];
      return {
        name: lbl.name,
        source: svc,
        color: lbl.color,
        data: labels30.map((d) => byDay.get(d) ?? 0),
      };
    });

  // Build Financial Year (Jan-Dec) chart series
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const seriesYear = allowedServices
    .filter((s) => ([ServiceSlug.SPARK, ServiceSlug.BUILDERS, ServiceSlug.GALAXY] as ServiceSlug[]).includes(s))
    .map((svc) => {
      const buckets = new Array<number>(12).fill(0);
      for (const row of salesYearRaw) {
        if (row.source !== svc) continue;
        const m = row.createdAt.getUTCMonth();
        buckets[m] = addKobo(buckets[m], row.totalKobo);
      }
      const lbl = labelMap[svc];
      return {
        name: lbl.name,
        source: svc,
        color: lbl.color,
        data: buckets,
      };
    });

  // Attention items (§8.5)
  const attention: Array<{
    severity: "high" | "medium" | "low";
    source: ServiceSlug;
    title: string;
    href: string;
  }> = [];

  if (delayedCheckouts > 0) {
    attention.push({
      severity: "high",
      source: ServiceSlug.APARTMENTS,
      title: `${delayedCheckouts} delayed checkout(s)`,
      href: "/admin/apartments/bookings",
    });
  }
  if (lowStockCount > 0) {
    attention.push({
      severity: "medium",
      source: ServiceSlug.SPARK,
      title: `${lowStockCount} low-stock product(s) need restocking`,
      href: "/admin/spark/stock-alert",
    });
  }
  if ((invoiceDue._sum.totalKobo ?? 0) > 0) {
    attention.push({
      severity: "medium",
      source: ServiceSlug.BILLSTACKS,
      title: `${formatNGNCompact(invoiceDue._sum.totalKobo ?? 0)} in outstanding invoices`,
      href: "/admin/billstacks",
    });
  }

  const cards = [
    {
      key: "totalSales",
      label: "Total Sales",
      valueKobo: totalSalesKobo,
      display: formatNGNCompact(totalSalesKobo),
      deltaPct: salesDeltaPct,
      sources: allowedServices.filter((s) =>
        ([ServiceSlug.SPARK, ServiceSlug.BUILDERS, ServiceSlug.GALAXY] as ServiceSlug[]).includes(s)
      ),
    },
    {
      key: "net",
      label: "Net",
      valueKobo: netKobo,
      display: formatNGNCompact(netKobo),
      deltaPct: salesDeltaPct,
      sources: allowedServices,
    },
    {
      key: "invoiceDue",
      label: "Invoice Due",
      valueKobo: invoiceDue._sum.totalKobo ?? 0,
      display: formatNGNCompact(invoiceDue._sum.totalKobo ?? 0),
      deltaPct: 0,
      sources: [ServiceSlug.BILLSTACKS, ServiceSlug.BUILDERS],
    },
    {
      key: "sellReturn",
      label: "Total Sell Return",
      valueKobo: returnsCurr._sum.totalKobo ?? 0,
      display: formatNGN(returnsCurr._sum.totalKobo ?? 0),
      deltaPct: 0,
      sources: [ServiceSlug.SPARK, ServiceSlug.BUILDERS],
    },
    {
      key: "totalPurchase",
      label: "Total Purchase",
      valueKobo: poCurr._sum.totalKobo ?? 0,
      display: formatNGNCompact(poCurr._sum.totalKobo ?? 0),
      deltaPct: 0,
      sources: [ServiceSlug.SPARK, ServiceSlug.BILLSTACKS],
    },
    {
      key: "purchaseDue",
      label: "Purchase Due",
      valueKobo: poDue._sum.totalKobo ?? 0,
      display: formatNGNCompact(poDue._sum.totalKobo ?? 0),
      deltaPct: 0,
      sources: [ServiceSlug.SPARK, ServiceSlug.BILLSTACKS],
    },
    {
      key: "activeBookings",
      label: "Active Bookings",
      valueKobo: activeBookings,
      display: String(activeBookings),
      deltaPct: 0,
      sources: [ServiceSlug.APARTMENTS],
    },
    {
      key: "visitorsToday",
      label: "Visitors Today",
      valueKobo: visitorsToday,
      display: String(visitorsToday),
      deltaPct: 0,
      sources: [ServiceSlug.VISITORS],
    },
  ];

  const salesDueEnriched = await withSourceLabels(
    salesPaymentDueRows.map((s) => ({
      id: s.id,
      receiptNo: s.receiptNo,
      source: s.source,
      contactName: s.contact?.name ?? "Walk-in",
      locationName: s.location.name,
      totalKobo: s.totalKobo,
      paidKobo: s.paidKobo,
      dueKobo: subKobo(s.totalKobo, s.paidKobo),
      dueDisplay: formatNGN(subKobo(s.totalKobo, s.paidKobo)),
      status: s.status,
      createdAt: s.createdAt,
    }))
  );

  const poDueEnriched = await withSourceLabels(
    purchasePaymentDueRows.map((p) => ({
      id: p.id,
      poNo: p.poNo,
      source: p.source,
      totalKobo: p.totalKobo,
      totalDisplay: formatNGN(p.totalKobo),
      status: p.status,
      createdAt: p.createdAt,
    }))
  );

  return {
    cards,
    salesLast30Days: { labels: labels30, series: series30 },
    salesFinancialYear: { labels: monthLabels, series: seriesYear },
    attention,
    recentActivity: await withSourceLabels(recentActivityRaw),
    salesPaymentDue: {
      rows: salesDueEnriched,
      totalKobo: salesDueEnriched.reduce((a, r) => addKobo(a, r.dueKobo), 0),
    },
    purchasePaymentDue: {
      rows: poDueEnriched,
      totalKobo: poDueEnriched.reduce((a, r) => addKobo(a, r.totalKobo), 0),
    },
  };
}

export async function getConsolidatedReport(
  ctx: ServiceContext,
  params: { services?: ServiceSlug[]; from?: string; to?: string }
) {
  const allowed = getEffectiveServices(ctx.user, params.services);
  const fromDate = params.from
    ? lagosStartOfDayUTC(params.from)
    : startOfYear(new Date());
  const toDate = params.to
    ? lagosEndOfDayUTC(params.to)
    : endOfYear(new Date());

  const [salesBySvc, invoicesBySvc, bookingsRev, ordersRev, expensesBySvc] =
    await Promise.all([
      prisma.sale.groupBy({
        by: ["source"],
        where: {
          source: { in: allowed },
          isParked: false,
          status: { not: SaleStatus.VOID },
          createdAt: { gte: fromDate, lte: toDate },
        },
        _sum: { totalKobo: true },
      }),
      prisma.invoice.groupBy({
        by: ["source"],
        where: {
          source: { in: allowed },
          status: InvoiceStatus.PAID,
          createdAt: { gte: fromDate, lte: toDate },
        },
        _sum: { totalKobo: true },
      }),
      allowed.includes(ServiceSlug.APARTMENTS)
        ? prisma.booking.aggregate({
            where: {
              status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
              createdAt: { gte: fromDate, lte: toDate },
            },
            _sum: { totalKobo: true },
          })
        : Promise.resolve({ _sum: { totalKobo: 0 } }),
      allowed.includes(ServiceSlug.GALAXY)
        ? prisma.order.aggregate({
            where: {
              status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
              createdAt: { gte: fromDate, lte: toDate },
            },
            _sum: { totalKobo: true },
          })
        : Promise.resolve({ _sum: { totalKobo: 0 } }),
      prisma.expense.groupBy({
        by: ["source"],
        where: {
          source: { in: allowed },
          date: { gte: fromDate, lte: toDate },
        },
        _sum: { amountKobo: true },
      }),
    ]);

  const labelMap = await getServiceLabelMap();

  const rows = allowed.map((svc) => {
    const salesKobo = salesBySvc.find((r) => r.source === svc)?._sum.totalKobo ?? 0;
    const invKobo = invoicesBySvc.find((r) => r.source === svc)?._sum.totalKobo ?? 0;
    const bookKobo = svc === ServiceSlug.APARTMENTS ? bookingsRev._sum.totalKobo ?? 0 : 0;
    const ordKobo = svc === ServiceSlug.GALAXY ? ordersRev._sum.totalKobo ?? 0 : 0;
    const revenueKobo = addKobo(salesKobo, invKobo, bookKobo, ordKobo);
    const expenseKobo = expensesBySvc.find((r) => r.source === svc)?._sum.amountKobo ?? 0;
    const profitKobo = subKobo(revenueKobo, expenseKobo);

    return {
      source: svc,
      sourceLabel: labelMap[svc],
      revenueKobo,
      revenueDisplay: formatNGN(revenueKobo),
      expenseKobo,
      expenseDisplay: formatNGN(expenseKobo),
      profitKobo,
      profitDisplay: formatNGN(profitKobo),
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      revenueKobo: addKobo(acc.revenueKobo, r.revenueKobo),
      expenseKobo: addKobo(acc.expenseKobo, r.expenseKobo),
      profitKobo: addKobo(acc.profitKobo, r.profitKobo),
    }),
    { revenueKobo: 0, expenseKobo: 0, profitKobo: 0 }
  );

  return {
    rows,
    totals: {
      ...totals,
      revenueDisplay: formatNGN(totals.revenueKobo),
      expenseDisplay: formatNGN(totals.expenseKobo),
      profitDisplay: formatNGN(totals.profitKobo),
    },
  };
}

export async function getTaxReport(
  ctx: ServiceContext,
  source: ServiceSlug,
  from?: string,
  to?: string
) {
  const fromDate = from ? lagosStartOfDayUTC(from) : startOfYear(new Date());
  const toDate = to ? lagosEndOfDayUTC(to) : endOfYear(new Date());

  const [invoices, sales] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        source,
        status: { not: InvoiceStatus.CANCELLED },
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { subtotalKobo: true, taxKobo: true, totalKobo: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        source,
        status: { not: SaleStatus.VOID },
        isParked: false,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { subtotalKobo: true, taxKobo: true, totalKobo: true },
      _count: true,
    }),
  ]);

  const totalTaxKobo = addKobo(invoices._sum.taxKobo ?? 0, sales._sum.taxKobo ?? 0);
  return {
    source,
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    invoices: {
      count: invoices._count,
      taxKobo: invoices._sum.taxKobo ?? 0,
      taxDisplay: formatNGN(invoices._sum.taxKobo ?? 0),
    },
    sales: {
      count: sales._count,
      taxKobo: sales._sum.taxKobo ?? 0,
      taxDisplay: formatNGN(sales._sum.taxKobo ?? 0),
    },
    totalTaxKobo,
    totalTaxDisplay: formatNGN(totalTaxKobo),
  };
}

export async function getVisitorReport(from?: string, to?: string) {
  const fromDate = from ? lagosStartOfDayUTC(from) : lagosStartOfDayUTC(toLagosDateString(subDays(new Date(), 30)));
  const toDate = to ? lagosEndOfDayUTC(to) : lagosEndOfDayUTC(toLagosDateString());

  const [byStatus, totalVisits, attendanceByStatus] = await Promise.all([
    prisma.visit.groupBy({
      by: ["status"],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: true,
    }),
    prisma.visit.count({
      where: { createdAt: { gte: fromDate, lte: toDate } },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { date: { gte: toDateOnly(fromDate), lte: toDateOnly(toDate) } },
      _count: true,
    }),
  ]);

  return {
    source: ServiceSlug.VISITORS,
    totalVisits,
    visitsByStatus: byStatus.map((b) => ({ status: b.status as VisitStatus, count: b._count })),
    attendanceByStatus: attendanceByStatus.map((a) => ({ status: a.status, count: a._count })),
  };
}
