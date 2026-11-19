// ---------------------------------------------------------------------------
// Zino One — Exports Service (CSV / Excel / PDF) (§13)
// Every export includes a Source column.
// CSV: UTF-8 with BOM. Excel: multi-sheet exceljs. PDF: pdfkit (max 5,000 rows).
// ---------------------------------------------------------------------------

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { BusinessError } from "../errors";
import { getEffectiveServices, getServiceLabelMap, type ServiceContext } from "../scope";
import { parseCsvServices, parseCsvStrings } from "../validators/common";
import { formatNGN } from "../money";
import { formatDateOnly, lagosEndOfDayUTC, lagosStartOfDayUTC, toLagosDateString } from "../dates";
import { PLATFORM_NAME } from "../constants";

export interface ExportRow {
  Source: string;
  [key: string]: string | number;
}

const MAX_SYNC_ROWS = 10_000;
const MAX_PDF_ROWS = 5_000;

/**
 * Pure CSV builder with UTF-8 BOM and RFC-4180 quoting (§13).
 */
export function buildCsvBuffer(
  title: string,
  headers: string[],
  rows: ExportRow[],
  filterSummary: string
): Buffer {
  const escapeCell = (val: unknown): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [
    escapeCell(`${PLATFORM_NAME} — ${title}`),
    escapeCell(`Filters: ${filterSummary || "None"} | Generated: ${new Date().toISOString()} (Africa/Lagos)`),
    "",
    headers.map(escapeCell).join(","),
    ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(",")),
  ];

  // UTF-8 BOM (\uFEFF) so Excel opens ₦ correctly (§13)
  return Buffer.from("\uFEFF" + lines.join("\r\n"), "utf8");
}

