// ---------------------------------------------------------------------------
// Zino One — Invoicing, Estimates, Recurring, Payments, Expenses & POs (§9.2)
// ---------------------------------------------------------------------------

import {
  EstimateStatus,
  InvoiceStatus,
  PaymentStatus,
  Prisma,
  PurchaseOrderStatus,
  Role,
  ServiceSlug,
} from "@prisma/client";
import { prisma } from "../prisma";
import {
  BusinessError,
  ConflictError,
  NotFoundError,
} from "../errors";
import {
  assertRecordInScope,
  scopeWhere,
  withSourceLabel,
  withSourceLabels,
  type ServiceContext,
} from "../scope";
import { addKobo, calcTaxKobo, formatNGN, lineTotalKobo, subKobo } from "../money";
import { advanceRecurringDate } from "../dates";
import { formatSeq, nextNumber } from "./numbering";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import {
  generatePaymentReference,
  initializePayment,
  type PaymentGateway,
} from "../payments";
import { adjustStock } from "./inventory";
import { getEnv } from "../env";

export function deriveInvoiceStatus(
  totalKobo: number,
  paidKobo: number,
  currentStatus: InvoiceStatus
): InvoiceStatus {
  if (currentStatus === InvoiceStatus.CANCELLED) return InvoiceStatus.CANCELLED;
  if (paidKobo >= totalKobo) return InvoiceStatus.PAID;
  if (paidKobo > 0) return InvoiceStatus.PART_PAID;
  return currentStatus === InvoiceStatus.OVERDUE
    ? InvoiceStatus.OVERDUE
    : currentStatus;
}

export interface InvoiceItemInput {
  productId?: string | null;
  description: string;
  qty: number;
  unitPriceKobo: number;
  taxRatePct?: number;
}

function computeInvoiceTotals(items: InvoiceItemInput[], discountKobo = 0) {
  let subtotalKobo = 0;
  let taxKobo = 0;

  const computedItems = items.map((item) => {
    const total = lineTotalKobo(item.qty, item.unitPriceKobo);
    const tax = calcTaxKobo(total, item.taxRatePct ?? 0);
    subtotalKobo = addKobo(subtotalKobo, total);
    taxKobo = addKobo(taxKobo, tax);
    return {
      productId: item.productId ?? null,
      description: item.description,
      qty: new Prisma.Decimal(item.qty),
      unitPriceKobo: item.unitPriceKobo,
      totalKobo: total,
    };
  });

  if (discountKobo > subtotalKobo) {
    throw new BusinessError("Discount cannot exceed subtotal");
  }

  const totalKobo = addKobo(subKobo(subtotalKobo, discountKobo), taxKobo);
  return { subtotalKobo, taxKobo, totalKobo, computedItems };
}

export async function createInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    contactId: string;
    items: InvoiceItemInput[];
    discountKobo?: number;
    dueDate?: string | null;
    isRecurring?: boolean;
    recurringId?: string | null;
  }
) {
  const { subtotalKobo, taxKobo, totalKobo, computedItems } = computeInvoiceTotals(
    input.items,
    input.discountKobo ?? 0
  );

  const invoice = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.findUnique({ where: { id: input.contactId } });
    if (!contact) throw new NotFoundError("Contact not found");

    const seq = await nextNumber(tx, `INV-${source}`);
    const invoiceNo = formatSeq("INV", seq, 6);

    const created = await tx.invoice.create({
      data: {
        source,
        invoiceNo,
        contactId: input.contactId,
        subtotalKobo,
        discountKobo: input.discountKobo ?? 0,
        taxKobo,
        totalKobo,
        status: InvoiceStatus.DRAFT,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        isRecurring: input.isRecurring ?? false,
        recurringId: input.recurringId ?? null,
        items: { create: computedItems },
      },
      include: { items: true, contact: true, payments: true },
    });

    if (!contact.sources.includes(source)) {
      await tx.contact.update({
        where: { id: contact.id },
        data: { sources: { push: source } },
      });
    }

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.INVOICE_CREATED,
      entityType: "Invoice",
      entityId: created.id,
      summary: `Created invoice ${invoiceNo} for ${contact.name} (${formatNGN(totalKobo)})`,
      amountKobo: totalKobo,
    });

    return created;
  });

  return withSourceLabel({
    ...invoice,
    totalDisplay: formatNGN(invoice.totalKobo),
  });
}

