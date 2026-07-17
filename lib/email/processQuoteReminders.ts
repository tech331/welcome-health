import {
  hasQuoteReminderActivityToday,
  listQuoteReminderCandidates,
  shouldSendQuoteReminder,
} from "@/lib/airtable";
import {
  isQuoteReminderEmailConfigured,
  sendQuoteReminderEmail,
} from "@/lib/email/sendQuoteReminderEmail";

export type QuoteReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  errors: number;
  details: Array<{
    requestId: string;
    status: "sent" | "skipped" | "error";
    reason?: string;
  }>;
};

export async function processQuoteReminders(): Promise<QuoteReminderRunResult> {
  const result: QuoteReminderRunResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  if (!isQuoteReminderEmailConfigured()) {
    result.details.push({
      requestId: "—",
      status: "skipped",
      reason:
        "Email not configured (RESEND_API_KEY / ACKNOWLEDGEMENT_FROM_EMAIL / ACKNOWLEDGEMENT_TO_EMAIL)",
    });
    result.skipped += 1;
    return result;
  }

  const candidates = await listQuoteReminderCandidates();
  result.checked = candidates.length;

  for (const candidate of candidates) {
    try {
      if (
        !shouldSendQuoteReminder({
          createdAt: candidate.createdAt,
          slaBusinessDays: candidate.slaBusinessDays,
        })
      ) {
        result.skipped += 1;
        result.details.push({
          requestId: candidate.requestId,
          status: "skipped",
          reason: "Not on an SLA cadence day",
        });
        continue;
      }

      if (await hasQuoteReminderActivityToday(candidate.id)) {
        result.skipped += 1;
        result.details.push({
          requestId: candidate.requestId,
          status: "skipped",
          reason: "Already reminded today",
        });
        continue;
      }

      await sendQuoteReminderEmail({
        requestRecordId: candidate.id,
        requestId: candidate.requestId,
        items: candidate.items,
        requestSentAt: candidate.createdAt,
      });

      result.sent += 1;
      result.details.push({
        requestId: candidate.requestId,
        status: "sent",
      });
    } catch (error) {
      result.errors += 1;
      result.details.push({
        requestId: candidate.requestId,
        status: "error",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(
        `Quote reminder failed for ${candidate.requestId}:`,
        error,
      );
    }
  }

  return result;
}
