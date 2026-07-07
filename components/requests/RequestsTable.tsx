"use client";

import { useRouter } from "next/navigation";
import type { RequestRecord } from "@/lib/requests";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";

type RequestsTableProps = {
  requests: RequestRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

export function RequestsTable({
  requests,
  isConfigured,
  fetchError,
}: RequestsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#faf8f5]">
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Request ID</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Requestor</th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-12 text-center text-[#2A2A2A]/60"
              >
                {getTableEmptyMessage("requests", isConfigured, fetchError)}
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr
                key={request.id}
                onClick={() => router.push(`/requests/${request.id}`)}
                className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-black/[0.02]"
              >
                <td className="px-4 py-3 font-medium text-[#2A2A2A]">
                  {request.requestId}
                </td>
                <td className="px-4 py-3 text-[#2A2A2A]">{request.requestor}</td>
                <td className="px-4 py-3 text-[#2A2A2A]">{request.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
