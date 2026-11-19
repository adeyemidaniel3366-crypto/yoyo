// ---------------------------------------------------------------------------
// Zino One — Global Scoped Search (§10.5 of main spec, §5.4)
// ---------------------------------------------------------------------------

import { ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { getEffectiveServices, withSourceLabels, type ServiceContext } from "../scope";
import { formatNGN } from "../money";

export async function globalSearch(ctx: ServiceContext, query: string) {
  const q = query.trim();
  if (!q) {
    return {
      contacts: [],
      products: [],
      sales: [],
      invoices: [],
      bookings: [],
      orders: [],
      visits: [],
    };
  }

  const allowed = getEffectiveServices(ctx.user);

  const [contacts, products, sales, invoices, bookings, orders, visits] =
    await Promise.all([
      prisma.contact.findMany({
        where: {
          OR: [
            { sources: { hasSome: allowed } },
            { sources: { isEmpty: true } },
          ],
          AND: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        take: 10,
      }),
      prisma.product.findMany({
        where: {
          source: { in: allowed },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.sale.findMany({
        where: {
          source: { in: allowed },
          OR: [
            { receiptNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: { select: { name: true } } },
        take: 10,
      }),
      prisma.invoice.findMany({
        where: {
          source: { in: allowed },
          OR: [
            { invoiceNo: { contains: q, mode: "insensitive" } },
            { contact: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { contact: { select: { name: true } } },
        take: 10,
      }),
      allowed.includes(ServiceSlug.APARTMENTS)
        ? prisma.booking.findMany({
            where: {
              OR: [
                { ref: { contains: q, mode: "insensitive" } },
                { contact: { name: { contains: q, mode: "insensitive" } } },
              ],
            },
            include: { contact: { select: { name: true } }, roomType: { select: { name: true } } },
            take: 10,
          })
        : Promise.resolve([]),
      allowed.includes(ServiceSlug.GALAXY)
        ? prisma.order.findMany({
            where: {
              OR: [
                { orderNo: { contains: q, mode: "insensitive" } },
                { contact: { name: { contains: q, mode: "insensitive" } } },
              ],
            },
            include: { contact: { select: { name: true } } },
            take: 10,
          })
        : Promise.resolve([]),
      allowed.includes(ServiceSlug.VISITORS)
        ? prisma.visit.findMany({
            where: {
              OR: [
                { purpose: { contains: q, mode: "insensitive" } },
                { contact: { name: { contains: q, mode: "insensitive" } } },
              ],
            },
            include: { contact: { select: { name: true } } },
            take: 10,
          })
        : Promise.resolve([]),
    ]);

  return {
    contacts,
    products: await withSourceLabels(
      products.map((p) => ({ ...p, priceDisplay: formatNGN(p.priceKobo) }))
    ),
    sales: await withSourceLabels(
      sales.map((s) => ({ ...s, totalDisplay: formatNGN(s.totalKobo) }))
    ),
    invoices: await withSourceLabels(
      invoices.map((i) => ({ ...i, totalDisplay: formatNGN(i.totalKobo) }))
    ),
    bookings: await withSourceLabels(
      bookings.map((b) => ({ ...b, totalDisplay: formatNGN(b.totalKobo) }))
    ),
    orders: await withSourceLabels(
      orders.map((o) => ({ ...o, totalDisplay: formatNGN(o.totalKobo) }))
    ),
    visits: await withSourceLabels(visits),
  };
}
