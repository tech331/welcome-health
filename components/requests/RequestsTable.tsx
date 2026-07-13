"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { RequestRecord } from "@/lib/requests";
import { formatDate } from "@/lib/format";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";
import { StatusChip } from "./StatusChip";
import { SlaProgress } from "./SlaProgress";

type RequestsTableProps = {
  requests: RequestRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

type SortKey = "requestId" | "requestor" | "client" | "status" | "created" | "sla";
type SortDirection = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "requestId", label: "Request ID" },
  { key: "client", label: "Client" },
  { key: "requestor", label: "Requestor" },
  { key: "status", label: "Status" },
  { key: "sla", label: "SLA" },
  { key: "created", label: "Created" },
];

function createdValue(request: RequestRecord): number | null {
  if (!request.createdAt) return null;
  const time = new Date(request.createdAt).getTime();
  return Number.isNaN(time) ? null : time;
}

function slaValue(request: RequestRecord): number | null {
  if (request.slaBusinessDays == null || request.daysElapsed == null) {
    return null;
  }
  return request.daysElapsed / request.slaBusinessDays;
}

function compareRequests(
  a: RequestRecord,
  b: RequestRecord,
  key: SortKey,
): number {
  switch (key) {
    case "requestId":
      return a.requestId.localeCompare(b.requestId, undefined, {
        numeric: true,
      });
    case "requestor":
      return a.requestor.localeCompare(b.requestor, undefined, {
        numeric: true,
      });
    case "client":
      return a.clientName.localeCompare(b.clientName, undefined, {
        numeric: true,
      });
    case "status":
      return a.status.localeCompare(b.status);
    case "created": {
      const aValue = createdValue(a);
      const bValue = createdValue(b);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      return aValue - bValue;
    }
    case "sla": {
      const aValue = slaValue(a);
      const bValue = slaValue(b);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      return aValue - bValue;
    }
    default:
      return 0;
  }
}

export function RequestsTable({
  requests,
  isConfigured,
  fetchError,
}: RequestsTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("requestId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const sortedRequests = useMemo(() => {
    const sorted = [...requests].sort((a, b) => compareRequests(a, b, sortKey));
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [requests, sortKey, sortDirection]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#faf8f5]">
            {COLUMNS.map((column) => {
              const isActive = sortKey === column.key;
              return (
                <th key={column.key} className="px-4 py-3 font-medium text-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-[#2d6a4f]"
                  >
                    {column.label}
                    {isActive ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                      )
                    ) : (
                      <ChevronsUpDown
                        className="h-3.5 w-3.5 text-[#2A2A2A]/30 transition-colors group-hover:text-[#2d6a4f]/60"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRequests.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-4 py-12 text-center text-[#2A2A2A]/60"
              >
                {getTableEmptyMessage("requests", isConfigured, fetchError)}
              </td>
            </tr>
          ) : (
            sortedRequests.map((request) => (
              <tr
                key={request.id}
                onClick={() => router.push(`/requests/${request.id}`)}
                className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-black/[0.02]"
              >
                <td className="px-4 py-3 font-medium text-[#2A2A2A]">
                  {request.requestId}
                </td>
                <td className="px-4 py-3 text-[#2A2A2A]">{request.clientName}</td>
                <td className="px-4 py-3 text-[#2A2A2A]">{request.requestor}</td>
                <td className="px-4 py-3">
                  <StatusChip status={request.status} />
                </td>
                <td className="px-4 py-3">
                  <SlaProgress
                    slaBusinessDays={request.slaBusinessDays}
                    daysElapsed={request.daysElapsed}
                    slaProgressPercent={request.slaProgressPercent}
                    isSlaOverdue={request.isSlaOverdue}
                  />
                </td>
                <td className="px-4 py-3 text-[#2A2A2A]/70">
                  {formatDate(request.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
