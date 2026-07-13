import { Resend } from "resend";
import {
  createActivityRecord,
  getSupplierQuoteEmailContext,
} from "@/lib/airtable";
import {
  buildSupplierQuoteEmailHtml,
  buildSupplierQuoteEmailSubject,
  buildSupplierQuoteEmailText,
  type SupplierQuoteEmailItem,
} from "./supplierQuoteEmail";

export type SendSupplierQuoteEmailsParams = {
  requestRecordId: string;
  requestId: string;
  items: SupplierQuoteEmailItem[];
  slaBusinessDays: number | null;
};

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function splitEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

// NOTE: While testing we deliberately DO NOT email the supplier addresses stored
// in Airtable. Every supplier quote email is routed to SUPPLIER_TO_EMAIL (cc'd
// to SUPPLIER_CC_EMAIL) instead.
function getSupplierRecipients(): { to: string[]; cc: string[] } {
  return {
    to: splitEmails(process.env.SUPPLIER_TO_EMAIL),
    cc: splitEmails(process.env.SUPPLIER_CC_EMAIL),
  };
}

export function isSupplierQuoteEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim() &&
      getSupplierRecipients().to.length > 0,
  );
}

export async function sendSupplierQuoteEmails({
  requestRecordId,
  requestId,
  items,
  slaBusinessDays,
}: SendSupplierQuoteEmailsParams): Promise<void> {
  const resend = getResendClient();
  const from = process.env.ACKNOWLEDGEMENT_FROM_EMAIL?.trim();
  const { to, cc } = getSupplierRecipients();

  if (!resend || !from || to.length === 0) {
    console.warn(
      "Supplier quote emails skipped: missing RESEND_API_KEY, ACKNOWLEDGEMENT_FROM_EMAIL, or SUPPLIER_TO_EMAIL.",
    );
    return;
  }

  const context = await getSupplierQuoteEmailContext(requestRecordId);
  if (!context) {
    console.warn(
      `Supplier quote emails skipped: could not load context for request ${requestId}.`,
    );
    return;
  }

  if (context.suppliers.length === 0) {
    return;
  }

  const subject = buildSupplierQuoteEmailSubject(context.client.fullName);
  const emailParams = {
    clientFullName: context.client.fullName,
    clientPhone: context.client.phone,
    clientAddress: context.client.address,
    payerName: context.payerName,
    requestorFullName: context.requestor.fullName,
    requestorRole: context.requestor.role,
    requestorPhone: context.requestor.phone,
    items,
    slaBusinessDays,
  };
  const html = buildSupplierQuoteEmailHtml(emailParams);
  const text = buildSupplierQuoteEmailText(emailParams);

  // One email per selected supplier (all routed to the test recipients for now).
  for (const supplier of context.suppliers) {
    try {
      const { data, error } = await resend.emails.send({
        from: `Welcome Health <${from}>`,
        to,
        ...(cc.length > 0 ? { cc } : {}),
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
        content: `Quote request email for supplier "${supplier.name}" sent to ${to.join(
          ", ",
        )}${cc.length > 0 ? ` (cc: ${cc.join(", ")})` : ""} for request ${requestId}.${
          data?.id ? ` (Resend ID: ${data.id})` : ""
        }`,
      });
    } catch (supplierError) {
      console.error(
        `Failed to send supplier quote email for "${supplier.name}" (request ${requestId}):`,
        supplierError,
      );
    }
  }
}
