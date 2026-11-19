// ---------------------------------------------------------------------------
// Zino One — Service & Location Scoping + Source Label Cache (§6.4, §8)
// Every list query is scoped in the DB query itself.
// ---------------------------------------------------------------------------

import { Role, ServiceSlug } from "@prisma/client";
import { prisma } from "./prisma";
import { ForbiddenError, NotFoundError } from "./errors";
import { logActivity } from "./services/activity";
import { ActivityAction } from "./activity-actions";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  serviceAccess: ServiceSlug[];
  locationIds: string[];
  isActive: boolean;
}

export interface ServiceContext {
  user: SessionUser;
  requestId?: string;
}

export interface SourceLabel {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  color: string;
}

// 60-second in-memory cache for Service table (§8.3)
const FALLBACK_LABELS: Record<ServiceSlug, SourceLabel> = {
  BILLSTACKS: { slug: "BILLSTACKS", name: "Billstacks", shortName: "Billstacks", color: "#28A745" },
  BUILDERS: { slug: "BUILDERS", name: "Top Builders", shortName: "Builders", color: "#006B3F" },
  SPARK: { slug: "SPARK", name: "Zino Spark", shortName: "Spark", color: "#2563EB" },
  APARTMENTS: { slug: "APARTMENTS", name: "Zino Apartments", shortName: "Apartments", color: "#1E3A5F" },
  GALAXY: { slug: "GALAXY", name: "Device Galaxy", shortName: "Galaxy", color: "#E74C3C" },
  VISITORS: { slug: "VISITORS", name: "Visitor Management", shortName: "Visitors", color: "#7C3AED" },
};

let serviceCache: { map: Record<ServiceSlug, SourceLabel>; expiresAt: number } | null = null;

export async function getServiceLabelMap(): Promise<Record<ServiceSlug, SourceLabel>> {
  const now = Date.now();
  if (serviceCache && now < serviceCache.expiresAt) {
    return serviceCache.map;
  }
  try {
    const rows = await prisma.service.findMany();
    const map: Record<ServiceSlug, SourceLabel> = { ...FALLBACK_LABELS };
    for (const r of rows) {
      map[r.slug] = {
        slug: r.slug,
        name: r.name,
        shortName: r.shortName,
        color: r.color,
      };
    }
    serviceCache = { map, expiresAt: now + 60_000 };
    return map;
  } catch {
    return FALLBACK_LABELS;
  }
}

export async function getServiceLabel(slug: ServiceSlug): Promise<SourceLabel> {
  const map = await getServiceLabelMap();
  return map[slug] ?? FALLBACK_LABELS[slug];
}

export function attachSourceLabel<T extends { source: ServiceSlug }>(
  record: T,
  labelMap: Record<ServiceSlug, SourceLabel>
): T & { sourceLabel: SourceLabel } {
  return {
    ...record,
    sourceLabel: labelMap[record.source] ?? FALLBACK_LABELS[record.source],
  };
}

export async function withSourceLabel<T extends { source: ServiceSlug }>(
  record: T
): Promise<T & { sourceLabel: SourceLabel }> {
  const map = await getServiceLabelMap();
  return attachSourceLabel(record, map);
}

export async function withSourceLabels<T extends { source: ServiceSlug }>(
  records: T[]
): Promise<Array<T & { sourceLabel: SourceLabel }>> {
  const map = await getServiceLabelMap();
  return records.map((r) => attachSourceLabel(r, map));
}

export function isSuperAdmin(user: SessionUser): boolean {
  return user.roles.includes(Role.SUPER_ADMIN);
}

export function getEffectiveServices(
  user: SessionUser,
  requestedServices?: ServiceSlug[]
): ServiceSlug[] {
  const allServices = Object.values(ServiceSlug);
  const allowed = isSuperAdmin(user) ? allServices : user.serviceAccess;

  if (!requestedServices || requestedServices.length === 0) {
    return allowed;
  }

  for (const s of requestedServices) {
    if (!allowed.includes(s)) {
      throw new ForbiddenError(`No access to service ${s}`);
    }
  }
  return requestedServices;
}

/**
 * Returns Prisma where fragment scoping a query by the user's service and location access (§6.4).
 */
export function scopeWhere(
  ctx: ServiceContext,
  options: {
    service?: ServiceSlug | ServiceSlug[];
    locationIds?: string[];
    hasLocation?: boolean;
  } = {}
): {
  source: { in: ServiceSlug[] };
  locationId?: { in: string[] };
} {
  const requested = options.service
    ? Array.isArray(options.service)
      ? options.service
      : [options.service]
    : undefined;

  const services = getEffectiveServices(ctx.user, requested);
  const where: { source: { in: ServiceSlug[] }; locationId?: { in: string[] } } = {
    source: { in: services },
  };

  if (options.hasLocation) {
    if (isSuperAdmin(ctx.user)) {
      if (options.locationIds && options.locationIds.length > 0) {
        where.locationId = { in: options.locationIds };
      }
    } else {
      const allowedLocs = ctx.user.locationIds;
      if (options.locationIds && options.locationIds.length > 0) {
        for (const id of options.locationIds) {
          if (!allowedLocs.includes(id)) {
            throw new ForbiddenError(`No access to location ${id}`);
          }
        }
        where.locationId = { in: options.locationIds };
      } else if (allowedLocs.length > 0) {
        where.locationId = { in: allowedLocs };
      } else {
        // User has no locations assigned -> return empty result via impossible id
        where.locationId = { in: ["__none__"] };
      }
    }
  }

  return where;
}

/**
 * Assert a single record is within the caller's scope.
 * Throws 404 (not 403, to avoid leaking existence) and writes AUTH_DENIED to ActivityLog (§6.4, §6.5).
 */
export async function assertRecordInScope(
  ctx: ServiceContext,
  record: { id: string; source: ServiceSlug; locationId?: string | null } | null,
  entityType: string
): Promise<void> {
  if (!record) {
    throw new NotFoundError(`${entityType} not found`);
  }
  if (isSuperAdmin(ctx.user)) return;

  const hasService = ctx.user.serviceAccess.includes(record.source);
  const hasLocation =
    !record.locationId ||
    ctx.user.locationIds.length === 0 ||
    ctx.user.locationIds.includes(record.locationId);

  if (!hasService || !hasLocation) {
    await logActivity(prisma, {
      source: ctx.user.serviceAccess[0] ?? record.source,
      locationId: record.locationId ?? null,
      actorId: ctx.user.id,
      action: ActivityAction.AUTH_DENIED,
      entityType,
      entityId: record.id,
      summary: `${ctx.user.email} attempted out-of-scope access to ${entityType} ${record.id}`,
    }).catch(() => {});
    throw new NotFoundError(`${entityType} not found`);
  }
}
