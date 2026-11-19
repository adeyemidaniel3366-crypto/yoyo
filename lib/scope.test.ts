import { describe, it, expect } from "vitest";
import { Role, ServiceSlug } from "@prisma/client";
import { getEffectiveServices, scopeWhere, type ServiceContext } from "./scope";
import { ForbiddenError } from "./errors";

describe("lib/scope.ts — Service and Location Query Scoping (§6.4)", () => {
  const superAdminCtx: ServiceContext = {
    user: {
      id: "usr_sa",
      email: "sa@zinoone.local",
      firstName: "Super",
      lastName: "Admin",
      roles: [Role.SUPER_ADMIN],
      serviceAccess: [ServiceSlug.SPARK],
      locationIds: ["loc_1"],
      isActive: true,
    },
  };

  const sparkOnlyCtx: ServiceContext = {
    user: {
      id: "usr_sm",
      email: "manager@spark.local",
      firstName: "Spark",
      lastName: "Manager",
      roles: [Role.SERVICE_MANAGER],
      serviceAccess: [ServiceSlug.SPARK],
      locationIds: ["loc_1", "loc_2"],
      isActive: true,
    },
  };

  it("allows super admin to query across any service", () => {
    const services = getEffectiveServices(superAdminCtx.user, [ServiceSlug.BUILDERS]);
    expect(services).toEqual([ServiceSlug.BUILDERS]);
  });

  it("throws 403 Forbidden when a scoped user requests a service outside their scope", () => {
    expect(() => {
      getEffectiveServices(sparkOnlyCtx.user, [ServiceSlug.BUILDERS]);
    }).toThrow(ForbiddenError);
  });

  it("applies location scoping in the Prisma where query fragment", () => {
    const where = scopeWhere(sparkOnlyCtx, { service: ServiceSlug.SPARK, hasLocation: true });
    expect(where.source).toEqual({ in: [ServiceSlug.SPARK] });
    expect(where.locationId).toEqual({ in: ["loc_1", "loc_2"] });
  });

  it("prevents scoped user from asking for an unassigned location", () => {
    expect(() => {
      scopeWhere(sparkOnlyCtx, {
        service: ServiceSlug.SPARK,
        locationIds: ["loc_unassigned"],
        hasLocation: true,
      });
    }).toThrow(ForbiddenError);
  });
});
