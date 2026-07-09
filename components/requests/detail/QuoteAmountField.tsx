"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { formatCurrency, parseCurrencyInput } from "@/lib/format";

type QuoteAmountFieldProps = {
  quoteId: string;
  price: number | null;
  isManuallyEntered: boolean;
  onUpdated?: (price: number) => void;
};

export function QuoteAmountField({
  quoteId,
  price,
  isManuallyEntered,
  onUpdated,
}: QuoteAmountFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    price != null ? price.toFixed(2) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!editing) {
      setDraft(price != null ? price.toFixed(2) : "");
    }
  }, [price, editing]);

  function save() {
    const parsed = parseCurrencyInput(draft);
    if (parsed == null) {
      setError("Enter a valid amount.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: parsed }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error || "Failed to update amount");
        }
        onUpdated?.(parsed);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#2A2A2A]">
          {formatCurrency(price)}
        </span>
        {isManuallyEntered && (
          <span className="rounded-full bg-[#ede8e3] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#2A2A2A]/60">
            Manual
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded p-1 text-[#2A2A2A]/40 transition-colors hover:bg-black/[0.04] hover:text-[#2d6a4f]"
          aria-label="Edit quote amount"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-[#2A2A2A]/50">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") save();
            if (event.key === "Escape") {
              setEditing(false);
              setError(null);
            }
          }}
          className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm text-[#2A2A2A] outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f]"
          disabled={isPending}
          autoFocus
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded p-1 text-[#2d6a4f] transition-colors hover:bg-[#e8f0eb] disabled:opacity-50"
          aria-label="Save amount"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          disabled={isPending}
          className="rounded p-1 text-[#2A2A2A]/40 transition-colors hover:bg-black/[0.04]"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
      {error && <p className="text-xs text-[#b3261e]">{error}</p>}
    </div>
  );
}
