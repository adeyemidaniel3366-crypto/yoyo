// ---------------------------------------------------------------------------
// Zino One — Nodemailer SMTP Transporter (§11.2)
// Logs to console in dev when SMTP_HOST is unset. Retries twice with backoff.
// ---------------------------------------------------------------------------

import nodemailer from "nodemailer";
import { getEnv } from "../env";
import { logger } from "../logger";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const env = getEnv();
  if (!env.SMTP_HOST) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  }
  return cachedTransporter;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const env = getEnv();
  const transporter = getTransporter();

  if (!transporter) {
    logger.info(
      { to: input.to, subject: input.subject },
      "[DEV EMAIL] SMTP not configured; email logged only"
    );
    return true;
  }

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return true;
    } catch (err) {
      lastErr = err;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 400));
      }
    }
  }

  logger.error(
    { to: input.to, subject: input.subject, err: (lastErr as Error)?.message },
    "Failed to send email after retries"
  );
  return false;
}