export async function updateInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string,
  input: {
    items?: InvoiceItemInput[];
    discountKobo?: number;
    dueDate?: string | null;
  }
) {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    await assertRecordInScope(ctx, existing, "Invoice");
    if (!existing || existing.source !== source) throw new NotFoundError("Invoice not found");
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BusinessError("Only DRAFT invoices can be edited");
    }

    const discountKobo = input.discountKobo ?? existing.discountKobo;
    let totals = {
      subtotalKobo: existing.subtotalKobo,
      taxKobo: existing.taxKobo,
      totalKobo: existing.totalKobo,
    };

    if (input.items) {
      const computed = computeInvoiceTotals(input.items, discountKobo);
      totals = {
        subtotalKobo: computed.subtotalKobo,
        taxKobo: computed.taxKobo,
        totalKobo: computed.totalKobo,
      };
      await tx.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
      await tx.invoiceItem.createMany({
        data: computed.computedItems.map((it) => ({ ...it, invoiceId: existing.id })),
      });
    }

    const inv = await tx.invoice.update({
      where: { id: existing.id },
      data: {
        ...totals,
        discountKobo,
        ...(input.dueDate !== undefined
          ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
          : {}),
      },
      include: { items: true, contact: true, payments: true },
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.INVOICE_UPDATED,
      entityType: "Invoice",
      entityId: inv.id,
      summary: `Updated invoice ${inv.invoiceNo} (${formatNGN(inv.totalKobo)})`,
      amountKobo: inv.totalKobo,
    });

    return inv;
  });

  return withSourceLabel({
    ...updated,
    totalDisplay: formatNGN(updated.totalKobo),
  });
}

export async function sendInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string
) {
  const inv = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { id },
      include: { contact: true, items: true },
    });
    await assertRecordInScope(ctx, existing, "Invoice");
    if (!existing || existing.source !== source) throw new NotFoundError("Invoice not found");
    if (existing.status === InvoiceStatus.CANCELLED) {
      throw new BusinessError("Cannot send a cancelled invoice");
    }

    const updated = await tx.invoice.update({
      where: { id: existing.id },
      data: {
        status: existing.status === InvoiceStatus.DRAFT ? InvoiceStatus.SENT : existing.status,
        sentAt: new Date(),
      },
      include: { contact: true, items: true },
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.INVOICE_SENT,
      entityType: "Invoice",
      entityId: updated.id,
      summary: `Sent invoice ${updated.invoiceNo} to ${updated.contact.name}`,
      amountKobo: updated.totalKobo,
    });

    return updated;
  });

  if (inv.contact.email) {
    const rendered = renderEmailTemplate("invoice-sent", source, {
      contactName: inv.contact.name,
      invoiceNo: inv.invoiceNo,
      totalDisplay: formatNGN(inv.totalKobo),
      dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : "On receipt",
      link: `${getEnv().NEXTAUTH_URL}/admin/billstacks`,
    });
    void sendEmail({ to: inv.contact.email, ...rendered });
  }

  return withSourceLabel({ ...inv, totalDisplay: formatNGN(inv.totalKobo) });
}

export async function recordInvoicePayment(
  ctx: ServiceContext,
  source: ServiceSlug,
  invoiceId: string,
  input: {
    amountKobo: number;
    method: string;
    reference?: string | null;
    note?: string | null;
  }
) {
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true, contact: true },
    });
    await assertRecordInScope(ctx, invoice, "Invoice");
    if (!invoice || invoice.source !== source) throw new NotFoundError("Invoice not found");
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BusinessError("Cannot record payment on a cancelled invoice");
    }

    const alreadyPaid = invoice.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((acc, p) => addKobo(acc, p.amountKobo), 0);

    const balance = subKobo(invoice.totalKobo, alreadyPaid);
    if (input.amountKobo > balance) {
      throw new ConflictError(
        `Payment of ${formatNGN(input.amountKobo)} exceeds remaining balance of ${formatNGN(balance)}`
      );
    }

    const payment = await tx.payment.create({
      data: {
        source,
        contactId: invoice.contactId,
        invoiceId: invoice.id,
        amountKobo: input.amountKobo,
        method: input.method,
        reference: input.reference ?? null,
        status: PaymentStatus.PAID,
        receivedById: ctx.user.id,
        note: input.note ?? null,
      },
    });

    const newPaidTotal = addKobo(alreadyPaid, input.amountKobo);
    const nextStatus = deriveInvoiceStatus(invoice.totalKobo, newPaidTotal, invoice.status);

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: nextStatus },
      include: { contact: true, payments: true },
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action:
        nextStatus === InvoiceStatus.PAID
          ? ActivityAction.INVOICE_PAID
          : ActivityAction.PAYMENT_RECORDED,
      entityType: "Invoice",
      entityId: invoice.id,
      summary: `Recorded ${formatNGN(input.amountKobo)} payment on invoice ${invoice.invoiceNo} (${nextStatus})`,
      amountKobo: input.amountKobo,
    });

    return { payment, invoice: updatedInvoice };
  });

  if (result.invoice.contact.email) {
    const rendered = renderEmailTemplate("payment-receipt", source, {
      contactName: result.invoice.contact.name,
      amountDisplay: formatNGN(input.amountKobo),
      method: input.method,
      reference: result.payment.reference ?? result.payment.id,
    });
    void sendEmail({ to: result.invoice.contact.email, ...rendered });
  }

  return withSourceLabel({
    ...result.invoice,
    payment: result.payment,
    totalDisplay: formatNGN(result.invoice.totalKobo),
  });
}

