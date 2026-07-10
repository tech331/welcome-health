"use client";

import type { ReactNode } from "react";
import type { RelatedRecordType } from "@/lib/relatedRecords";
import { useRelatedRecords } from "./RelatedRecordProvider";

type RelatedRecordLinkProps = {
  type: RelatedRecordType;
  id: string;
  children: ReactNode;
  className?: string;
  stopPropagation?: boolean;
};

export function RelatedRecordLink({
  type,
  id,
  children,
  className,
  stopPropagation = true,
}: RelatedRecordLinkProps) {
  const { openClient, openCaseManager, openSupplier } = useRelatedRecords();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (type === "client") openClient(id);
    else if (type === "caseManager") openCaseManager(id);
    else openSupplier(id);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
