import { ContactType, Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createEmployeeSchema } from "@/lib/validators/visitors";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    isActive: true,
    ...(q.q ? { contact: { name: { contains: q.q, mode: "insensitive" as const } } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: { contact: true, department: true, designation: true },
      orderBy: { contact: { name: "asc" } },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.employee.count({ where }),
  ]);

  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createEmployeeSchema);

  const emp = await prisma.$transaction(async (tx) => {
    let contact = await tx.contact.findFirst({
      where: {
        OR: [
          ...(body.phone ? [{ phone: body.phone }] : []),
          ...(body.email ? [{ email: body.email.toLowerCase() }] : []),
        ],
      },
    });
    if (!contact) {
      contact = await tx.contact.create({
        data: {
          name: body.name,
          phone: body.phone ?? null,
          email: body.email ?? null,
          types: [ContactType.EMPLOYEE],
          sources: [ServiceSlug.VISITORS],
        },
      });
    }

    const created = await tx.employee.create({
      data: {
        contactId: contact.id,
        departmentId: body.departmentId ?? null,
        designationId: body.designationId ?? null,
      },
      include: { contact: true, department: true, designation: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.EMPLOYEE_CREATED,
      entityType: "Employee",
      entityId: created.id,
      summary: `Created staff member ${created.contact.name}`,
    });

    return created;
  });

  return ok(emp, 201, requestId);
});
