"use client";

import { type ReactNode } from "react";
import { Info } from "lucide-react";
import { type RequestFormData } from "@/lib/requestForm";
import { formatAddressLines } from "@/lib/format";
import { type FormState } from "./formState";

type StepReviewProps = {
  state: FormState;
  data: RequestFormData;
};

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-[#2A2A2A]/60">{label}</span>
      <span className="text-right text-[#2A2A2A]">{value || "—"}</span>
    </div>
  );
}

export function StepReview({ state, data }: StepReviewProps) {
  const requestor = data.requestors.find((r) => r.id === state.requestorId);
  const selectedSuppliers = data.suppliers.filter((s) =>
    state.supplierIds.includes(s.id),
  );

  const existingClient = data.clients.find(
    (c) => c.id === state.existingClientId,
  );
  const newClientCaseManager = data.caseManagers.find(
    (cm) => cm.id === state.newClient.caseManagerId,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#2d6a4f]/30 bg-[#e8f0eb]/60 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2d6a4f]" strokeWidth={1.75} />
        <p className="text-sm text-[#2A2A2A]">
          By clicking Submit, this request and its item/s will be saved to
          Airtable with the selected suppliers.
        </p>
      </div>

      {requestor && (
        <SummarySection title="Requestor">
          <SummaryRow label="Name" value={requestor.name} />
        </SummarySection>
      )}

      <SummarySection title="Client">
        {state.clientMode === "existing" ? (
          <>
            <SummaryRow label="Name" value={existingClient?.name} />
            <SummaryRow label="Client ID" value={existingClient?.clientId} />
            <SummaryRow
              label="Funding type"
              value={existingClient?.fundingType}
            />
            <SummaryRow
              label="Case manager"
              value={existingClient?.caseManagerName}
            />
          </>
        ) : (
          <>
            <SummaryRow
              label="Name"
              value={`${state.newClient.firstName} ${state.newClient.lastName}`.trim()}
            />
            <SummaryRow label="Date of birth" value={state.newClient.dateOfBirth} />
            <SummaryRow label="Phone" value={state.newClient.phone} />
            <SummaryRow label="Funding type" value={state.newClient.fundingType} />
            <SummaryRow
              label="Address"
              value={
                <span className="whitespace-pre-line">
                  {formatAddressLines({
                    line1: state.newClient.addressLine1,
                    line2: state.newClient.addressLine2,
                    city: state.newClient.city,
                    state: state.newClient.state,
                    postcode: state.newClient.postcode,
                  }).join("\n") || "—"}
                </span>
              }
            />
            <SummaryRow
              label="Case manager"
              value={newClientCaseManager?.name}
            />
            <SummaryRow
              label="Status"
              value={
                <span className="rounded-full bg-[#fbe4cf] px-2 py-0.5 text-xs font-medium text-[#8a4b1f]">
                  New client
                </span>
              }
            />
          </>
        )}
      </SummarySection>

      <SummarySection title={`Items (${state.items.length})`}>
        <ul className="divide-y divide-gray-100">
          {state.items.map((item, index) => (
            <li key={item.uid} className="py-2 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#2A2A2A]">
                  {item.name || `Item ${index + 1}`}
                </span>
                <span className="text-xs text-[#2A2A2A]/50">
                  Qty {item.quantity || "1"}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-[#2A2A2A]/60">
                {item.category}
                {item.url ? ` · ${item.url}` : ""}
              </div>
              {item.notes && (
                <div className="mt-0.5 text-xs italic text-[#2A2A2A]/50">
                  {item.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      </SummarySection>

      <SummarySection title={`Suppliers (${selectedSuppliers.length})`}>
        <ul className="space-y-1.5">
          {selectedSuppliers.map((supplier) => (
            <li
              key={supplier.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-[#2A2A2A]">{supplier.name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <SummaryRow
            label="Follow-up frequency"
            value={
              state.followUpBusinessDays
                ? `Every ${state.followUpBusinessDays} business day${
                    state.followUpBusinessDays === 1 ? "" : "s"
                  }`
                : "—"
            }
          />
        </div>
      </SummarySection>
    </div>
  );
}
