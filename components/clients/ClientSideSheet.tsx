"use client";

import Link from "next/link";
import { type ClientRecord } from "@/lib/clients";
import { formatAddressLines } from "@/lib/format";
import { DetailRow, DetailValue } from "@/components/ui/DetailRow";
import { SideSheet } from "@/components/ui/SideSheet";
import { RelatedRecordLink } from "@/components/related-records/RelatedRecordLink";

type ClientSideSheetProps = {
  client: ClientRecord | null;
  onClose: () => void;
  listHref?: string;
  listLabel?: string;
};

export function ClientSideSheet({
  client,
  onClose,
  listHref,
  listLabel,
}: ClientSideSheetProps) {
  return (
    <SideSheet
      record={client}
      onClose={onClose}
      title={(record) => record.displayName}
      listHref={listHref}
      listLabel={listLabel}
    >
      {(record) => {
        const addressLines = formatAddressLines({
          line1: record.addressLine1,
          line2: record.addressLine2,
          city: record.city,
          state: record.state,
          postcode: record.postcode,
        });

        return (
          <div className="space-y-5 p-5">
            <DetailRow label="Date of Birth">
              <DetailValue value={record.dob} />
            </DetailRow>
            <DetailRow label="Email">
              <DetailValue value={record.email} />
            </DetailRow>

            <DetailRow label="Address">
              {addressLines.length > 0
                ? addressLines.map((line) => <div key={line}>{line}</div>)
                : "—"}
            </DetailRow>

            <DetailRow label="Phone">
              <DetailValue value={record.phone} />
            </DetailRow>

            <div className="border-t border-gray-100 pt-5">
              <DetailRow label="Case Manager">
                {record.caseManager ? (
                  <RelatedRecordLink
                    type="caseManager"
                    id={record.caseManager.id}
                    className="text-left text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                  >
                    {record.caseManager.displayName}
                  </RelatedRecordLink>
                ) : (
                  <span className="text-[#2A2A2A]/50">—</span>
                )}
              </DetailRow>
            </div>

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
        );
      }}
    </SideSheet>
  );
}