export async function createInvoicePaymentLink(
  ctx: ServiceContext,
  source: ServiceSlug,
  invoiceId: string,
  options: { gateway?: PaymentGateway; callbackUrl?: string }
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { contact: true, payments: true },
  });
  await assertRecordInScope(ctx, invoice, "Invoice");
  if (!invoice || invoice.source !== source) throw new NotFoundError("Invoice not found");
  if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
    throw new BusinessError("Invoice cannot accept payment");
  }

  const paid = invoice.payments
    .filter((p) => p.status === PaymentStatus.PAID)
    .reduce((acc, p) => addKobo(acc, p.amountKobo), 0);
  const outstanding = subKobo(invoice.totalKobo, paid);
  if (outstanding <= 0) {
    throw new BusinessError("Invoice has no outstanding balance");
  }

  const reference = generatePaymentReference(source);
  const init = await initializePayment(
    {
      amountKobo: outstanding,
      email: invoice.contact.email ?? "billing@zinoone.com",
      reference,
      callbackUrl: options.callbackUrl,
      metadata: { invoiceId: invoice.id, invoiceNo: invoice.invoiceNo, source },
    },
    options.gateway
  );

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { paymentRef: reference },
    });
    await tx.payment.create({
      data: {
        source,
        contactId: invoice.contactId,
        invoiceId: invoice.id,
        amountKobo: outstanding,
        method: "ONLINE",
        reference,
        gateway: init.gateway,
        status: PaymentStatus.PENDING,
        receivedById: ctx.user.id,
        note: `Payment link for ${invoice.invoiceNo}`,
      },
    });
  });

  if (invoice.contact.email) {
    const rendered = renderEmailTemplate("invoice-payment-link", source, {
      contactName: invoice.contact.name,
      invoiceNo: invoice.invoiceNo,
      totalDisplay: formatNGN(outstanding),
      paymentUrl: init.authorizationUrl,
    });
    void sendEmail({ to: invoice.contact.email, ...rendered });
  }

  return {
    authorizationUrl: init.authorizationUrl,
    reference: init.reference,
    gateway: init.gateway,
    amountKobo: outstanding,
    amountDisplay: formatNGN(outstanding),
  };
}

export async function cancelInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({ where: { id } });
    await assertRecordInScope(ctx, existing, "Invoice");
    if (!existing || existing.source !== source) throw new NotFoundError("Invoice not found");
    if (existing.status === InvoiceStatus.PAID) {
      throw new BusinessError("Paid invoices cannot be cancelled; issue a refund instead");
    }
    const updated = await tx.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.INVOICE_CANCELLED,
      entityType: "Invoice",
      entityId: id,
      summary: `Cancelled invoice ${existing.invoiceNo}`,
    });
    return withSourceLabel(updated);
  });
}

export async function createEstimate(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: { contactId: string; items: InvoiceItemInput[]; validUntil?: string | null }
) {
  const { subtotalKobo, taxKobo, totalKobo } = computeInvoiceTotals(input.items, 0);
  const est = await prisma.$transaction(async (tx) => {
    const seq = await nextNumber(tx, `EST-${source}`);
    const estimateNo = formatSeq("EST", seq, 6);
    const created = await tx.estimate.create({
      data: {
        source,
        estimateNo,
        contactId: input.contactId,
        items: input.items as unknown as Prisma.InputJsonValue,
        subtotalKobo,
        taxKobo,
        totalKobo,
        status: EstimateStatus.DRAFT,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
      },
    });
    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.ESTIMATE_CREATED,
      entityType: "Estimate",
      entityId: created.id,
      summary: `Created estimate ${estimateNo} (${formatNGN(totalKobo)})`,
      amountKobo: totalKobo,
    });
    return created;
  });
  return withSourceLabel({ ...est, totalDisplay: formatNGN(est.totalKobo) });
}

