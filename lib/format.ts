type AddressParts = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
};

function isPresent(value?: string): value is string {
  return Boolean(value) && value !== "—";
}

export function formatAddressLines(parts: AddressParts): string[] {
  const lines: string[] = [];

  if (isPresent(parts.line1)) lines.push(parts.line1);
  if (isPresent(parts.line2)) lines.push(parts.line2);

  const cityLine = [parts.city, parts.state, parts.postcode]
    .filter(isPresent)
    .join(" ");
  if (cityLine) lines.push(cityLine);

  return lines;
}

/**
 * Format a request's auto-number into a padded, prefixed ID (e.g. 5 -> QR-0005).
 * Non-numeric values (like an Airtable record id fallback) are returned as-is.
 */
export function formatRequestId(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const raw = String(value).trim();
  if (!raw || raw === "—") return "—";
  if (/^QR-?\d+$/i.test(raw)) {
    const digits = raw.replace(/^QR-?/i, "");
    return `QR-${digits.padStart(4, "0")}`;
  }
  if (/^\d+$/.test(raw)) return `QR-${raw.padStart(4, "0")}`;
  return raw;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Count weekdays strictly after `start` up to and including `end`. */
export function businessDaysBetween(start: Date, end: Date): number {
  const from = new Date(start);
  from.setHours(0, 0, 0, 0);
  const to = new Date(end);
  to.setHours(0, 0, 0, 0);

  if (to <= from) return 0;

  let count = 0;
  const cursor = new Date(from);
  while (cursor < to) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

export function parseCurrencyInput(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
