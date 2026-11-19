import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { handleFileUpload } from "@/lib/uploads";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await requireAuth(req, requestId);
  const form = await req.formData();
  const file = form.get("file");
  const purpose = String(form.get("purpose") ?? "receipts");
  if (!(file instanceof File)) {
    throw new ValidationError("A file field is required");
  }
  const result = await handleFileUpload(file, purpose);
  return ok(result, 201, requestId);
});
