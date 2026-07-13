export function buildEmailActivityContent(
  label: string,
  to: string[],
  options?: { cc?: string[] },
): string {
  const toPart = to.join(", ");
  let content = `${label}: ${toPart}`;
  if (options?.cc && options.cc.length > 0) {
    content += ` (cc: ${options.cc.join(", ")})`;
  }
  return content;
}

/** Append a Resend ID on a separate line for smaller UI rendering. */
export function appendResendId(content: string, resendId?: string | null): string {
  if (!resendId) return content;
  return `${content}\nResend: ${resendId}`;
}

/** Split stored activity content into main text and an optional Resend ID. */
export function parseActivityContent(content: string): {
  main: string;
  resendId: string | null;
} {
  const resendMatch = content.match(/\nResend: (.+)$/);
  if (resendMatch?.index != null) {
    return {
      main: content.slice(0, resendMatch.index).trim(),
      resendId: resendMatch[1].trim(),
    };
  }

  const legacyResendMatch = content.match(/ \(Resend ID: ([^)]+)\)$/);
  if (legacyResendMatch?.index != null) {
    return {
      main: content.slice(0, legacyResendMatch.index).trim(),
      resendId: legacyResendMatch[1].trim(),
    };
  }

  return { main: content, resendId: null };
}
