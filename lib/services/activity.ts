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

export async function logActivity(tx: DbClient, input: LogActivityInput) {
  return tx.activityLog.create({
    data: {
      source: input.source,
      locationId: input.locationId ?? null,
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      amountKobo: input.amountKobo ?? null,
    },
  });
}
