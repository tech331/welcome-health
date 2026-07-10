"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import type { CaseManagerDetail } from "@/lib/caseManagers";
import { DetailRow, DetailValue } from "@/components/ui/DetailRow";
import { SideSheet } from "@/components/ui/SideSheet";
import { RelatedRecordLink } from "@/components/related-records/RelatedRecordLink";
import { StatusChip } from "@/components/requests/StatusChip";

type CaseManagerSideSheetProps = {
  caseManager: CaseManagerDetail | null;
  onClose: () => void;
  listHref?: string;
  listLabel?: string;
};

export function CaseManagerSideSheet({
  caseManager,
  onClose,
  listHref,
  listLabel,
}: CaseManagerSideSheetProps) {
  return (
    <SideSheet
      record={caseManager}
      onClose={onClose}
      title={(record) => record.displayName}
      listHref={listHref}
      listLabel={listLabel}
    >
      {(record) => (
        <div className="space-y-5 p-5">
          <DetailRow label="Status">
            {record.status && record.status !== "—" ? (
              <StatusChip status={record.status} />
            ) : (
              "—"
            )}
          </DetailRow>

          <DetailRow label="Email">
            <DetailValue value={record.email} />
          </DetailRow>

          <DetailRow label="Phone">
            <DetailValue value={record.phone} />
          </DetailRow>

          <DetailRow label="Related Payer">
            {record.payer ? (
              <Link
                href={
                  record.payer.id
                    ? `/payers?expanded=${record.payer.id}`
                    : "/payers"
                }
                className="flex items-center gap-3 rounded-xl border border-[#eceae6] bg-[#faf8f5] px-4 py-3 text-left transition-colors hover:border-[#2d6a4f]/30 hover:bg-[#e8f0eb]/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2f0] text-[#2d6a4f]">
                  <Shield className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-medium text-[#2A2A2A]">
                  {record.payer.name}
                </span>
              </Link>
            ) : (
              <span className="text-[#2A2A2A]/50">—</span>
            )}
          </DetailRow>

          <div className="border-t border-gray-100 pt-5">
            <DetailRow label="Related Requests">
              {record.relatedRequests.length > 0 ? (
                <ul className="space-y-1.5">
                  {record.relatedRequests.map((request) => (
                    <li key={request.id}>
                      <Link
                        href={`/requests/${request.id}`}
                        className="flex items-center justify-between text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                      >
                        <span>{request.requestId}</span>
                        <span className="text-[#2A2A2A]/50">
                          {request.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#2A2A2A]/50">None</span>
              )}
            </DetailRow>
          </div>

          <DetailRow label="Related Clients">
            {record.relatedClients.length > 0 ? (
              <ul className="space-y-1.5">
                {record.relatedClients.map((client) => (
                  <li key={client.id}>
                    <RelatedRecordLink
                      type="client"
                      id={client.id}
                      className="text-left text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                    >
                      {client.displayName}
                    </RelatedRecordLink>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[#2A2A2A]/50">None</span>
            )}
          </DetailRow>
        </div>
      )}
    </SideSheet>
  );
}
