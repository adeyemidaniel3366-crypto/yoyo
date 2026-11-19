// ---------------------------------------------------------------------------
// Zino One — Termii SMS Client (§11, §4)
// Off silently unless TERMII_API_KEY is set. Failures are logged and skipped.
// ---------------------------------------------------------------------------

import { getEnv } from "../env";
import { logger } from "../logger";

export async function sendSms(to: string, message: string): Promise<boolean> {
  const env = getEnv();
  if (!env.TERMII_API_KEY) {
    return false;
  }

  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from: env.TERMII_SENDER_ID || "ZinoOne",
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: env.TERMII_API_KEY,
      }),
    });
    if (!res.ok) {
      logger.warn({ status: res.status, to }, "Termii SMS API returned non-OK");
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err: (err as Error).message, to }, "Termii SMS send failed");
    return false;
  }
}
