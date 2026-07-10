"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { PayerRecord } from "@/lib/payers";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";
import { PayerTile } from "./PayerTile";

type PayersListProps = {
  payers: PayerRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

function PayersListInner({
  payers,
  isConfigured,
  fetchError,
}: PayersListProps) {
  const searchParams = useSearchParams();
  const expandedId = searchParams.get("expanded");

  if (payers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-[#2A2A2A]/60 shadow-sm">
        {getTableEmptyMessage("payers", isConfigured, fetchError)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payers.map((payer) => (
        <PayerTile
          key={payer.id}
          payer={payer}
          defaultExpanded={expandedId === payer.id}
        />
      ))}
    </div>
  );
}

export function PayersList(props: PayersListProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      }
    >
      <PayersListInner {...props} />
    </Suspense>
  );
}