export async function convertEstimateToInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  estimateId: string
) {
  const estimate = await prisma.estimate.findUnique({ where: { id: estimateId } });
  await assertRecordInScope(ctx, estimate, "Estimate");
  if (!estimate || estimate.source !== source) throw new NotFoundError("Estimate not found");
  if (estimate.status === EstimateStatus.CONVERTED) {
    throw new ConflictError("Estimate has already been converted");
  }

  const items = (estimate.items as unknown as InvoiceItemInput[]) ?? [];
  const invoice = await createInvoice(ctx, source, {
    contactId: estimate.contactId,
    items,
  });

  await prisma.$transaction(async (tx) => {
    await tx.estimate.update({
      where: { id: estimate.id },
      data: {
        status: EstimateStatus.CONVERTED,
        convertedInvoiceId: invoice.id,
      },
    });
    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.ESTIMATE_CONVERTED,
      entityType: "Estimate",
      entityId: estimate.id,
      summary: `Converted estimate ${estimate.estimateNo} to invoice ${invoice.invoiceNo}`,
    });
  });

  return invoice;
}

export async function createRecurringInvoice(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    contactId: string;
    frequency: string;
    nextRunAt: string;
    template: Record<string, unknown>;
  }
) {
  const rec = await prisma.$transaction(async (tx) => {
    const created = await tx.recurringInvoice.create({
      data: {
        source,
        contactId: input.contactId,
        frequency: input.frequency,
        nextRunAt: new Date(input.nextRunAt),
        template: input.template as Prisma.InputJsonValue,
        isActive: true,
      },
    });
    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.RECURRING_CREATED,
      entityType: "RecurringInvoice",
      entityId: created.id,
      summary: `Created ${input.frequency} recurring invoice schedule`,
    });
    return created;
  });
  return withSourceLabel(rec);
}

export async function togglePauseRecurring(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string
) {
  const existing = await prisma.recurringInvoice.findUnique({ where: { id } });
  await assertRecordInScope(ctx, existing, "RecurringInvoice");
  if (!existing || existing.source !== source) throw new NotFoundError("Recurring invoice not found");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.recurringInvoice.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.RECURRING_PAUSED,
      entityType: "RecurringInvoice",
      entityId: id,
      summary: `${next.isActive ? "Resumed" : "Paused"} recurring invoice ${id}`,
    });
    return next;
  });
  return withSourceLabel(updated);
}

/**
 * Cron job: create due recurring invoices (§14).
 */
export async function runDueRecurringInvoices() {
  const now = new Date();
  const dueList = await prisma.recurringInvoice.findMany({
    where: { isActive: true, nextRunAt: { lte: now } },
  });

  let createdCount = 0;
  for (const rec of dueList) {
    const tpl = rec.template as {
      items?: InvoiceItemInput[];
      discountKobo?: number;
      dueDays?: number;
      autoSend?: boolean;
    };
    const items = tpl.items ?? [];
    if (items.length === 0) continue;

    const { subtotalKobo, taxKobo, totalKobo, computedItems } = computeInvoiceTotals(
      items,
      tpl.discountKobo ?? 0
    );

    const dueDate = new Date(now.getTime() + (tpl.dueDays ?? 14) * 86400_000);

    const inv = await prisma.$transaction(async (tx) => {
      const seq = await nextNumber(tx, `INV-${rec.source}`);
      const invoiceNo = formatSeq("INV", seq, 6);
      const created = await tx.invoice.create({
        data: {
          source: rec.source,
          invoiceNo,
          contactId: rec.contactId,
          subtotalKobo,
          discountKobo: tpl.discountKobo ?? 0,
          taxKobo,
          totalKobo,
          status: tpl.autoSend ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
          sentAt: tpl.autoSend ? now : null,
          dueDate,
          isRecurring: true,
          recurringId: rec.id,
          items: { create: computedItems },
        },
        include: { contact: true },
      });

      await tx.recurringInvoice.update({
        where: { id: rec.id },
        data: { nextRunAt: advanceRecurringDate(rec.nextRunAt, rec.frequency) },
      });

      await logActivity(tx, {
        source: rec.source,
        action: ActivityAction.INVOICE_CREATED,
        entityType: "Invoice",
        entityId: created.id,
        summary: `Auto-generated recurring invoice ${invoiceNo} (${formatNGN(totalKobo)})`,
        amountKobo: totalKobo,
      });

      return created;
    });

    if (tpl.autoSend && inv.contact.email) {
      const rendered = renderEmailTemplate("invoice-sent", rec.source, {
        contactName: inv.contact.name,
        invoiceNo: inv.invoiceNo,
        totalDisplay: formatNGN(inv.totalKobo),
        dueDate: dueDate.toISOString().slice(0, 10),
        link: `${getEnv().NEXTAUTH_URL}/admin/billstacks`,
      });
      void sendEmail({ to: inv.contact.email, ...rendered });
    }
    createdCount++;
  }

  return { processed: dueList.length, createdCount };
}

