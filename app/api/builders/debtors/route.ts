import { SaleStatus, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addKobo, formatNGN, subKobo } from "@/lib/money";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BUILDERS);

  const unpaidSales = await prisma.sale.findMany({
    where: {
      source: ServiceSlug.BUILDERS,
      status: { in: [SaleStatus.UNPAID, SaleStatus.PART_PAID] },
      contactId: { not: null },
    },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
  });

  const byContact = new Map<
    string,
    { contactId: string; name: string; phone: string | null; balanceKobo: number; saleCount: number; source: ServiceSlug }
  >();

  for (const s of unpaidSales) {
    if (!s.contactId || !s.contact) continue;
    const due = subKobo(s.totalKobo, s.paidKobo);
    const prev = byContact.get(s.contactId);
    if (prev) {
      prev.balanceKobo = addKobo(prev.balanceKobo, due);
      prev.saleCount += 1;
    } else {
      byContact.set(s.contactId, {
        contactId: s.contactId,
        name: s.contact.name,
        phone: s.contact.phone,
        balanceKobo: due,
        saleCount: 1,
        source: ServiceSlug.BUILDERS,
      });
    }
  }

  const rows = await withSourceLabels(
    Array.from(byContact.values()).map((r) => ({
      ...r,
      balanceDisplay: formatNGN(r.balanceKobo),
    }))
  );

  return ok(rows, 200, requestId);
});
