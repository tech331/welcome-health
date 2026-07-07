"use client";

import { type SupplierRecord } from "@/lib/suppliers";
import { formatAddressLines } from "@/lib/format";
import { DetailRow, DetailValue } from "@/components/ui/DetailRow";
import { SideSheet } from "@/components/ui/SideSheet";

type SupplierSideSheetProps = {
  supplier: SupplierRecord | null;
  onClose: () => void;
};

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function SupplierSideSheet({
  supplier,
  onClose,
}: SupplierSideSheetProps) {
  return (
    <SideSheet
      record={supplier}
      onClose={onClose}
      title={(record) => record.name}
    >
      {(record) => {
        const addressLines = formatAddressLines({
          line1: record.addressLine1,
          line2: record.addressLine2,
          city: record.city,
          state: record.state,
          postcode: record.postcode,
        });
        const hasWebsite = record.website && record.website !== "—";

        return (
          <div className="space-y-5 p-5">
            <DetailRow label="Website">
              {hasWebsite ? (
                <a
                  href={normalizeUrl(record.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                >
                  {record.website}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>

            <DetailRow label="Phone">
              <DetailValue value={record.phone} />
            </DetailRow>
            <DetailRow label="Contact Email">
              <DetailValue value={record.contactEmail} />
            </DetailRow>
            <DetailRow label="Average Delivery Time">
              <DetailValue value={record.averageDeliveryTime} />
            </DetailRow>

            <DetailRow label="Address">
              {addressLines.length > 0
                ? addressLines.map((line) => <div key={line}>{line}</div>)
                : "—"}
            </DetailRow>

            <DetailRow label="Accepted Payers">
              {record.acceptedPayers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {record.acceptedPayers.map((payer) => (
                    <span
                      key={payer}
                      className="rounded-full bg-[#f0eee9] px-2.5 py-0.5 text-xs font-medium text-[#2A2A2A]/70"
                    >
                      {payer}
                    </span>
                  ))}
                </div>
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
