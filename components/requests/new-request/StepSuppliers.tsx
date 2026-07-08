"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { Info } from "lucide-react";
import {
  FOLLOW_UP_OPTIONS,
  type RequestFormData,
} from "@/lib/requestForm";
import {
  availableSuppliers,
  resolvePayerIds,
  type FormState,
  type StepErrors,
} from "./formState";

type StepSuppliersProps = {
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
  errors: StepErrors;
  data: RequestFormData;
};

export function StepSuppliers({
  state,
  setState,
  errors,
  data,
}: StepSuppliersProps) {
  const [showAll, setShowAll] = useState(false);

  const payerIds = resolvePayerIds(state, data);
  const suppliers = availableSuppliers(state, data, showAll);
  const hasPayerMatch = payerIds.length > 0;

  function toggleSupplier(id: string) {
    setState((prev) => ({
      ...prev,
      supplierIds: prev.supplierIds.includes(id)
        ? prev.supplierIds.filter((s) => s !== id)
        : [...prev.supplierIds, id],
    }));
  }

  function setFollowUp(days: number) {
    setState((prev) => ({ ...prev, followUpBusinessDays: days }));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2A2A2A]">
            {showAll ? "All suppliers" : "Approved suppliers"}
          </h3>
          {state.supplierIds.length > 0 && (
            <span className="text-xs text-[#2A2A2A]/50">
              {state.supplierIds.length} selected
            </span>
          )}
        </div>

        {suppliers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-[#2A2A2A]/60">
              {hasPayerMatch
                ? "No approved suppliers found for this client's payer."
                : "This client's case manager has no linked payer, so approved suppliers can't be determined."}
            </p>
            {!showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-3 text-sm font-medium text-[#2d6a4f] underline-offset-2 hover:underline"
              >
                Show all suppliers instead
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {suppliers.map((supplier) => {
              const checked = state.supplierIds.includes(supplier.id);
              return (
                <li key={supplier.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      checked
                        ? "border-[#2d6a4f] bg-[#e8f0eb]/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSupplier(supplier.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#2A2A2A]">
                          {supplier.name}
                        </span>
                        {supplier.averageDeliveryDays != null && (
                          <span className="rounded-full bg-[#ede8e3] px-2 py-0.5 text-xs font-medium text-[#2A2A2A]/70">
                            ~{supplier.averageDeliveryDays} day
                            {supplier.averageDeliveryDays === 1 ? "" : "s"} delivery
                          </span>
                        )}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {suppliers.length > 0 && hasPayerMatch && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-2 text-xs font-medium text-[#2A2A2A]/50 underline-offset-2 hover:text-[#2d6a4f] hover:underline"
          >
            Show all suppliers
          </button>
        )}
        {showAll && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="mt-2 text-xs font-medium text-[#2A2A2A]/50 underline-offset-2 hover:text-[#2d6a4f] hover:underline"
          >
            Show approved suppliers only
          </button>
        )}

        {errors.suppliers && (
          <p className="mt-2 text-xs text-[#b3261e]">{errors.suppliers}</p>
        )}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-[#2A2A2A]">
          How often would you like to follow up suppliers if you haven&apos;t
          received a quote?
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {FOLLOW_UP_OPTIONS.map((days) => {
            const selected = state.followUpBusinessDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => setFollowUp(days)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[#2d6a4f] bg-[#2d6a4f] text-white"
                    : "border-gray-300 bg-white text-[#2A2A2A] hover:border-[#2d6a4f]"
                }`}
              >
                {days} business day{days === 1 ? "" : "s"}
              </button>
            );
          })}
        </div>
        {errors.followUp && (
          <p className="mt-2 text-xs text-[#b3261e]">{errors.followUp}</p>
        )}
      </div>

      {showAll && (
        <p className="flex items-start gap-2 rounded-lg bg-[#fdf6ec] p-3 text-xs text-[#8a6a1f]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          You&apos;re viewing all suppliers, not just those approved for this
          client&apos;s payer.
        </p>
      )}
    </div>
  );
}
