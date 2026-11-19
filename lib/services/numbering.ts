// ---------------------------------------------------------------------------
// Zino One — Atomic Numbering Sequences & Unique Refs (§5.5)
// Uses parameterised $queryRaw inside caller's transaction so rolled-back
// mutations never consume a number.
// ---------------------------------------------------------------------------

import crypto from "crypto";
import type { DbClient } from "../prisma";
import { ConflictError } from "../errors";

/**
 * Atomically increments and returns the next integer value for a sequence key.
 * Must be called inside the creation transaction.
 */
export async function nextNumber(tx: DbClient, key: string): Promise<number> {
  const rows = await tx.$queryRaw<Array<{ lastValue: number }>>`
    INSERT INTO "Sequence" ("key", "lastValue")
    VALUES (${key}, 1)
    ON CONFLICT ("key")
    DO UPDATE SET "lastValue" = "Sequence"."lastValue" + 1
    RETURNING "lastValue"
  `;
  return Number(rows[0]?.lastValue ?? 1);
}

export function formatSeq(prefix: string, num: number, pad = 6): string {
  return `${prefix}-${String(num).padStart(pad, "0")}`;
}

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHANUM[bytes[i] % ALPHANUM.length];
  }
  return out;
}

/**
 * Generates a unique random reference with retry on collision (max 5 attempts).
 */
export async function generateUniqueRef(
  prefix: string,
  existsFn: (candidate: string) => Promise<boolean>,
  maxAttempts = 5
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = `${prefix}-${randomCode(6)}`;
    const exists = await existsFn(candidate);
    if (!exists) return candidate;
  }
  throw new ConflictError(`Could not generate unique ${prefix} reference`);
}
