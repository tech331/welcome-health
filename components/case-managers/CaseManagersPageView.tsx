"use client";

import { useEffect } from "react";
import type { CaseManagerDetail, CaseManagerRecord } from "@/lib/caseManagers";
import { useQuerySelection } from "@/lib/useQuerySelection";
import { useRelatedRecords } from "@/components/related-records/RelatedRecordProvider";
import { CaseManagersTable } from "./CaseManagersTable";

type CaseManagersPageViewProps = {
  caseManagers: CaseManagerRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

export function CaseManagersPageView({
  caseManagers,
  isConfigured,
  fetchError,
}: CaseManagersPageViewProps) {
  const [selectedId, setSelectedId] = useQuerySelection();
  const { openCaseManager, close, activeRecord } = useRelatedRecords();

  useEffect(() => {
    if (!selectedId) return;
    const selectedManager = caseManagers.find((manager) => manager.id === selectedId);
    const prefetched =
      selectedManager == null
        ? undefined
        : ({
            id: selectedManager.id,
            displayName: selectedManager.displayName,
            status: "—",
            email: selectedManager.email,
            phone: selectedManager.phone,
            payer: selectedManager.payer && selectedManager.payer !== "—"
              ? { id: "", name: selectedManager.payer }
              : null,
            relatedRequests: [],
            relatedClients: [],
          } satisfies CaseManagerDetail);
    openCaseManager(selectedId, prefetched);
  }, [caseManagers, openCaseManager, selectedId]);

  const activeId =
    activeRecord?.type === "caseManager" ? activeRecord.id : null;

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Case Managers
      </h1>
      <CaseManagersTable
        caseManagers={caseManagers}
        isConfigured={isConfigured}
        fetchError={fetchError}
        selectedId={activeId}
        onSelect={(id) => {
          setSelectedId(id);
          if (!id) {
            close();
            return;
          }
          const selectedManager = caseManagers.find((manager) => manager.id === id);
          const prefetched =
            selectedManager == null
              ? undefined
              : ({
                  id: selectedManager.id,
                  displayName: selectedManager.displayName,
                  status: "—",
                  email: selectedManager.email,
                  phone: selectedManager.phone,
                  payer: selectedManager.payer && selectedManager.payer !== "—"
                    ? { id: "", name: selectedManager.payer }
                    : null,
                  relatedRequests: [],
                  relatedClients: [],
                } satisfies CaseManagerDetail);
          openCaseManager(id, prefetched);
        }}
      />
    </div>
  );
}
