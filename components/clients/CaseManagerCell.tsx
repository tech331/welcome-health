"use client";

import Link from "next/link";
import type { CaseManagerContact } from "@/lib/clients";

type CaseManagerCellProps = {
  caseManager: CaseManagerContact | null;
};

export function CaseManagerCell({ caseManager }: CaseManagerCellProps) {
  if (!caseManager) {
    return <span className="text-[#2A2A2A]/60">—</span>;
  }

  return (
    <Link
      href={`/case-managers?selected=${caseManager.id}`}
      onClick={(event) => event.stopPropagation()}
      className="text-left text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
    >
      {caseManager.displayName}
    </Link>
  );
}
