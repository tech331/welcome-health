import { getClients, isAirtableConfigured } from "@/lib/airtable";
import type { ClientRecord } from "@/lib/clients";
import { ClientsPageView } from "@/components/clients/ClientsPageView";

export default async function ClientsPage() {
  let clients: ClientRecord[] = [];
  let fetchError: string | null = null;

  try {
    clients = await getClients();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch clients";
    console.error("Failed to fetch Airtable clients:", error);
    fetchError = message;
  }

  return (
    <ClientsPageView
      clients={clients}
      isConfigured={isAirtableConfigured()}
      fetchError={fetchError}
    />
  );
}
