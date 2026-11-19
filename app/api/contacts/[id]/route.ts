import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateContactSchema } from "@/lib/validators/contacts";
import { getContactById, updateContact } from "@/lib/services/platform";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const contact = await getContactById(ctx, params.id);
    return ok(contact, 200, requestId);
  }
);

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateContactSchema);
    const updated = await updateContact(ctx, params.id, body);
    return ok(updated, 200, requestId);
  }
);
