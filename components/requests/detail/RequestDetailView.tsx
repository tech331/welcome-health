"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, ChevronRight } from "lucide-react";
import type { RequestDetail } from "@/lib/requestDetail";
import { formatDateTime } from "@/lib/format";
import { RelatedRecordLink } from "@/components/related-records/RelatedRecordLink";
import { RequestStageMetroline } from "./RequestStageMetroline";
import { RequestMetrics } from "./RequestMetrics";
import { RelatedQuotes } from "./RelatedQuotes";
import { RequestActivityFeed } from "./RequestActivityFeed";
import { ItemsRequestedTable } from "./ItemsRequestedTable";

type RequestDetailViewProps = {
  request: RequestDetail;
};

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#eceae6] bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-[#606060]">
      {children}
    </h2>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 @sm:grid-cols-[9rem_1fr] @sm:gap-4">
      <div className="text-xs font-medium text-[#606060]">{label}</div>
      <div className="text-sm text-[#1a1a1a]">{children || "—"}</div>
    </div>
  );
}

export function RequestDetailView({ request }: RequestDetailViewProps) {
  const clientSubtitle = request.client
    ? request.client.clientId
      ? `Client ID ${request.client.clientId}`
      : request.client.dob !== "—"
        ? `DOB ${request.client.dob}`
        : ""
    : "";

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Card>
        <div className="mb-5">
          <h1 className="font-sans text-2xl font-semibold text-[#1a1a1a]">
            {request.requestId}
          </h1>
          {request.requestor !== "—" && (
            <p className="mt-1 text-sm text-[#606060]">
              Requestor: {request.requestor}
            </p>
          )}
        </div>
        <RequestStageMetroline status={request.status} />
      </Card>

      <RequestMetrics request={request} />

      <div className="grid gap-5 @4xl:grid-cols-[minmax(0,1fr)_20rem] @4xl:items-start">
        <div className="min-w-0 space-y-5">
          <Card>
            <div className="grid gap-6 @3xl:grid-cols-2">
              <div>
                <CardTitle>Request details</CardTitle>
                <div className="space-y-3">
                  <DetailField label="Requestor">
                    {request.requestor}
                  </DetailField>
                  <DetailField label="Follow-up frequency">
                    {request.slaBusinessDays != null
                      ? `Every ${request.slaBusinessDays} business day${
                          request.slaBusinessDays === 1 ? "" : "s"
                        }`
                      : "—"}
                  </DetailField>
                  <DetailField label="Notes">
                    {request.notes ? (
                      <span className="whitespace-pre-wrap">
                        {request.notes}
                      </span>
                    ) : (
                      "—"
                    )}
                  </DetailField>
                  <DetailField label="Suppliers requested">
                    {request.suppliers.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="space-y-1.5">
                        {request.suppliers.map((supplier) => (
                          <li key={supplier.id}>
                            <RelatedRecordLink
                              type="supplier"
                              id={supplier.id}
                              className="group flex w-full items-start gap-2 text-left text-sm text-[#2d6a4f] underline-offset-2 hover:underline"
                            >
                              <Building2
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6f9a85]"
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                              <span>{supplier.name}</span>
                            </RelatedRecordLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </DetailField>
                </div>
              </div>

              <div className="border-t border-[#f0eee9] pt-6 @3xl:border-l @3xl:border-t-0 @3xl:pl-6 @3xl:pt-0">
                <CardTitle>People</CardTitle>
                <div className="space-y-4">
                  {request.client ? (
                    <RelatedRecordLink
                      type="client"
                      id={request.client.id}
                      className="group -mx-2 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#2d6a4f]/[0.06]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-base font-semibold text-[#1a1a1a]">
                          {request.client.displayName}
                        </span>
                        {clientSubtitle && (
                          <span className="block truncate text-xs text-[#606060]">
                            {clientSubtitle}
                          </span>
                        )}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[#606060] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2d6a4f]"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </RelatedRecordLink>
                  ) : (
                    <p className="text-sm text-[#606060]">No client linked</p>
                  )}

                  {request.caseManager ? (
                    <div className="border-t border-[#f0eee9] pt-3">
                      <div className="text-xs font-medium text-[#606060]">
                        Case manager
                      </div>
                      <RelatedRecordLink
                        type="caseManager"
                        id={request.caseManager.id}
                        className="group mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#2d6a4f] underline-offset-2 hover:underline"
                      >
                        {request.caseManager.displayName}
                        <ChevronRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </RelatedRecordLink>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>{`Items requested (${request.items.length})`}</CardTitle>
            <ItemsRequestedTable items={request.items} />
          </Card>

          <Card>
            <CardTitle>{`Related quotes (${request.quotes.length})`}</CardTitle>
            <RelatedQuotes quotes={request.quotes} />
          </Card>

          <div className="px-1 pt-1 text-xs leading-relaxed text-[#606060]">
            <div>
              <span className="font-medium text-[#606060]">Created</span>{" "}
              {formatDateTime(request.createdAt)}
            </div>
            <div>
              <span className="font-medium text-[#606060]">Last modified</span>{" "}
              {formatDateTime(request.lastModifiedAt)}
              {request.lastModifiedBy !== "—"
                ? ` by ${request.lastModifiedBy}`
                : ""}
            </div>
          </div>
        </div>

        <aside className="@4xl:sticky @4xl:top-6">
          <Card>
            <CardTitle>Activity</CardTitle>
            <RequestActivityFeed activities={request.activities} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
