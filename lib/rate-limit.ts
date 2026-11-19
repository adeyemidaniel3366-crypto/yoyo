// ---------------------------------------------------------------------------
// Zino One — Token Bucket Rate Limiter (§17)
// In-memory token bucket in dev; Upstash Redis REST API in prod (env-flagged).
// ---------------------------------------------------------------------------

import { getEnv } from "./env";
import { RateLimitError } from "./errors";
import { logger } from "./logger";

export interface RateLimitConfig {
  prefix: string;
  limit: number;
  windowSec: number;
}

export const RATE_LIMITS = {
  AUTH: { prefix: "rl:auth", limit: 10, windowSec: 600 }, // 10 / 10 min / IP
  PUBLIC_FORM: { prefix: "rl:pub", limit: 20, windowSec: 3600 }, // 20 / hour / IP
  API_USER: { prefix: "rl:api", limit: 300, windowSec: 60 }, // 300 / min / user
  WEBHOOK_INVALID: { prefix: "rl:whbad", limit: 10, windowSec: 900 }, // 10 invalid sigs / 15 min / IP
} as const;

interface Bucket {
  tokens: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, Bucket>();

function checkMemory(key: string, limit: number, windowSec: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  let bucket = memoryBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { tokens: limit - 1, resetAt: now + windowMs };
    memoryBuckets.set(key, bucket);
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSec: 0 };
  }

  const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return { allowed: false, retryAfterSec };
}

async function checkUpstash(
  key: string,
  limit: number,
  windowSec: number,
  url: string,
  token: string
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"],
        ["TTL", key],
      ]),
    });
    if (!res.ok) {
      return checkMemory(key, limit, windowSec);
    }
    const data = (await res.json()) as Array<{ result: number }>;
    const count = Number(data[0]?.result ?? 1);
    const ttl = Number(data[2]?.result ?? windowSec);
    if (count > limit) {
      return { allowed: false, retryAfterSec: Math.max(1, ttl) };
    }
    return { allowed: true, retryAfterSec: 0 };
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Upstash rate limit fallback to memory");
    return checkMemory(key, limit, windowSec);
  }
}

export async function enforceRateLimit(
  config: RateLimitConfig,
  identifier: string
): Promise<void> {
  if (process.env.NODE_ENV === "test" && process.env.ENABLE_RATE_LIMIT_IN_TEST !== "true") {
    return;
  }
  const key = `${config.prefix}:${identifier}`;
  const env = getEnv();
  const result =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? await checkUpstash(
          key,
          config.limit,
          config.windowSec,
          env.UPSTASH_REDIS_REST_URL,
          env.UPSTASH_REDIS_REST_TOKEN
        )
      : checkMemory(key, config.limit, config.windowSec);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSec);
  }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function resetMemoryRateLimits(): void {
  memoryBuckets.clear();
}