/**
 * Cron job: mark overdue invoices & queue 7/14/30-day reminders (§9.2, §14).
 */
export async function markOverdueInvoices() {
  const now = new Date();
  const candidates = await prisma.invoice.findMany({
    where: {
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.PART_PAID, InvoiceStatus.OVERDUE] },
      dueDate: { lt: now },
    },
    include: { contact: true, payments: true },
  });

  let markedCount = 0;
  let remindedCount = 0;

  for (const inv of candidates) {
    if (inv.status !== InvoiceStatus.OVERDUE) {
      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: inv.id },
          data: { status: InvoiceStatus.OVERDUE },
        });
        await logActivity(tx, {
          source: inv.source,
          action: ActivityAction.INVOICE_OVERDUE,
          entityType: "Invoice",
          entityId: inv.id,
          summary: `Invoice ${inv.invoiceNo} marked OVERDUE`,
          amountKobo: inv.totalKobo,
        });
      });
      markedCount++;
    }

    if (inv.dueDate) {
      const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400_000);
      if (daysOverdue === 7 || daysOverdue === 14 || daysOverdue === 30) {
        const paid = inv.payments
          .filter((p) => p.status === PaymentStatus.PAID)
          .reduce((a, p) => addKobo(a, p.amountKobo), 0);
        const balance = Math.max(0, subKobo(inv.totalKobo, paid));

        if (inv.contact.email) {
          const rendered = renderEmailTemplate("payment-reminder", inv.source, {
            contactName: inv.contact.name,
            invoiceNo: inv.invoiceNo,
            balanceDisplay: formatNGN(balance),
            daysOverdue,
          });
          void sendEmail({ to: inv.contact.email, ...rendered });
        }

        void notify({
          roles: [Role.ACCOUNTANT, Role.SERVICE_MANAGER],
          source: inv.source,
          title: `Overdue Invoice (${daysOverdue}d) — ${inv.invoiceNo}`,
          body: `${inv.contact.name} owes ${formatNGN(balance)} on ${inv.invoiceNo}.`,
          entityType: "Invoice",
          entityId: inv.id,
          channels: ["IN_APP"],
        });
        remindedCount++;
      }
    }
  }

  return { checked: candidates.length, markedCount, remindedCount };
}

export async function createExpense(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    locationId?: string | null;
    category: string;
    amountKobo: number;
    paidTo?: string | null;
    receiptUrl?: string | null;
    note?: string | null;
    date?: string;
  }
) {
  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        source,
        locationId: input.locationId ?? null,
        category: input.category,
        amountKobo: input.amountKobo,
        paidTo: input.paidTo ?? null,
        receiptUrl: input.receiptUrl ?? null,
        note: input.note ?? null,
        createdById: ctx.user.id,
        date: input.date ? new Date(input.date) : new Date(),
      },
      include: { location: true },
    });

    await logActivity(tx, {
      source,
      locationId: input.locationId ?? null,
      actorId: ctx.user.id,
      action: ActivityAction.EXPENSE_RECORDED,
      entityType: "Expense",
      entityId: created.id,
      summary: `Recorded ${input.category} expense of ${formatNGN(input.amountKobo)}${input.paidTo ? ` to ${input.paidTo}` : ""}`,
      amountKobo: -input.amountKobo,
    });

    return created;
  });

  return withSourceLabel({ ...expense, amountDisplay: formatNGN(expense.amountKobo) });
}

