// ---------------------------------------------------------------------------
// Zino One — Scheduled Cron Job Services (§14)
// ---------------------------------------------------------------------------

import { Role, SaleStatus, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { lagosEndOfDayUTC, lagosStartOfDayUTC, toLagosDateString } from "../dates";
import { formatNGN } from "../money";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";

/**
 * Finds products newly at/below threshold and notifies Storekeeper + Service Manager (§9.3, §14).
 */
export async function runLowStockScan() {
  const levels = await prisma.stockLevel.findMany({
    where: { product: { status: "ACTIVE" } },
    include: { product: true, location: true },
  });

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const newlyLow = levels.filter(
    (l) =>
      Number(l.qty) <= l.product.lowStockAt &&
      (!l.lastLowStockAlertAt || l.lastLowStockAlertAt < oneDayAgo)
  );

  // Group by location & service
  const byLocation = new Map<string, typeof newlyLow>();
  for (const item of newlyLow) {
    const key = `${item.product.source}::${item.locationId}`;
    const list = byLocation.get(key) ?? [];
    list.push(item);
    byLocation.set(key, list);
  }

  for (const [, group] of Array.from(byLocation.entries())) {
    const first = group[0];
    const summaryText = group
      .map((g) => `• ${g.product.name} (${g.product.sku}): ${Number(g.qty)} left (min ${g.product.lowStockAt})`)
      .join("\n");

    await prisma.stockLevel.updateMany({
      where: { id: { in: group.map((g) => g.id) } },
      data: { lastLowStockAlertAt: now },
    });

    await logActivity(prisma, {
      source: first.product.source,
      locationId: first.locationId,
      action: ActivityAction.SYSTEM_LOW_STOCK,
      entityType: "Location",
      entityId: first.locationId,
      summary: `Low stock alert at ${first.location.name}: ${group.length} product(s) below threshold`,
    });

    await notify({
      roles: [Role.STOREKEEPER, Role.SERVICE_MANAGER],
      source: first.product.source,
      title: `Low Stock Alert — ${first.location.name}`,
      body: `${group.length} product(s) are at or below reorder level.`,
      entityType: "Location",
      entityId: first.locationId,
      channels: ["IN_APP", "EMAIL"],
      templateKey: "low-stock-alert",
      templateVars: {
        locationName: first.location.name,
        itemsSummary: summaryText,
      },
    });
  }

  return { scanned: levels.length, alertedCount: newlyLow.length };
}

/**
 * Emails Super Admin + Service Managers a per-service daily summary (§14).
 */
export async function runDailySummary() {
  const todayStr = toLagosDateString();
  const from = lagosStartOfDayUTC(todayStr);
  const to = lagosEndOfDayUTC(todayStr);

  const [salesBySvc, bookingsCount, visitsCount, managers] = await Promise.all([
    prisma.sale.groupBy({
      by: ["source"],
      where: {
        isParked: false,
        status: { not: SaleStatus.VOID },
        createdAt: { gte: from, lte: to },
      },
      _sum: { totalKobo: true },
      _count: true,
    }),
    prisma.booking.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.visit.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.user.findMany({
      where: {
        isActive: true,
        roles: { hasSome: [Role.SUPER_ADMIN, Role.SERVICE_MANAGER] },
      },
    }),
  ]);

  let sentCount = 0;
  for (const mgr of managers) {
    const isSA = mgr.roles.includes(Role.SUPER_ADMIN);
    const services = isSA ? Object.values(ServiceSlug) : mgr.serviceAccess;
    const lines: string[] = [];

    for (const svc of services) {
      const s = salesBySvc.find((r) => r.source === svc);
      if (s) {
        lines.push(`${svc}: ${s._count} sale(s) totaling ${formatNGN(s._sum.totalKobo ?? 0)}`);
      }
      if (svc === ServiceSlug.APARTMENTS) {
        lines.push(`APARTMENTS: ${bookingsCount} new booking(s) today`);
      }
      if (svc === ServiceSlug.VISITORS) {
        lines.push(`VISITORS: ${visitsCount} visit(s) recorded today`);
      }
    }

    const summaryBody = lines.length > 0 ? lines.join("\n") : "No transactional activity recorded today.";
    const primarySvc = services[0] ?? ServiceSlug.BILLSTACKS;
    const rendered = renderEmailTemplate("daily-summary", primarySvc, {
      managerName: `${mgr.firstName} ${mgr.lastName}`,
      date: todayStr,
      summaryBody,
    });

    await sendEmail({ to: mgr.email, ...rendered });
    sentCount++;
  }

  await logActivity(prisma, {
    source: ServiceSlug.BILLSTACKS,
    action: ActivityAction.SYSTEM_DAILY_SUMMARY,
    entityType: "Cron",
    entityId: todayStr,
    summary: `Sent daily summary for ${todayStr} to ${sentCount} manager(s)`,
  });

  return { date: todayStr, sentCount };
}
