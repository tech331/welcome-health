"use client";

import type { CaseManagerRecord } from "@/lib/caseManagers";
import { SideSheet } from "@/components/ui/SideSheet";

type CaseManagerSideSheetProps = {
  caseManager: CaseManagerRecord | null;
  onClose: () => void;
};

export function CaseManagerSideSheet({
  caseManager,
  onClose,
}: CaseManagerSideSheetProps) {
  return (
    <SideSheet
      record={caseManager}
      onClose={onClose}
      width="w-80"
      title={(record) => record.displayName}
    >
      {() => null}
    </SideSheet>
  );
}
