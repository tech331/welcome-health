export type SupplierQuoteEmailItem = {
  name: string;
  url: string;
};

export type SupplierQuoteEmailParams = {
  clientFullName: string;
  clientPhone: string;
  clientAddress: string;
  payerName: string;
  requestorFullName: string;
  requestorRole: string;
  requestorPhone: string;
  items: SupplierQuoteEmailItem[];
  slaBusinessDays: number | null;
  /** Opening ask after "Hi there,". Defaults to the standard quote request line. */
  introAsk?: string;
  /** Optional paragraph shown after the intro ask (e.g. supplier list on reminders). */
  extraIntroLine?: string;
  /** When true, skip the client name/phone/address/provider block. */
  omitClientBlock?: boolean;
  /** Optional paragraph after the equipment table (used by reminders). */
  closingParagraph?: string;
};

function formatProvider(payerName: string): string {
  const clean = payerName?.trim();
  if (!clean || clean === "—") return "";
  return `Provider: ${clean}`;
}

function formatRole(role: string): string {
  const clean = role?.trim();
  if (!clean || clean === "—") return "";
  return `${clean} - Nimbus Health`;
}

function buildSlaSentence(slaBusinessDays: number | null): string {
  if (slaBusinessDays == null || slaBusinessDays <= 0) return "";
  const unit = slaBusinessDays === 1 ? "business day" : "business days";
  return `We'd appreciate receiving your quote within ${slaBusinessDays} ${unit}.`;
}

export function buildSupplierQuoteEmailSubject(clientFullName: string): string {
  const name = clientFullName?.trim() && clientFullName !== "—" ? clientFullName : "Client";
  return `${name} - Quote`;
}

function renderItemsRows(items: SupplierQuoteEmailItem[]): string {
  if (items.length === 0) {
    return `<tr>
      <td colspan="2" style="padding: 10px 12px; font-size: 14px; color: #8c867e; border-bottom: 1px solid #f0eee9;">No equipment listed.</td>
    </tr>`;
  }

  return items
    .map((item) => {
      const name = escapeHtml(item.name?.trim() || "—");
      const rawUrl = item.url?.trim();
      const urlCell = rawUrl
        ? `<a href="${escapeHtml(rawUrl)}" target="_blank" style="color: #1b4332; text-decoration: underline; word-break: break-all;">${escapeHtml(rawUrl)}</a>`
        : `<span style="color: #8c867e;">—</span>`;
      return `<tr>
      <td style="padding: 10px 12px; font-size: 14px; color: #333333; border-bottom: 1px solid #f0eee9; vertical-align: top;">${name}</td>
      <td style="padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0eee9; vertical-align: top;">${urlCell}</td>
    </tr>`;
    })
    .join("\n");
}

function renderClientLine(value: string): string {
  const clean = value?.trim();
  if (!clean || clean === "—") return "";
  return `<div style="font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(clean)}</div>`;
}

