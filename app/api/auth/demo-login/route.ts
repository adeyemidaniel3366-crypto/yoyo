import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { NotFoundError } from "@/lib/errors";
import { demoLoginSchema } from "@/lib/validators/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const DEMO_EMAILS: Record<"admin" | "employee" | "reception", string> = {
  admin: "admin@zinoone.local",
  employee: "employee@zinoone.local",
  reception: "reception@zinoone.local",
};

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  // Returns 404 when DEMO_LOGINS is off (§6.1)
  if (!getEnv().DEMO_LOGINS) {
    throw new NotFoundError("Demo login is disabled");
  }

  const body = await parseBody(req, demoLoginSchema);
  const email = DEMO_EMAILS[body.role] || "admin@zinoone.local";
  const rawToken = `demo-${body.role}-${Date.now()}`;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const user = {
    id: `demo-${body.role}`,
    email,
    firstName: body.role === "admin" ? "Super" : body.role === "employee" ? "John" : "Reception",
    lastName: body.role === "admin" ? "Admin" : body.role === "employee" ? "Doe" : "Desk",
    roles: body.role === "admin" ? ["SUPER_ADMIN"] : body.role === "employee" ? ["EMPLOYEE"] : ["RECEPTION"],
    serviceAccess: ["BILLSTACKS", "BUILDERS", "SPARK", "APARTMENTS", "GALAXY", "VISITORS"],
  };

  const res = ok(user, 200, requestId);

  res.cookies.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });

  return res;
});
