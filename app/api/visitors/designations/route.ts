import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { createNameOnlySchema } from "@/lib/validators/visitors";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const rows = await prisma.designation.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });
  return ok(rows, 200, requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createNameOnlySchema);
  const desig = await prisma.designation.create({ data: { name: body.name } });
  return ok(desig, 201, requestId);
});
