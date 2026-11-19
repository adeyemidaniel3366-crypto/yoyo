// ---------------------------------------------------------------------------
// Zino One — Email Templates (§11.2)
// All 16 templates with HTML + plain text, [Service Name] subject prefix,
// and HTML-escaped {{variables}}.
// ---------------------------------------------------------------------------

import { ServiceSlug } from "@prisma/client";
import { SERVICE_CONFIG, PLATFORM_NAME } from "../../constants";

export type EmailTemplateKey =
  | "booking-confirmation"
  | "booking-reminder"
  | "invoice-sent"
  | "invoice-payment-link"
  | "payment-receipt"
  | "payment-reminder"
  | "visitor-invite"
  | "visitor-arrival"
  | "order-confirmation"
  | "order-shipped"
  | "order-delivered"
  | "password-reset"
  | "email-verification"
  | "welcome"
  | "low-stock-alert"
  | "daily-summary";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderTemplateString(
  template: string,
  vars: Record<string, unknown>,
  htmlEscape = true
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const val = vars[key];
    if (val === undefined || val === null) return "";
    return htmlEscape ? escapeHtml(val) : String(val);
  });
}

interface TemplateDef {
  subject: string;
  body: string;
  isMarketing?: boolean;
}

const TEMPLATES: Record<EmailTemplateKey, TemplateDef> = {
  "booking-confirmation": {
    subject: "Booking Confirmed — {{ref}}",
    body: "Hello {{guestName}},\n\nYour reservation ({{ref}}) for {{roomType}} from {{checkIn}} to {{checkOut}} is confirmed.\nTotal: {{totalDisplay}}\n\nWe look forward to hosting you.",
  },
  "booking-reminder": {
    subject: "Upcoming Stay Reminder — {{ref}}",
    body: "Hello {{guestName}},\n\nThis is a reminder of your upcoming stay ({{ref}}) checking in on {{checkIn}} at {{checkInTime}}.",
  },
  "invoice-sent": {
    subject: "Invoice {{invoiceNo}} — {{totalDisplay}}",
    body: "Hello {{contactName}},\n\nInvoice {{invoiceNo}} for {{totalDisplay}} has been issued. Due date: {{dueDate}}.\nView invoice: {{link}}",
  },
  "invoice-payment-link": {
    subject: "Pay Invoice {{invoiceNo}} Online",
    body: "Hello {{contactName}},\n\nYou can pay invoice {{invoiceNo}} ({{totalDisplay}}) securely online here:\n{{paymentUrl}}",
  },
  "payment-receipt": {
    subject: "Payment Receipt — {{reference}}",
    body: "Hello {{contactName}},\n\nWe received your payment of {{amountDisplay}} via {{method}} (Ref: {{reference}}).\nThank you for your business.",
  },
  "payment-reminder": {
    subject: "Overdue Invoice Reminder — {{invoiceNo}}",
    body: "Hello {{contactName}},\n\nInvoice {{invoiceNo}} ({{balanceDisplay}} outstanding) is {{daysOverdue}} days overdue. Please settle at your earliest convenience.",
  },
  "visitor-invite": {
    subject: "Visitor Check-in Pass — {{visitDate}}",
    body: "Hello {{visitorName}},\n\nYou have been pre-registered to visit {{hostName}} on {{visitDate}}.\nUse this single-use check-in link at the kiosk:\n{{checkInUrl}}",
  },
  "visitor-arrival": {
    subject: "Visitor Arrived — {{visitorName}}",
    body: "Hello {{hostName}},\n\nYour visitor {{visitorName}} has just checked in at reception (Purpose: {{purpose}}).",
  },
  "order-confirmation": {
    subject: "Order Confirmation — {{orderNo}}",
    body: "Hello {{customerName}},\n\nThank you for your order {{orderNo}}. Total: {{totalDisplay}}.\nWe will notify you when it ships.",
  },
  "order-shipped": {
    subject: "Your Order {{orderNo}} Has Shipped",
    body: "Hello {{customerName}},\n\nGreat news! Your order {{orderNo}} is on its way.",
  },
  "order-delivered": {
    subject: "Your Order {{orderNo}} Was Delivered",
    body: "Hello {{customerName}},\n\nYour order {{orderNo}} has been delivered. Thank you for shopping with us!",
  },
  "password-reset": {
    subject: "Reset Your Password",
    body: "Hello {{name}},\n\nUse this single-use link (valid for 24 hours) to reset your password:\n{{resetUrl}}\n\nIf you did not request this, you can safely ignore this email.",
  },
  "email-verification": {
    subject: "Verify Your Email Address",
    body: "Hello {{name}},\n\nPlease verify your email address by clicking this link:\n{{verifyUrl}}",
  },
  welcome: {
    subject: "Welcome to {{platformName}}",
    body: "Hello {{name}},\n\nWelcome to {{platformName}}. Your account is now active.",
  },
  "low-stock-alert": {
    subject: "Low Stock Alert — {{locationName}}",
    body: "Attention,\n\nThe following items at {{locationName}} are at or below their low-stock threshold:\n{{itemsSummary}}",
  },
  "daily-summary": {
    subject: "Daily Summary — {{date}}",
    body: "Hello {{managerName}},\n\nHere is your daily operations summary for {{date}}:\n{{summaryBody}}",
  },
};

export function renderEmailTemplate(
  key: EmailTemplateKey,
  source: ServiceSlug,
  vars: Record<string, unknown>
): { subject: string; text: string; html: string } {
  const def = TEMPLATES[key];
  const serviceName = SERVICE_CONFIG[source]?.name ?? PLATFORM_NAME;
  const mergedVars = { platformName: PLATFORM_NAME, serviceName, ...vars };

  const subject = `[${serviceName}] ${renderTemplateString(def.subject, mergedVars, false)}`;
  const textBody = renderTemplateString(def.body, mergedVars, false);
  const htmlBody = renderTemplateString(def.body, mergedVars, true).replace(/\n/g, "<br/>");

  const footerText = def.isMarketing
    ? `\n\n— ${PLATFORM_NAME}\nUnsubscribe: ${String(vars.unsubscribeUrl ?? "#")}`
    : `\n\n— ${PLATFORM_NAME}`;

  const footerHtml = def.isMarketing
    ? `<p style="color:#6B7280;font-size:12px;margin-top:24px;">&mdash; ${escapeHtml(PLATFORM_NAME)} · <a href="${escapeHtml(vars.unsubscribeUrl ?? "#")}">Unsubscribe</a></p>`
    : `<p style="color:#6B7280;font-size:12px;margin-top:24px;">&mdash; ${escapeHtml(PLATFORM_NAME)}</p>`;

  const html = `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;color:#111827;line-height:1.6;max-width:600px;margin:0 auto;padding:24px;">
    <div style="border-bottom:2px solid #2563EB;padding-bottom:12px;margin-bottom:20px;">
      <strong style="font-size:16px;">${escapeHtml(serviceName)}</strong>
      <span style="color:#6B7280;font-size:12px;"> · ${escapeHtml(PLATFORM_NAME)}</span>
    </div>
    <div style="font-size:14px;">${htmlBody}</div>
    ${footerHtml}
  </body></html>`;

  return { subject, text: textBody + footerText, html };
}
