export function getTableEmptyMessage(
  entity: string,
  isConfigured: boolean,
  fetchError?: string | null,
): string {
  if (!isConfigured) {
    return "Data is not available right now. Please try again later.";
  }

  if (fetchError?.includes("403")) {
    return "You do not have permission to view this data.";
  }

  if (fetchError) {
    return `Could not load ${entity}. Please try again later.`;
  }

  return `No ${entity} found`;
}
