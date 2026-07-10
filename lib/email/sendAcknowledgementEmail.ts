import { Resend } from "resend";
import { createActivityRecord } from "@/lib/airtable";
import {
  buildAcknowledgementEmailHtml,
  buildAcknowledgementEmailText,
  getRequestDetailUrl,
} from "./acknowledgementEmail";

export type SendAcknowledgementEmailParams = {
  requestRecordId: string;
  requestId: string;
};

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function isAcknowledgementEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim() &&
      process.env.ACKNOWLEDGEMENT_TO_EMAIL?.trim(),
  );
}

export async function sendRequestAcknowledgementEmail({
  requestRecordId,
  requestId,
}: SendAcknowledgementEmailParams): Promise<void> {
  const resend = getResendClient();
  const from = process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim();
  const to = process.env.ACKNOWLEDGEMENT_TO_EMAIL?.trim();

  if (!resend || !from || !to) {
    console.warn(
      "Acknowledgement email skipped: missing RESEND_API_KEY, ACKNOWLEDGEMENT_FROM_EMAIL, or ACKNOWLEDGEMENT_TO_EMAIL.",
    );
    return;
  }

  const requestUrl = getRequestDetailUrl(requestRecordId);
  const subject = `Quote request ${requestId} received`;

  const { data, error } = await resend.emails.send({
    from: `Welcome Health <${from}>`,
    to: [to],
    subject,
    html: buildAcknowledgementEmailHtml({ requestId, requestUrl }),
    text: buildAcknowledgementEmailText({ requestId, requestUrl }),
  });

  if (error) {
    throw new Error(error.message);
  }

  await createActivityRecord({
    requestRecordId,
    channel: "Email",
    direction: "Outbound",
    content: `Acknowledgement email sent to ${to} for request ${requestId}.${data?.id ? ` (Resend ID: ${data.id})` : ""}`,
  });
}