export async function buildExcelBuffer(
  title: string,
  headers: string[],
  rows: ExportRow[],
  filterSummary: string
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = PLATFORM_NAME;
  wb.created = new Date();

  const summarySheet = wb.addWorksheet("Summary");
  summarySheet.addRow([`${PLATFORM_NAME} — ${title}`]);
  summarySheet.addRow([`Filters: ${filterSummary || "None"}`]);
  summarySheet.addRow([`Generated: ${new Date().toISOString()} (Africa/Lagos)`]);
  summarySheet.addRow([`Total Rows: ${rows.length}`]);
  summarySheet.addRow([]);

  const grouped = new Map<string, ExportRow[]>();
  for (const r of rows) {
    const key = r.Source || "Shared";
    const list = grouped.get(key) ?? [];
    list.push(r);
    grouped.set(key, list);
  }

  summarySheet.addRow(["Service", "Row Count"]);
  for (const [svc, svcRows] of Array.from(grouped.entries())) {
    summarySheet.addRow([svc, svcRows.length]);
    const sheetName = svc.slice(0, 31).replace(/[\\/*?:[\]]/g, " ");
    const ws = wb.addWorksheet(sheetName || "Data");
    const hdrRow = ws.addRow(headers);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdrRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    for (const r of svcRows) {
      ws.addRow(headers.map((h) => r[h] ?? ""));
    }
  }

  if (grouped.size === 0) {
    const ws = wb.addWorksheet("Data");
    ws.addRow(headers);
  }

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

export async function buildPdfBuffer(
  title: string,
  headers: string[],
  rows: ExportRow[],
  filterSummary: string
): Promise<Buffer> {
  if (rows.length > MAX_PDF_ROWS) {
    throw new BusinessError(
      `PDF exports are limited to ${MAX_PDF_ROWS} rows. Please use CSV or Excel format for larger exports.`
    );
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(14).font("Helvetica-Bold").text(`${PLATFORM_NAME} — ${title}`);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Filters: ${filterSummary || "None"} · Generated: ${new Date().toISOString()} (Africa/Lagos)`);
    doc.moveDown(0.8);

    const colWidth = Math.floor((doc.page.width - 72) / Math.max(1, headers.length));

    // Header row
    const startY = doc.y;
    doc.rect(36, startY, doc.page.width - 72, 18).fill("#1E3A5F");
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(7.5);
    headers.forEach((h, idx) => {
      doc.text(h, 40 + idx * colWidth, startY + 5, { width: colWidth - 4, ellipsis: true });
    });
    doc.y = startY + 20;

    // Rows
    doc.font("Helvetica").fontSize(7.5);
    rows.forEach((row, rIdx) => {
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
      }
      const y = doc.y;
      if (rIdx % 2 === 1) {
        doc.rect(36, y, doc.page.width - 72, 16).fill("#F4F6FB");
      }
      doc.fillColor("#111827");
      headers.forEach((h, idx) => {
        doc.text(String(row[h] ?? ""), 40 + idx * colWidth, y + 4, {
          width: colWidth - 4,
          ellipsis: true,
        });
      });
      doc.y = y + 16;
    });

    // Page numbers footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(7)
        .fillColor("#6B7280")
        .text(
          `Page ${i + 1} of ${range.count} · ${PLATFORM_NAME}`,
          36,
          doc.page.height - 28,
          { align: "center", width: doc.page.width - 72 }
        );
    }

    doc.end();
  });
}

export async function generateExport(
  ctx: ServiceContext,
  input: {
    type: string;
    format: "csv" | "xlsx" | "pdf";
    filters: {
      service?: string;
      location?: string;
      from?: string;
      to?: string;
      status?: string;
      q?: string;
    };
  }
) {
  const allowedServices = getEffectiveServices(
    ctx.user,
    parseCsvServices(input.filters.service)
  );
  const locIds = parseCsvStrings(input.filters.location);
  const labelMap = await getServiceLabelMap();
  const fromDate = input.filters.from ? lagosStartOfDayUTC(input.filters.from) : undefined;
  const toDate = input.filters.to ? lagosEndOfDayUTC(input.filters.to) : undefined;

  let headers: string[] = [];
  let rows: ExportRow[] = [];

  if (input.type === "sales") {
    const data = await prisma.sale.findMany({
      where: {
        source: { in: allowedServices },
        ...(locIds ? { locationId: { in: locIds } } : {}),
        ...(fromDate || toDate ? { createdAt: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } } : {}),
      },
      include: { contact: true, location: true },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Receipt No", "Location", "Customer", "Total", "Paid", "Status", "Date"];
    rows = data.map((s) => ({
      Source: labelMap[s.source].name,
      "Receipt No": s.receiptNo,
      Location: s.location.name,
      Customer: s.contact?.name ?? "Walk-in",
      Total: formatNGN(s.totalKobo),
      Paid: formatNGN(s.paidKobo),
      Status: s.status,
      Date: s.createdAt.toISOString(),
    }));
  } else if (input.type === "invoices") {
    const data = await prisma.invoice.findMany({
      where: {
        source: { in: allowedServices },
        ...(fromDate || toDate ? { createdAt: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } } : {}),
      },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Invoice No", "Customer", "Total", "Status", "Due Date"];
    rows = data.map((inv) => ({
      Source: labelMap[inv.source].name,
      "Invoice No": inv.invoiceNo,
      Customer: inv.contact.name,
      Total: formatNGN(inv.totalKobo),
      Status: inv.status,
      "Due Date": inv.dueDate ? formatDateOnly(inv.dueDate) : "",
    }));
  } else if (input.type === "stock-alert") {
    const data = await prisma.stockLevel.findMany({
      where: {
        product: { source: { in: allowedServices }, status: "ACTIVE" },
        ...(locIds ? { locationId: { in: locIds } } : {}),
      },
      include: { product: true, location: true },
      orderBy: { qty: "asc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "SKU", "Product", "Location", "Qty", "Low Stock At"];
    rows = data
      .filter((l) => Number(l.qty) <= l.product.lowStockAt)
      .map((l) => ({
        Source: labelMap[l.product.source].name,
        SKU: l.product.sku,
        Product: l.product.name,
        Location: l.location.name,
        Qty: Number(l.qty),
        "Low Stock At": l.product.lowStockAt,
      }));
  } else if (input.type === "bookings") {
    const data = await prisma.booking.findMany({
      where: { source: { in: allowedServices } },
      include: { contact: true, roomType: true },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Ref", "Guest", "Room Type", "Check-In", "Check-Out", "Total", "Status"];
    rows = data.map((b) => ({
      Source: labelMap[b.source].name,
      Ref: b.ref,
      Guest: b.contact.name,
      "Room Type": b.roomType.name,
      "Check-In": formatDateOnly(b.checkIn),
      "Check-Out": formatDateOnly(b.checkOut),
      Total: formatNGN(b.totalKobo),
      Status: b.status,
    }));
  } else if (input.type === "orders") {
    const data = await prisma.order.findMany({
      where: { source: { in: allowedServices } },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Order No", "Customer", "Total", "Payment", "Status", "Date"];
    rows = data.map((o) => ({
      Source: labelMap[o.source].name,
      "Order No": o.orderNo,
      Customer: o.contact.name,
      Total: formatNGN(o.totalKobo),
      Payment: o.paymentStatus,
      Status: o.status,
      Date: o.createdAt.toISOString(),
    }));
  } else if (input.type === "visitors") {
    const data = await prisma.visit.findMany({
      where: { source: { in: allowedServices } },
      include: { contact: true, host: { include: { contact: true } } },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Visitor", "Host", "Purpose", "Check-In", "Check-Out", "Status"];
    rows = data.map((v) => ({
      Source: labelMap[v.source].name,
      Visitor: v.contact.name,
      Host: v.host?.contact.name ?? "",
      Purpose: v.purpose ?? "",
      "Check-In": v.checkInAt?.toISOString() ?? "",
      "Check-Out": v.checkOutAt?.toISOString() ?? "",
      Status: v.status,
    }));
  } else if (input.type === "attendance") {
    const data = await prisma.attendance.findMany({
      include: { employee: { include: { contact: true, department: true } } },
      orderBy: { date: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Employee", "Department", "Date", "Clock In", "Clock Out", "Status"];
    rows = data.map((a) => ({
      Source: labelMap[ServiceSlug.VISITORS].name,
      Employee: a.employee.contact.name,
      Department: a.employee.department?.name ?? "",
      Date: formatDateOnly(a.date),
      "Clock In": a.clockInAt?.toISOString() ?? "",
      "Clock Out": a.clockOutAt?.toISOString() ?? "",
      Status: a.status,
    }));
  } else if (input.type === "expenses") {
    const data = await prisma.expense.findMany({
      where: { source: { in: allowedServices } },
      include: { location: true },
      orderBy: { date: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Category", "Location", "Paid To", "Amount", "Date"];
    rows = data.map((e) => ({
      Source: labelMap[e.source].name,
      Category: e.category,
      Location: e.location?.name ?? "",
      "Paid To": e.paidTo ?? "",
      Amount: formatNGN(e.amountKobo),
      Date: e.date.toISOString(),
    }));
  } else if (input.type === "contacts") {
    const data = await prisma.contact.findMany({
      where: { sources: { hasSome: allowedServices } },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Name", "Phone", "Email", "Types"];
    rows = data.map((c) => ({
      Source: c.sources.map((s) => labelMap[s].shortName).join(", ") || "Shared",
      Name: c.name,
      Phone: c.phone ?? "",
      Email: c.email ?? "",
      Types: c.types.join(", "),
    }));
  } else {
    const data = await prisma.activityLog.findMany({
      where: { source: { in: allowedServices } },
      orderBy: { createdAt: "desc" },
      take: MAX_SYNC_ROWS + 1,
    });
    headers = ["Source", "Action", "Entity", "Summary", "Date"];
    rows = data.map((a) => ({
      Source: labelMap[a.source].name,
      Action: a.action,
      Entity: `${a.entityType}:${a.entityId}`,
      Summary: a.summary,
      Date: a.createdAt.toISOString(),
    }));
  }

  if (rows.length > MAX_SYNC_ROWS) {
    throw new BusinessError(
      `Export exceeds ${MAX_SYNC_ROWS} rows. Please narrow your date or service filters.`
    );
  }

  const filterSummary = Object.entries(input.filters)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  const title = input.type.replace(/-/g, " ").toUpperCase();
  const dateStamp = toLagosDateString();
  const filename = `zino-one-${input.type}-${dateStamp}.${input.format}`;

  let buffer: Buffer;
  let contentType: string;

  if (input.format === "csv") {
    buffer = buildCsvBuffer(title, headers, rows, filterSummary);
    contentType = "text/csv; charset=utf-8";
  } else if (input.format === "xlsx") {
    buffer = await buildExcelBuffer(title, headers, rows, filterSummary);
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    buffer = await buildPdfBuffer(title, headers, rows, filterSummary);
    contentType = "application/pdf";
  }

  return { buffer, contentType, filename };
}
