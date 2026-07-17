import { getRequests, isAirtableConfigured } from "@/lib/airtable";
import {
  getRequestTabCounts,
  type RequestRecord,
} from "@/lib/requests";
import {
  RequestsPageContent,
  RequestsPageHeader,
} from "@/components/requests/RequestsPageContent";

export const revalidate = 30;

export default async function RequestsPage() {
  let requests: RequestRecord[] = [];
  let fetchError: string | null = null;

  try {
    requests = await getRequests();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch requests";
    console.error("Failed to fetch Airtable requests:", error);
    fetchError = message;
  }

  const counts = getRequestTabCounts(requests);

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <RequestsPageHeader />
      <RequestsPageContent
        requests={requests}
        counts={counts}
        isConfigured={isAirtableConfigured()}
        fetchError={fetchError}
      />
    </div>
  );
}
