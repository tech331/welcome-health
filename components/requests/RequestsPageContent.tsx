"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  filterRequestsByTab,
  type RequestRecord,
  type RequestTab,
} from "@/lib/requests";
import { NewRequestButton } from "./NewRequestButton";
import { RequestTabs } from "./RequestTabs";
import { RequestsTable } from "./RequestsTable";

type RequestsPageContentProps = {
  requests: RequestRecord[];
  counts: Record<RequestTab, number>;
  isConfigured: boolean;
  fetchError?: string | null;
};

function parseTab(tab: string | null): RequestTab {
  if (tab === "open" || tab === "closed" || tab === "overdue") {
    return tab;
  }
  return "all";
}

function RequestsPageContentInner({
  requests,
  counts,
  isConfigured,
  fetchError,
}: RequestsPageContentProps) {
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));
  const filteredRequests = filterRequestsByTab(requests, activeTab);

  return (
    <>
      <div className="mb-6">
        <RequestTabs counts={counts} />
      </div>
      <RequestsTable
        requests={filteredRequests}
        isConfigured={isConfigured}
        fetchError={fetchError}
      />
    </>
  );
}

export function RequestsPageContent(props: RequestsPageContentProps) {
  return (
    <Suspense
      fallback={
        <div className="mb-6 h-10 animate-pulse rounded bg-[#ede8e3]" />
      }
    >
      <RequestsPageContentInner {...props} />
    </Suspense>
  );
}

export function RequestsPageHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-sans text-2xl font-semibold text-[#2A2A2A]">
        Requests
      </h1>
      <NewRequestButton />
    </div>
  );
}
