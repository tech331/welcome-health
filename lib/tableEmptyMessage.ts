export function getTableEmptyMessage(
  entity: string,
  isConfigured: boolean,
  fetchError?: string | null,
): string {
  if (!isConfigured) {
    return "Connect Airtable by adding your API key to .env.local";
  }

  if (fetchError?.includes("403")) {
    return "Airtable access denied — check your token has data.records:read scope and access to this base.";
  }

  if (fetchError) {
    return `Could not load ${entity} from Airtable. Check the server logs for details.`;
  }

  return `No ${entity} found`;
}
