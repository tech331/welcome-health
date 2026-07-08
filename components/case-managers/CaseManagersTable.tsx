"use client";

import { ChevronRight } from "lucide-react";
import type { CaseManagerRecord } from "@/lib/caseManagers";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";

type CaseManagersTableProps = {
  caseManagers: CaseManagerRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function CaseManagersTable({
  caseManagers,
  isConfigured,
  fetchError,
  selectedId,
  onSelect,
}: CaseManagersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#faf8f5]">
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">
              Case Manager
            </th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Email</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Phone</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Payer</th>
            <th className="w-12 px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {caseManagers.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-[#2A2A2A]/60"
              >
                {getTableEmptyMessage(
                  "case managers",
                  isConfigured,
                  fetchError,
                )}
              </td>
            </tr>
          ) : (
            caseManagers.map((manager) => {
              const isSelected = selectedId === manager.id;

              return (
                <tr
                  key={manager.id}
                  onClick={() => onSelect(isSelected ? null : manager.id)}
                  className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-black/[0.02] ${
                    isSelected ? "bg-[#e8f0eb]/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-[#2A2A2A]">
                    {manager.displayName}
                  </td>
                  <td className="px-4 py-3 text-[#2A2A2A]">{manager.email}</td>
                  <td className="px-4 py-3 text-[#2A2A2A]">{manager.phone}</td>
                  <td className="px-4 py-3 text-[#2A2A2A]">{manager.payer}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                        isSelected ? "text-[#2d6a4f]" : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
