import { formatDate } from "@/lib/format";
import {
  buildSupplierQuoteEmailHtml,
  buildSupplierQuoteEmailText,
  type SupplierQuoteEmailItem,
  type SupplierQuoteEmailParams,
} from "./supplierQuoteEmail";

export type QuoteReminderEmailParams = {
  clientFullName: string;
  requestSentAt: string | null;
  requestorFullName: string;
  requestorRole: string;
  requestorPhone: string;
  items: SupplierQuoteEmailItem[];
};

export function buildQuoteReminderEmailSubject(clientFullName: string): string {
  const name =
    clientFullName?.trim() && clientFullName !== "—"
      ? clientFullName
      : "Client";
  return `${name} - Quote Reminder`;
}

function clientDisplayName(clientFullName: string): string {
  return clientFullName?.trim() && clientFullName !== "—"
    ? clientFullName.trim()
    : "the client";
}

/** Reminder copy on top of the shared quote-email layout (same font + table). */
function withReminderCopy(
  params: QuoteReminderEmailParams,
): SupplierQuoteEmailParams {
  const clientName = clientDisplayName(params.clientFullName);
  const sentDate = formatDate(params.requestSentAt);

  return {
    clientFullName: params.clientFullName,
    clientPhone: "",
    clientAddress: "",
    payerName: "",
    requestorFullName: params.requestorFullName,
    requestorRole: params.requestorRole,
    requestorPhone: params.requestorPhone,
    items: params.items,
    slaBusinessDays: null,
    omitClientBlock: true,
    introAsk: `Hope you're well. Just following up on the quote request we sent for ${clientName} on ${sentDate}.`,
    closingParagraph:
      "Please respond to this email with your quote attached. Let us know if you need further information to progress.",
  };
}

export function buildQuoteReminderEmailHtml(
  params: QuoteReminderEmailParams,
): string {
  return buildSupplierQuoteEmailHtml(withReminderCopy(params));
}

export function buildQuoteReminderEmailText(
  params: QuoteReminderEmailParams,
): string {
  return buildSupplierQuoteEmailText(withReminderCopy(params));
}

export type { SupplierQuoteEmailItem };
