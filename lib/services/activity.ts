// ---------------------------------------------------------------------------
// Zino One — Transactional Activity Log Writer (§8.4)
// Append-only. Called inside the same Prisma transaction as the mutation.
// ---------------------------------------------------------------------------

import { ServiceSlug } from "@prisma/client";
import type { DbClient } from "../prisma";
import type { ActivityActionType } from "../activity-actions";

export interface LogActivityInput {
  source: ServiceSlug;
  locationId?: string | null;
  actorId?: string | null;
  action: ActivityActionType;
  entityType: string;
  entityId: string;
  summary: string;
  amountKobo?: number | null;
}

const SYNTHETIC_ACTOR_IDS = new Set(["KIOSK", "GUEST", "SYSTEM"]);

export function sanitizeActorId(actorId?: string | null): string | null {
  if (!actorId) return null;
  if (actorId.startsWith("demo-") || SYNTHETIC_ACTOR_IDS.has(actorId)) {
    return null;
  }
  return actorId;
}

export async function logActivity(tx: DbClient, input: LogActivityInput) {
  return tx.activityLog.create({
    data: {
      source: input.source,
      locationId: input.locationId ?? null,
      actorId: sanitizeActorId(input.actorId),
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      amountKobo: input.amountKobo ?? null,
    },
  });
}
