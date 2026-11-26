import { withErrorHandler, ok } from "@/lib/api";
import { SESSION_COOKIE_NAME, revokeDbSession } from "@/lib/auth";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    /(?:^|;\s*)(?:__Secure-)?authjs\.session-token=([^;]+)/
  );
  const rawToken = match ? decodeURIComponent(match[1]) : undefined;

  if (rawToken && !rawToken.startsWith("demo-")) {
    await revokeDbSession(rawToken).catch(() => {});
  }

  const res = ok({ loggedOut: true }, 200, requestId);
  res.cookies.set("authjs.session-token", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  res.cookies.set("__Secure-authjs.session-token", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
});
