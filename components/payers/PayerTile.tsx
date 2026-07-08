"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Mail, Phone, Shield, Truck } from "lucide-react";
import { getAvatarColor, type PayerRecord } from "@/lib/payers";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold text-[#2A2A2A]">{value}</div>
      <div className="text-xs text-[#2A2A2A]/60">{label}</div>
    </div>
  );
}

export function PayerTile({ payer }: { payer: PayerRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2f0] text-[#2d6a4f]">
          <Shield className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#2A2A2A]">{payer.name}</span>
            {payer.category && (
              <span className="rounded-full bg-[#f0eee9] px-2.5 py-0.5 text-xs font-medium text-[#2A2A2A]/70">
                {payer.category}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#2A2A2A]/60">
            {payer.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                {payer.email}
              </span>
            )}
            {payer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                {payer.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <Stat value={payer.suppliers.length} label="Suppliers" />
          <Stat value={payer.caseManagers.length} label="Case Mgrs" />
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-8 border-t border-gray-100 px-5 py-5 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
              Approved Suppliers
            </h3>
            {payer.suppliers.length === 0 ? (
              <p className="text-sm text-[#2A2A2A]/50">None linked</p>
            ) : (
              <ul className="space-y-2.5">
                {payer.suppliers.map((supplier) => (
                  <li
                    key={supplier.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/suppliers?selected=${supplier.id}`}
                      className="flex items-center gap-2 text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                    >
                      <Truck
                        className="h-4 w-4 text-gray-400"
                        strokeWidth={1.75}
                      />
                      {supplier.name}
                    </Link>
                    {supplier.detail && (
                      <span className="text-[#2A2A2A]/50">
                        {supplier.detail}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
              Case Managers
            </h3>
            {payer.caseManagers.length === 0 ? (
              <p className="text-sm text-[#2A2A2A]/50">None linked</p>
            ) : (
              <ul className="space-y-2.5">
                {payer.caseManagers.map((manager) => {
                  const color = getAvatarColor(manager.displayName);
                  return (
                    <li
                      key={manager.id}
                      className="flex items-center gap-2.5 text-sm text-[#2A2A2A]"
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundColor: color.bg,
                          color: color.text,
                        }}
                      >
                        {manager.initials}
                      </span>
                      {manager.displayName}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
