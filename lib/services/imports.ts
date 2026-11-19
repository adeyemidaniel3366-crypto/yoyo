// ---------------------------------------------------------------------------
// Zino One — Batched CSV Import Service (§5.7)
// Runs in transactions per batch of 200 rows; collects row errors without
// failing valid rows.
// ---------------------------------------------------------------------------

import { ContactType, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import type { ServiceContext } from "../scope";
import { toKobo } from "../money";
import { adjustStock } from "./inventory";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";

function parseCsvLines(csvText: string): Array<Record<string, string>> {
  const clean = csvText.replace(/^\uFEFF/, "").trim();
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitRow(lines[0]).map((h) => h.trim());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = splitRow(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function importProductsCsv(
  ctx: ServiceContext,
  source: ServiceSlug,
  csvText: string
) {
  const rows = parseCsvLines(csvText);
  const locations = await prisma.location.findMany({
    where: { services: { has: source } },
  });
  const locByName = new Map(locations.map((l) => [l.name.toLowerCase(), l.id]));

  let imported = 0;
  let skipped = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let offset = 0; offset < rows.length; offset += 200) {
    const batch = rows.slice(offset, offset + 200);
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < batch.length; i++) {
        const rowNum = offset + i + 2;
        const r = batch[i];
        const sku = r.sku?.trim();
        const name = r.name?.trim();
        const priceNum = Number(r.price);

        if (!sku || !name || !Number.isFinite(priceNum) || priceNum <= 0) {
          skipped++;
          errors.push({ row: rowNum, reason: "Missing or invalid sku, name, or price" });
          continue;
        }

        const costKobo = Number.isFinite(Number(r.cost)) ? toKobo(r.cost || "0") : 0;
        const priceKobo = toKobo(r.price);
        const lowStockAt = Number.isFinite(Number(r.lowStockAt))
          ? Math.max(0, Math.trunc(Number(r.lowStockAt)))
          : 5;

        const existing = await tx.product.findUnique({ where: { sku } });
        if (existing) {
          skipped++;
          errors.push({ row: rowNum, reason: `Duplicate SKU ${sku}` });
          continue;
        }

        const slug = `${slugify(name)}-${slugify(sku)}`;
        const product = await tx.product.create({
          data: {
            sku,
            slug,
            name,
            source,
            unit: r.unit?.trim() || "pcs",
            costKobo,
            priceKobo,
            lowStockAt,
            status: "ACTIVE",
          },
        });

        // Any column matching a location name sets initial stock
        for (const [col, val] of Object.entries(r)) {
          const locId = locByName.get(col.toLowerCase());
          const qty = Number(val);
          if (locId && Number.isFinite(qty) && qty > 0) {
            await adjustStock(tx, {
              productId: product.id,
              locationId: locId,
              qtyChange: qty,
              reason: "CSV_IMPORT",
              refType: "Import",
              refId: product.id,
              actorId: ctx.user.id,
            });
          }
        }

        imported++;
      }
    });
  }

  await logActivity(prisma, {
    source,
    actorId: ctx.user.id,
    action: ActivityAction.PRODUCTS_IMPORTED,
    entityType: "Product",
    entityId: source,
    summary: `Imported ${imported} product(s) into ${source} (${skipped} skipped)`,
  });

  return { imported, skipped, errors };
}

export async function importContactsCsv(
  ctx: ServiceContext,
  source: ServiceSlug,
  csvText: string
) {
  const rows = parseCsvLines(csvText);
  let imported = 0;
  let skipped = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let offset = 0; offset < rows.length; offset += 200) {
    const batch = rows.slice(offset, offset + 200);
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < batch.length; i++) {
        const rowNum = offset + i + 2;
        const r = batch[i];
        const name = r.name?.trim();
        const phone = r.phone?.trim() || null;
        const email = r.email?.trim().toLowerCase() || null;

        if (!name) {
          skipped++;
          errors.push({ row: rowNum, reason: "Missing contact name" });
          continue;
        }

        if (phone) {
          const dup = await tx.contact.findUnique({ where: { phone } });
          if (dup) {
            skipped++;
            errors.push({ row: rowNum, reason: `Duplicate phone ${phone} — skipped` });
            continue;
          }
        }

        const rawTypes = (r.types || "CUSTOMER")
          .split(/[;|]/)
          .map((t) => t.trim().toUpperCase())
          .filter((t) => Object.values(ContactType).includes(t as ContactType)) as ContactType[];

        await tx.contact.create({
          data: {
            name,
            phone,
            email,
            address: r.address?.trim() || null,
            types: rawTypes.length > 0 ? rawTypes : [ContactType.CUSTOMER],
            sources: [source],
          },
        });
        imported++;
      }
    });
  }

  await logActivity(prisma, {
    source,
    actorId: ctx.user.id,
    action: ActivityAction.CONTACTS_IMPORTED,
    entityType: "Contact",
    entityId: source,
    summary: `Imported ${imported} contact(s) (${skipped} skipped)`,
  });

  return { imported, skipped, errors };
}
