// ---------------------------------------------------------------------------
// Zino One — API Response Envelope, Error Wrapper, Pagination & Idempotency (§7, §15)
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import {
  AppError,
  ConflictError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors";
import { childLogger } from "./logger";
import { getEnv } from "./env";
import { prisma } from "./prisma";

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T, status = 200, requestId?: string): NextResponse {
  const headers: Record<string, string> = {};
  if (requestId) headers["x-request-id"] = requestId;
  return NextResponse.json({ ok: true, data }, { status, headers });
}

export function okList<T>(
  data: T[],
  meta: PaginationMeta,
  requestId?: string
): NextResponse {
  const headers: Record<string, string> = {};
  if (requestId) headers["x-request-id"] = requestId;
  return NextResponse.json({ ok: true, data, meta }, { status: 200, headers });
}

export function buildPaginationMeta(
  page: number,
  perPage: number,
  total: number
): PaginationMeta {
  return {
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function parseQuery<TOut, TIn = any>(req: Request, schema: z.ZodType<TOut, z.ZodTypeDef, TIn>): TOut {
  const url = new URL(req.url);
  const obj: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  const parsed = schema.safeParse(obj);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ValidationError(first?.message ?? "Invalid query parameters", {
      field: first?.path.join(".") || undefined,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  return parsed.data;
}

export async function parseBody<TOut, TIn = any>(req: Request, schema: z.ZodType<TOut, z.ZodTypeDef, TIn>): Promise<TOut> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON request body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ValidationError(first?.message ?? "Validation failed", {
      field: first?.path.join(".") || undefined,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  return parsed.data;
}

export function parseSort(
  sortParam: string | undefined,
  allowList: Record<string, string>,
  defaultSort: Record<string, "asc" | "desc"> = { createdAt: "desc" }
): Record<string, "asc" | "desc"> {
  if (!sortParam) return defaultSort;
  const [field, dirRaw] = sortParam.split(":");
  const mapped = allowList[field];
  if (!mapped) return defaultSort;
  const dir = dirRaw?.toLowerCase() === "asc" ? "asc" : "desc";
  return { [mapped]: dir };
}

export function requireCronSecret(req: Request): void {
  const env = getEnv();
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!env.CRON_SECRET || auth !== expected) {
    throw new UnauthorizedError("Invalid cron secret");
  }
}

// Idempotency helper (§7.3)
export async function withIdempotency<T>(
  req: Request,
  rawBodyHash: string,
  fn: () => Promise<{ status: number; data: T }>
): Promise<{ status: number; data: T; replayed: boolean }> {
  const key = req.headers.get("idempotency-key")?.trim();
  if (!key) {
    const res = await fn();
    return { ...res, replayed: false };
  }

  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (existing && existing.expiresAt > new Date()) {
    if (existing.requestHash !== rawBodyHash) {
      throw new ConflictError("Idempotency-Key reused with different request payload");
    }
    const stored = existing.response as { status: number; data: T };
    return { status: stored.status, data: stored.data, replayed: true };
  }

  const res = await fn();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.idempotencyKey
    .upsert({
      where: { key },
      update: {
        requestHash: rawBodyHash,
        response: res as unknown as Prisma.InputJsonValue,
        expiresAt,
      },
      create: {
        key,
        requestHash: rawBodyHash,
        response: res as unknown as Prisma.InputJsonValue,
        expiresAt,
      },
    })
    .catch(() => {});

  return { ...res, replayed: false };
}

export function hashPayload(payload: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload ?? {}))
    .digest("hex");
}

function translatePrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  if (err.code === "P2002") {
    const target = Array.isArray(err.meta?.target)
      ? (err.meta.target as string[]).join(", ")
      : String(err.meta?.target ?? "field");
    return new ConflictError(`A record with this ${target} already exists`, {
      field: target,
    });
  }
  if (err.code === "P2003") {
    return new AppError(
      422,
      "BUSINESS_RULE",
      "Referenced record does not exist or cannot be modified"
    );
  }
  if (err.code === "P2025") {
    return new AppError(404, "NOT_FOUND", "Requested record was not found");
  }
  return new AppError(500, "INTERNAL", "Database operation failed");
}

type RouteHandler<C = unknown> = (
  req: Request,
  context: C,
  requestId: string
) => Promise<NextResponse | Response>;

/**
 * Single centralized error handler wrapper for all API route handlers (§15).
 */
export function withErrorHandler<C = { params?: Record<string, string> }>(
  handler: RouteHandler<C>
) {
  return async (req: Request, context: C): Promise<Response> => {
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    const start = Date.now();
    const url = new URL(req.url);
    const log = childLogger({ requestId, route: `${req.method} ${url.pathname}` });

    try {
      const response = await handler(req, context, requestId);
      const durationMs = Date.now() - start;
      response.headers.set("x-request-id", requestId);
      log.info({ status: response.status, durationMs }, "API request completed");
      return response;
    } catch (err: unknown) {
      const durationMs = Date.now() - start;

      if (err instanceof ZodError) {
        const first = err.issues[0];
        log.warn({ durationMs, code: "VALIDATION_ERROR" }, "Validation failed");
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "VALIDATION_ERROR",
              message: first?.message ?? "Validation failed",
              details: { field: first?.path.join(".") || undefined },
              requestId,
            },
          },
          { status: 400, headers: { "x-request-id": requestId } }
        );
      }

      if (err instanceof AppError) {
        const headers: Record<string, string> = { "x-request-id": requestId };
        if (err instanceof RateLimitError) {
          headers["Retry-After"] = String(err.retryAfterSec);
        }
        if (err.status >= 500) {
          log.error({ err: err.message, code: err.code, durationMs }, "API error");
        } else {
          log.warn({ code: err.code, status: err.status, durationMs }, err.message);
        }
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: err.code,
              message: err.message,
              ...(err.details ? { details: err.details } : {}),
              requestId,
            },
          },
          { status: err.status, headers }
        );
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const mapped = translatePrismaError(err);
        log.warn({ prismaCode: err.code, code: mapped.code, durationMs }, mapped.message);
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: mapped.code,
              message: mapped.message,
              ...(mapped.details ? { details: mapped.details } : {}),
              requestId,
            },
          },
          { status: mapped.status, headers: { "x-request-id": requestId } }
        );
      }

      log.error(
        {
          err: err instanceof Error ? err.message : String(err),
          durationMs,
        },
        "Unhandled API error"
      );

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "An unexpected error occurred",
            requestId,
          },
        },
        { status: 500, headers: { "x-request-id": requestId } }
      );
    }
  };
}
