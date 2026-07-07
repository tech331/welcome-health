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
