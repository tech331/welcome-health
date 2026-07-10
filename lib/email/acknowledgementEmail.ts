export type AcknowledgementEmailParams = {
  requestId: string;
  requestUrl: string;
};

export function buildAcknowledgementEmailHtml({
  requestId,
  requestUrl,
}: AcknowledgementEmailParams): string {
  const safeRequestId = escapeHtml(requestId);
  const safeRequestUrl = escapeHtml(requestUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Quote Request Submitted</title>
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
                  <td align="center" style="padding-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1b4332; line-height: 1.3; text-align: center;">New Quote Request Submitted</h1>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding-bottom: 30px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">Hi,</p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">Thanks for submitting your quote request.</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">Please keep this email as a receipt for your records.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${safeRequestUrl}" target="_blank" style="background-color: #e8f0eb; color: #1b4332; font-size: 16px; font-weight: 600; display: inline-block; padding: 14px 28px; border-radius: 6px; text-align: center;">View Request Details</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 4px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; color: #1b4332;">Reference: ${safeRequestId}</p>
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

export function buildAcknowledgementEmailText({
  requestId,
  requestUrl,
}: AcknowledgementEmailParams): string {
  return `Hi,

Thanks for submitting your quote request.

Please keep this email as a receipt for your records.

View request details: ${requestUrl}

Reference: ${requestId}

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

export function getRequestDetailUrl(requestRecordId: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return `${configured.replace(/\/$/, "")}/requests/${requestRecordId}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}/requests/${requestRecordId}`;
  }

  return `http://localhost:3000/requests/${requestRecordId}`;
}
