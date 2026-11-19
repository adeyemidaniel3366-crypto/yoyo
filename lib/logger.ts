// ---------------------------------------------------------------------------
// Zino One — Pino JSON Logger (§16)
// Never logs passwords, tokens, secrets, session values, or full card data.
// ---------------------------------------------------------------------------

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "silent" : "info"),
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "sessionToken",
      "*.sessionToken",
      "authorization",
      "*.authorization",
      "secret",
      "*.secret",
      "apiKey",
      "*.apiKey",
      "cardNumber",
      "*.cardNumber",
      "cvv",
      "*.cvv",
    ],
    censor: "[REDACTED]",
  },
  base: {
    service: "zino-one",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(bindings: {
  requestId?: string;
  userId?: string;
  service?: string;
  route?: string;
}) {
  return logger.child(bindings);
}
