import { getCaseManagers, isAirtableConfigured } from "@/lib/airtable";
import type { CaseManagerRecord } from "@/lib/caseManagers";
import { CaseManagersPageView } from "@/components/case-managers/CaseManagersPageView";

export const revalidate = 30;

export default async function CaseManagersPage() {
  let caseManagers: CaseManagerRecord[] = [];
  let fetchError: string | null = null;

  try {
    caseManagers = await getCaseManagers();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch case managers";
    console.error("Failed to fetch Airtable case managers:", error);
    fetchError = message;
  }

  return (
    <CaseManagersPageView
      caseManagers={caseManagers}
      isConfigured={isAirtableConfigured()}
      fetchError={fetchError}
    />
  );
}