export function buildSupplierQuoteEmailHtml(params: SupplierQuoteEmailParams): string {
  const clientBlock = [
    params.clientFullName,
    params.clientPhone,
    params.clientAddress,
    formatProvider(params.payerName),
  ]
    .map(renderClientLine)
    .filter(Boolean)
    .join("\n");

  const signatureBlock = [
    params.requestorFullName,
    formatRole(params.requestorRole),
    params.requestorPhone,
  ]
    .map((value) => {
      const clean = value?.trim();
      if (!clean || clean === "—") return "";
      return `<div style="font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(clean)}</div>`;
    })
    .filter(Boolean)
    .join("\n");

  const slaSentence = buildSlaSentence(params.slaBusinessDays);
  const slaRow = slaSentence
    ? `<tr>
                  <td align="left" style="padding-bottom: 28px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(slaSentence)}</p>
                  </td>
                </tr>`
    : "";

  const introAsk =
    params.introAsk?.trim() ||
    "Can you please provide a quote for the following client:";
  const extraIntroLine = params.extraIntroLine?.trim();
  const extraIntroRow = extraIntroLine
    ? `<p style="margin: 12px 0 0 0; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(extraIntroLine)}</p>`
    : "";

  const clientRow =
    params.omitClientBlock || !clientBlock
      ? ""
      : `<tr>
                  <td align="left" style="padding-bottom: 28px;">
                    ${clientBlock}
                  </td>
                </tr>`;

  const closingParagraph = params.closingParagraph?.trim();
  const closingRow = closingParagraph
    ? `<tr>
                  <td align="left" style="padding-bottom: 28px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(closingParagraph)}</p>
                  </td>
                </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Quote Request</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body, table, td, a { text-decoration: none; margin: 0; padding: 0; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .content-pane { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf8f5; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="width: 600px; margin: 0 auto;">
          <tr>
            <td align="left" style="padding-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 700; color: #1b4332; letter-spacing: -0.5px;">Welcome Health</span>
            </td>
          </tr>
          <tr>
            <td class="content-pane" style="background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #eae6e0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="padding-bottom: 20px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">Hi there,</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(introAsk)}</p>
                    ${extraIntroRow}
                  </td>
                </tr>
                ${clientRow}
                <tr>
                  <td align="left" style="padding-bottom: 8px;">
                    <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1b4332;">Equipment</p>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding-bottom: 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #eae6e0; border-radius: 6px;">
                      <thead>
                        <tr>
                          <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #6b6b6b; background-color: #faf8f5; border-bottom: 1px solid #eae6e0;">Item</th>
                          <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #6b6b6b; background-color: #faf8f5; border-bottom: 1px solid #eae6e0;">URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${renderItemsRows(params.items)}
                      </tbody>
                    </table>
                  </td>
                </tr>
                ${closingRow}
                ${slaRow}
                <tr>
                  <td align="left">
                    <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.6; color: #333333;">Kind regards,</p>
                    ${signatureBlock}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #8c867e;">
                &copy; 2026 Welcome Health Pty Ltd. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildSupplierQuoteEmailText(params: SupplierQuoteEmailParams): string {
  const clientLines = [
    params.clientFullName,
    params.clientPhone,
    params.clientAddress,
    formatProvider(params.payerName),
  ]
    .map((value) => value?.trim())
    .filter((value) => value && value !== "—");

  const equipmentLines =
    params.items.length > 0
      ? params.items.map((item) => {
          const name = item.name?.trim() || "—";
          const url = item.url?.trim();
          return url ? `- ${name}: ${url}` : `- ${name}`;
        })
      : ["No equipment listed."];

  const signatureLines = [
    params.requestorFullName,
    formatRole(params.requestorRole),
    params.requestorPhone,
  ]
    .map((value) => value?.trim())
    .filter((value) => value && value !== "—");

  const slaSentence = buildSlaSentence(params.slaBusinessDays);
  const slaBlock = slaSentence ? `\n${slaSentence}\n` : "";
  const introAsk =
    params.introAsk?.trim() ||
    "Can you please provide a quote for the following client:";
  const extraIntroLine = params.extraIntroLine?.trim();
  const extraIntroBlock = extraIntroLine ? `\n${extraIntroLine}\n` : "\n";
  const clientBlockText =
    params.omitClientBlock || clientLines.length === 0
      ? ""
      : `${clientLines.join("\n")}\n\n`;
  const closingParagraph = params.closingParagraph?.trim();
  const closingBlock = closingParagraph ? `\n${closingParagraph}\n` : "";

  return `Hi there,

${introAsk}
${extraIntroBlock}${clientBlockText}Equipment
${equipmentLines.join("\n")}
${closingBlock}${slaBlock}
Kind regards,

${signatureLines.join("\n")}

© 2026 Welcome Health Pty Ltd. All rights reserved.`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
