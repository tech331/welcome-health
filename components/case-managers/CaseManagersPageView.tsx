"use client";

import { useEffect } from "react";
import type { CaseManagerRecord } from "@/lib/caseManagers";
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
    openCaseManager(selectedId);
  }, [openCaseManager, selectedId]);

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
          openCaseManager(id);
        }}
      />
    </div>
  );
}
