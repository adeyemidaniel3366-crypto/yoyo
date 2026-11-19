// ---------------------------------------------------------------------------
// Zino One — Notification Service (§11)
// Writes in-app Notification rows, renders templates, dispatches Email & SMS.
// ---------------------------------------------------------------------------

import { Role, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { sendEmail } from "../email/transporter";
import {
  renderEmailTemplate,
  renderTemplateString,
  type EmailTemplateKey,
} from "../email/templates";
import { sendSms } from "../sms/termii";
import { logger } from "../logger";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";

export interface NotifyInput {
  userIds?: string[];
  roles?: Role[];
  source: ServiceSlug;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  channels?: NotificationChannel[];
  templateKey?: EmailTemplateKey;
  templateVars?: Record<string, unknown>;
  critical?: boolean; // Critical alerts bypass user notificationPrefs (§11.1)
}

interface UserNotifPrefs {
  [service: string]: {
    email?: boolean;
    sms?: boolean;
  };
}

export async function notify(input: NotifyInput): Promise<void> {
  const channels = input.channels ?? ["IN_APP"];
  const targetIds = new Set<string>(input.userIds ?? []);

  if (input.roles && input.roles.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        roles: { hasSome: input.roles },
        OR: [
          { roles: { has: Role.SUPER_ADMIN } },
          { serviceAccess: { has: input.source } },
        ],
      },
      select: { id: true },
    });
    for (const u of users) targetIds.add(u.id);
  }

  if (targetIds.size === 0) return;

  const recipients = await prisma.user.findMany({
    where: { id: { in: Array.from(targetIds) }, isActive: true },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      notificationPrefs: true,
    },
  });

  for (const user of recipients) {
    const prefs = (user.notificationPrefs as UserNotifPrefs | null) ?? {};
    const svcPref = prefs[input.source] ?? {};

    if (channels.includes("IN_APP")) {
      await prisma.notification
        .create({
          data: {
            source: input.source,
            userId: user.id,
            title: input.title,
            body: input.body,
            entityType: input.entityType ?? null,
            entityId: input.entityId ?? null,
            channel: "IN_APP",
          },
        })
        .catch((err) => {
          logger.warn({ err: (err as Error).message, userId: user.id }, "In-app notification failed");
        });
    }

    if (channels.includes("EMAIL")) {
      const emailAllowed = input.critical || svcPref.email !== false;
      if (emailAllowed && user.email) {
        // Check DB override template first
        const dbTpl = input.templateKey
          ? await prisma.notificationTemplate.findUnique({
              where: {
                source_event_channel: {
                  source: input.source,
                  event: input.templateKey,
                  channel: "EMAIL",
                },
              },
            })
          : null;

        let subject: string;
        let text: string;
        let html: string;

        if (dbTpl && dbTpl.isActive) {
          const vars = {
            name: `${user.firstName} ${user.lastName}`,
            ...(input.templateVars ?? {}),
          };
          subject = renderTemplateString(dbTpl.subject ?? input.title, vars, false);
          text = renderTemplateString(dbTpl.body, vars, false);
          html = `<p>${renderTemplateString(dbTpl.body, vars, true).replace(/\n/g, "<br/>")}</p>`;
        } else if (input.templateKey) {
          const rendered = renderEmailTemplate(input.templateKey, input.source, {
            name: `${user.firstName} ${user.lastName}`,
            ...(input.templateVars ?? {}),
          });
          subject = rendered.subject;
          text = rendered.text;
          html = rendered.html;
        } else {
          subject = `[${input.source}] ${input.title}`;
          text = input.body;
          html = `<p>${input.body}</p>`;
        }

        void sendEmail({ to: user.email, subject, text, html });
      }
    }

    if (channels.includes("SMS")) {
      const smsAllowed = input.critical || svcPref.sms === true;
      if (smsAllowed && user.phone) {
        void sendSms(user.phone, `${input.title}: ${input.body}`);
      }
    }
  }
}
