// ---------------------------------------------------------------------------
// Zino One — Environment Validation (§4)
// ---------------------------------------------------------------------------

import { logger } from "./logger";

let validated = false;

export interface AppEnv {
  DATABASE_URL: string;
  DIRECT_URL: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  DEMO_LOGINS: boolean;
  APP_TIMEZONE: string;
  PAYMENT_GATEWAY_DEFAULT: "PAYSTACK" | "FLUTTERWAVE";
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  FLUTTERWAVE_PUBLIC_KEY: string;
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  TERMII_API_KEY: string;
  TERMII_SENDER_ID: string;
  S3_ENDPOINT: string;
  S3_BUCKET: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  S3_PUBLIC_URL: string;
  CRON_SECRET: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  DEFAULT_TAX_PCT: number;
  APARTMENTS_TAX_PCT: number;
  LOW_STOCK_DEFAULT: number;
  LARGE_SALE_ALERT_KOBO: number;
}

export function validateEnv(): void {
  if (validated) return;
  // Skip hard crash during Next.js build static analysis or unit tests without DB
  const isBuildOrTest =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV === "test";

  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0 && !isBuildOrTest) {
    const msg = `Missing required environment variable(s): ${missing.join(", ")}`;
    logger.fatal({ missing }, msg);
    throw new Error(msg);
  }

  if (!isBuildOrTest) {
    if (!process.env.TERMII_API_KEY) {
      logger.warn("TERMII_API_KEY not set — SMS notifications are disabled");
    }
    if (!process.env.S3_BUCKET) {
      logger.warn("S3_BUCKET not set — file uploads will use local public/uploads/");
    }
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      logger.warn("UPSTASH_REDIS_REST_URL not set — using in-memory rate limiter");
    }
  }

  validated = true;
}

export function getEnv(): AppEnv {
  return {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DIRECT_URL: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
    DEMO_LOGINS: process.env.DEMO_LOGINS === "true",
    APP_TIMEZONE: process.env.APP_TIMEZONE ?? "Africa/Lagos",
    PAYMENT_GATEWAY_DEFAULT:
      process.env.PAYMENT_GATEWAY_DEFAULT === "FLUTTERWAVE"
        ? "FLUTTERWAVE"
        : "PAYSTACK",
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ?? "",
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ?? "",
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ?? "",
    FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY ?? "",
    FLUTTERWAVE_WEBHOOK_SECRET_HASH:
      process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH ?? "",
    SMTP_HOST: process.env.SMTP_HOST ?? "",
    SMTP_PORT: Number(process.env.SMTP_PORT ?? "587"),
    SMTP_USER: process.env.SMTP_USER ?? "",
    SMTP_PASS: process.env.SMTP_PASS ?? "",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "Zino One <no-reply@zinoone.com>",
    TERMII_API_KEY: process.env.TERMII_API_KEY ?? "",
    TERMII_SENDER_ID: process.env.TERMII_SENDER_ID ?? "ZinoOne",
    S3_ENDPOINT: process.env.S3_ENDPOINT ?? "",
    S3_BUCKET: process.env.S3_BUCKET ?? "",
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? "",
    S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? "",
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL ?? "",
    CRON_SECRET: process.env.CRON_SECRET ?? "",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    DEFAULT_TAX_PCT: Number(process.env.DEFAULT_TAX_PCT ?? "7.5"),
    APARTMENTS_TAX_PCT: Number(process.env.APARTMENTS_TAX_PCT ?? "10"),
    LOW_STOCK_DEFAULT: Number(process.env.LOW_STOCK_DEFAULT ?? "5"),
    LARGE_SALE_ALERT_KOBO: Number(process.env.LARGE_SALE_ALERT_KOBO ?? "50000000"),
  };
}
