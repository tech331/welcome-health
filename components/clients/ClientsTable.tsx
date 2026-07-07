"use client";

import { ChevronRight } from "lucide-react";
import type { ClientRecord } from "@/lib/clients";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";
import { CaseManagerCell } from "./CaseManagerCell";

type ClientsTableProps = {
  clients: ClientRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
};

function formatRequestCount(total: number, open: number): string {
  if (total === 0) return "0";
  if (open === 0) return String(total);
  return `${total} (${open} open)`;
}

export function ClientsTable({
  clients,
  isConfigured,
  fetchError,
  selectedClientId,
  onSelectClient,
}: ClientsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#faf8f5]">
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Client</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Client ID</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">
              Case Manager
            </th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Requests</th>
            <th className="w-12 px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-[#2A2A2A]/60"
              >
                {getTableEmptyMessage("clients", isConfigured, fetchError)}
              </td>
            </tr>
          ) : (
            clients.map((client) => {
              const isSelected = selectedClientId === client.id;

              return (
                <tr
                  key={client.id}
                  onClick={() =>
                    onSelectClient(isSelected ? null : client.id)
                  }
                  className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-black/[0.02] ${
                    isSelected ? "bg-[#e8f0eb]/60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#2A2A2A]">
                      {client.displayName}
                    </div>
                    <div className="mt-0.5 text-xs text-[#2A2A2A]/60">
                      {client.dob}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#2A2A2A]">
                    {client.clientId}
                  </td>
                  <td className="px-4 py-3">
                    <CaseManagerCell caseManager={client.caseManager} />
                  </td>
                  <td className="px-4 py-3 text-[#2A2A2A]">
                    {formatRequestCount(
                      client.requestCount,
                      client.openRequestCount,
                    )}
                  </td>
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
