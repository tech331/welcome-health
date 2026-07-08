"use client";

import type { CaseManagerRecord } from "@/lib/caseManagers";
import { useQuerySelection } from "@/lib/useQuerySelection";
import { CaseManagerSideSheet } from "./CaseManagerSideSheet";
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

  const selected =
    caseManagers.find((manager) => manager.id === selectedId) ?? null;

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-8 pb-8 pt-8">
        <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
          Case Managers
        </h1>
        <CaseManagersTable
          caseManagers={caseManagers}
          isConfigured={isConfigured}
          fetchError={fetchError}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <CaseManagerSideSheet
        caseManager={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
