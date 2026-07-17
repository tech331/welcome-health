"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Paperclip, X } from "lucide-react";
import {
  FieldError,
  FieldLabel,
  TextField,
} from "@/components/requests/new-request/fields";
import { formatCurrency, parseCurrencyInput } from "@/lib/format";
import type {
  RequestItemDetail,
  RequestQuoteDetail,
  RequestSupplierSummary,
} from "@/lib/requestDetail";

type AddQuoteModalProps = {
  requestId: string;
  suppliers: RequestSupplierSummary[];
  items: RequestItemDetail[];
  onClose: () => void;
  onCreated: (quote: RequestQuoteDetail) => void;
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function AddQuoteModal({
  requestId,
  suppliers,
  items,
  onClose,
  onCreated,
}: AddQuoteModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [dateReceived, setDateReceived] = useState(todayIsoDate);
  const [unitPrices, setUnitPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, ""])),
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  const lineTotals = useMemo(() => {
    return items.map((item) => {
      const unitPrice = parseCurrencyInput(unitPrices[item.id] ?? "");
      const quantity = item.quantity ?? 1;
      const lineTotal =
        unitPrice != null ? unitPrice * (quantity || 1) : null;
      return { item, unitPrice, quantity, lineTotal };
    });
  }, [items, unitPrices]);

  const runningTotal = lineTotals.reduce(
    (sum, line) => sum + (line.lineTotal ?? 0),
    0,
  );

  const errors = {
    supplierId: !supplierId ? "Select a supplier" : undefined,
    dateReceived: !dateReceived ? "Enter the date received" : undefined,
    prices: lineTotals.some((line) => line.unitPrice == null)
      ? "Enter a price for each item"
      : undefined,
    items:
      items.length === 0
        ? "This request has no items to quote against"
        : undefined,
    suppliers:
      suppliers.length === 0
        ? "This request has no suppliers"
        : undefined,
  };

  const hasErrors = Boolean(
    errors.supplierId ||
      errors.dateReceived ||
      errors.prices ||
      errors.items ||
      errors.suppliers,
  );

  function handlePdfPick(file: File | undefined) {
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setPdfError("Please attach a PDF file.");
      setPdfFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError("PDF must be under 5 MB.");
      setPdfFile(null);
      return;
    }
    setPdfError(null);
    setPdfFile(file);
  }

  async function handleSubmit() {
    setAttempted(true);
    setSubmitError(null);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          supplierId,
          dateReceived,
          lines: lineTotals.map((line) => ({
            itemId: line.item.id,
            unitPrice: line.unitPrice!,
          })),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Failed to create quote");
      }

      let quote = (await response.json()) as RequestQuoteDetail;

      if (pdfFile) {
        try {
          const base64 = await fileToBase64(pdfFile);
          const attachResponse = await fetch(
            `/api/quotes/${quote.id}/attachments`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: pdfFile.name,
                contentType: pdfFile.type || "application/pdf",
                base64,
              }),
            },
          );
          if (attachResponse.ok) {
            const attached = (await attachResponse.json()) as {
              attachments?: RequestQuoteDetail["attachments"];
              quote?: RequestQuoteDetail;
            };
            quote = {
              ...quote,
              attachments: attached.attachments ?? attached.quote?.attachments ?? quote.attachments,
            };
          }
        } catch {
          // Quote was created; PDF attach failure shouldn't block closing.
        }
      }

      onCreated(quote);
      router.refresh();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create quote",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add quote"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!submitting) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2A2A2A]">Add a quote</h2>
          <button
            type="button"
            onClick={() => {
              if (!submitting) onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-black/[0.04] hover:text-[#2A2A2A]"
            aria-label="Close"
            disabled={submitting}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 @sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="quote-supplier" required>
                Supplier
              </FieldLabel>
              <select
                id="quote-supplier"
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                disabled={suppliers.length === 0 || submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#2A2A2A] outline-none transition-colors focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] disabled:cursor-not-allowed disabled:bg-[#f5f2ee]"
                aria-invalid={attempted && Boolean(errors.supplierId)}
              >
                {suppliers.length === 0 ? (
                  <option value="">No suppliers on request</option>
                ) : (
                  suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))
                )}
              </select>
              {attempted && (
                <FieldError
                  message={errors.suppliers || errors.supplierId}
                />
              )}
            </div>

            <TextField
              id="quote-date-received"
              label="Date received"
              type="date"
              value={dateReceived}
              onChange={setDateReceived}
              required
              error={attempted ? errors.dateReceived : undefined}
            />
          </div>

          <div className="mt-6">
            <FieldLabel required>Item prices</FieldLabel>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-[#606060]">
                Add items to this request before entering a quote.
              </p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-xl border border-[#eceae6]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf8f5] text-[11px] font-medium uppercase tracking-wide text-[#606060]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Unit price</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Line total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineTotals.map(({ item, quantity, lineTotal }) => (
                      <tr
                        key={item.id}
                        className="border-t border-[#f0eee9]"
                      >
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-[#1a1a1a]">
                            {item.name}
                          </div>
                          {item.category && item.category !== "—" && (
                            <div className="text-xs text-[#606060]">
                              {item.category}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[#2A2A2A]/70">
                          {quantity ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative max-w-[8.5rem]">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#606060]">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={unitPrices[item.id] ?? ""}
                              onChange={(event) =>
                                setUnitPrices((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value,
                                }))
                              }
                              disabled={submitting}
                              placeholder="0.00"
                              className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-6 pr-2 text-sm outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] disabled:bg-[#f5f2ee]"
                              aria-label={`Unit price for ${item.name}`}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#1a1a1a]">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#eceae6] bg-[#faf8f5]">
                      <td
                        colSpan={3}
                        className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#606060]"
                      >
                        Total
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold text-[#1a1a1a]">
                        {formatCurrency(runningTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {attempted && (
              <FieldError message={errors.items || errors.prices} />
            )}
          </div>

          <div className="mt-6">
            <FieldLabel optional>Quote PDF</FieldLabel>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-[#2A2A2A]/70 transition-colors hover:border-[#2d6a4f] hover:text-[#2d6a4f] disabled:opacity-50"
              >
                <Paperclip className="h-3.5 w-3.5" strokeWidth={1.75} />
                {pdfFile ? "Change PDF" : "Attach PDF"}
              </button>
              {pdfFile && (
                <span className="text-xs text-[#606060]">{pdfFile.name}</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) =>
                  handlePdfPick(event.target.files?.[0])
                }
              />
            </div>
            {pdfError && <p className="mt-1 text-xs text-[#b3261e]">{pdfError}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div>
            {submitError && (
              <span className="text-xs text-[#b3261e]">{submitError}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#2A2A2A]/70 transition-colors hover:bg-black/[0.04] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245a42] disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              )}
              Save quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
