import { Resend } from "resend";
import {
  createActivityRecord,
  getSupplierQuoteEmailContext,
} from "@/lib/airtable";
import {
  appendResendId,
  buildEmailActivityContent,
} from "./activityContent";
import {
  buildQuoteReminderEmailHtml,
  buildQuoteReminderEmailSubject,
  buildQuoteReminderEmailText,
  type SupplierQuoteEmailItem,
} from "./quoteReminderEmail";

export type SendQuoteReminderEmailParams = {
  requestRecordId: string;
  requestId: string;
  items: SupplierQuoteEmailItem[];
  requestSentAt: string | null;
};

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getReminderRecipients(): string[] {
  const raw = process.env.ACKNOWLEDGEMENT_TO_EMAIL?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function isQuoteReminderEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim() &&
      getReminderRecipients().length > 0,
  );
}

/**
 * Send a quote reminder for a request.
 * Recipients are ALWAYS ACKNOWLEDGEMENT_TO_EMAIL — never Airtable supplier emails.
 */
export async function sendQuoteReminderEmail({
  requestRecordId,
  requestId,
  items,
  requestSentAt,
}: SendQuoteReminderEmailParams): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim();
  const to = getReminderRecipients();

  if (!resend || !from || to.length === 0) {
    console.warn(
      "Quote reminder skipped: missing RESEND_API_KEY, ACKNOWLEDGEMENT_FROM_EMAIL, or ACKNOWLEDGEMENT_TO_EMAIL.",
    );
    return false;
  }

  const context = await getSupplierQuoteEmailContext(requestRecordId);
  if (!context) {
    console.warn(
      `Quote reminder skipped: could not load context for request ${requestId}.`,
    );
    return false;
  }

  if (context.suppliers.length === 0) {
    console.warn(
      `Quote reminder skipped: no suppliers on request ${requestId}.`,
    );
    return false;
  }

  const subject = buildQuoteReminderEmailSubject(context.client.fullName);
  const emailParams = {
    clientFullName: context.client.fullName,
    requestSentAt,
    requestorFullName: context.requestor.fullName,
    requestorRole: context.requestor.role,
    requestorPhone: context.requestor.phone,
    items,
  };
  const html = buildQuoteReminderEmailHtml(emailParams);
  const text = buildQuoteReminderEmailText(emailParams);

  const { data, error } = await resend.emails.send({
    from: `Welcome Health <${from}>`,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }

  await createActivityRecord({
    requestRecordId,
    channel: "Email",
    direction: "Outbound",
    content: appendResendId(
      buildEmailActivityContent("Quote Reminder", to),
      data?.id,
    ),
  });

  return true;
}