export async function createPurchaseOrder(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    contactId: string;
    expectedAt?: string | null;
    note?: string | null;
    items: Array<{ productId: string; qty: number; unitCostKobo: number }>;
  }
) {
  let totalKobo = 0;
  const itemsData = input.items.map((it) => {
    const line = lineTotalKobo(it.qty, it.unitCostKobo);
    totalKobo = addKobo(totalKobo, line);
    return {
      productId: it.productId,
      qty: new Prisma.Decimal(it.qty),
      unitCostKobo: it.unitCostKobo,
      totalKobo: line,
    };
  });

  const po = await prisma.$transaction(async (tx) => {
    const seq = await nextNumber(tx, `PO-${source}`);
    const poNo = formatSeq("PO", seq, 6);
    const created = await tx.purchaseOrder.create({
      data: {
        source,
        poNo,
        contactId: input.contactId,
        totalKobo,
        status: PurchaseOrderStatus.SENT,
        expectedAt: input.expectedAt ? new Date(input.expectedAt) : null,
        note: input.note ?? null,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.PO_CREATED,
      entityType: "PurchaseOrder",
      entityId: created.id,
      summary: `Created purchase order ${poNo} (${formatNGN(totalKobo)})`,
      amountKobo: totalKobo,
    });

    return created;
  });

  return withSourceLabel({ ...po, totalDisplay: formatNGN(po.totalKobo) });
}

export async function receivePurchaseOrder(
  ctx: ServiceContext,
  source: ServiceSlug,
  poId: string,
  input: {
    locationId: string;
    items: Array<{ purchaseItemId: string; qty: number }>;
  }
) {
  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });
    await assertRecordInScope(ctx, po, "PurchaseOrder");
    if (!po || po.source !== source) throw new NotFoundError("Purchase order not found");
    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BusinessError("Cannot receive a cancelled purchase order");
    }

    for (const rec of input.items) {
      const poItem = po.items.find((i) => i.id === rec.purchaseItemId);
      if (!poItem) throw new BusinessError(`PO item ${rec.purchaseItemId} not found`);
      const nextReceived = Number(poItem.receivedQty) + rec.qty;
      if (nextReceived > Number(poItem.qty)) {
        throw new BusinessError("Cannot receive more than ordered quantity");
      }

      await tx.purchaseItem.update({
        where: { id: poItem.id },
        data: { receivedQty: new Prisma.Decimal(nextReceived) },
      });

      await adjustStock(tx, {
        productId: poItem.productId,
        locationId: input.locationId,
        qtyChange: rec.qty,
        reason: `PO_RECEIVE:${po.poNo}`,
        refType: "PurchaseOrder",
        refId: po.id,
        actorId: ctx.user.id,
      });
    }

    const refreshedItems = await tx.purchaseItem.findMany({
      where: { purchaseOrderId: po.id },
    });
    const allReceived = refreshedItems.every(
      (i) => Number(i.receivedQty) >= Number(i.qty)
    );

    const updated = await tx.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: allReceived
          ? PurchaseOrderStatus.RECEIVED
          : PurchaseOrderStatus.PARTIAL,
      },
      include: { items: true },
    });

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.PO_RECEIVED,
      entityType: "PurchaseOrder",
      entityId: po.id,
      summary: `Received ${input.items.length} line(s) for PO ${po.poNo} (${updated.status})`,
    });

    return withSourceLabel(updated);
  });
}

export async function listInvoices(
  ctx: ServiceContext,
  source: ServiceSlug,
  params: {
    page: number;
    perPage: number;
    q?: string;
    status?: string;
    contactId?: string;
    from?: Date;
    to?: Date;
    orderBy?: Record<string, "asc" | "desc">;
  }
) {
  const scope = scopeWhere(ctx, { service: source });
  const where: Prisma.InvoiceWhereInput = {
    ...scope,
    ...(params.status ? { status: params.status as InvoiceStatus } : {}),
    ...(params.contactId ? { contactId: params.contactId } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { invoiceNo: { contains: params.q, mode: "insensitive" } },
            { contact: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { contact: { select: { id: true, name: true, email: true, phone: true } }, payments: true },
      orderBy: params.orderBy ?? { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
    prisma.invoice.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((r) => ({
      ...r,
      totalDisplay: formatNGN(r.totalKobo),
    }))
  );
  return { rows: enriched, total };
}
