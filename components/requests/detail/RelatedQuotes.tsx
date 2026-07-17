"use client";

import { useEffect, useState } from "react";
import { RelatedRecordLink } from "@/components/related-records/RelatedRecordLink";
import { Plus, ReceiptText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  RequestAttachment,
  RequestItemDetail,
  RequestQuoteDetail,
  RequestSupplierSummary,
} from "@/lib/requestDetail";
import { AddQuoteModal } from "./AddQuoteModal";
import { QuoteAmountField } from "./QuoteAmountField";
import { QuotePdfAttach } from "./QuotePdfAttach";

type RelatedQuotesProps = {
  requestId: string;
  quotes: RequestQuoteDetail[];
  suppliers: RequestSupplierSummary[];
  items: RequestItemDetail[];
};

function quoteRankColor(index: number, hasPrice: boolean): string {
  if (!hasPrice) return "bg-[#f3f0eb]/60";
  if (index === 0) return "bg-[#e8f0eb]/70 ring-1 ring-[#2d6a4f]/20";
  if (index === 1) return "bg-[#f0f5f1]/80";
  if (index === 2) return "bg-[#f3f0eb]/50";
  return "bg-[#f3f0eb]/40";
}

function sortQuotes(quotes: RequestQuoteDetail[]): RequestQuoteDetail[] {
  return [...quotes].sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });
}

export function RelatedQuotes({
  requestId,
  quotes,
  suppliers,
  items,
}: RelatedQuotesProps) {
  const [localQuotes, setLocalQuotes] = useState(() => sortQuotes(quotes));
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLocalQuotes(sortQuotes(quotes));
  }, [quotes]);

  function updateQuote(
    quoteId: string,
    patch: Partial<RequestQuoteDetail>,
  ) {
    setLocalQuotes((prev) =>
      sortQuotes(
        prev.map((quote) =>
          quote.id === quoteId ? { ...quote, ...patch } : quote,
        ),
      ),
    );
  }

  function handleCreated(quote: RequestQuoteDetail) {
    setLocalQuotes((prev) => sortQuotes([quote, ...prev]));
  }

  const canAdd = suppliers.length > 0 && items.length > 0;

  const addButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      disabled={!canAdd}
      title={
        !canAdd
          ? "Add suppliers and items to this request first"
          : "Add a quote"
      }
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#2d6a4f] transition-colors hover:bg-[#2d6a4f]/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      Add quote
    </button>
  );

  if (localQuotes.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!canAdd}
          title={
            !canAdd
              ? "Add suppliers and items to this request first"
              : "Add a quote"
          }
          className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e4ded6] bg-[#faf8f5]/60 px-4 py-10 text-center transition-colors hover:border-[#2d6a4f]/40 hover:bg-[#e8f0eb]/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[#e4ded6] disabled:hover:bg-[#faf8f5]/60"
        >
          <ReceiptText
            className="h-10 w-10 text-[#d8d2cb]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-[#2d6a4f]">Add a quote</p>
            <p className="mt-1 text-xs text-[#606060]">
              Record supplier, date received, and item prices
            </p>
          </div>
        </button>
        {modalOpen && (
          <AddQuoteModal
            requestId={requestId}
            suppliers={suppliers}
            items={items}
            onClose={() => setModalOpen(false)}
            onCreated={handleCreated}
          />
        )}
      </>
    );
  }

  const cheapestId =
    localQuotes.find((quote) => quote.price != null)?.id ?? null;

  return (
    <>
      <div className="mb-3 flex justify-end">{addButton}</div>
      <ul className="space-y-3">
        {localQuotes.map((quote, index) => {
          const isCheapest = quote.id === cheapestId && quote.price != null;
          return (
            <li
              key={quote.id}
              className={`rounded-2xl px-4 py-3 ${quoteRankColor(
                index,
                quote.price != null,
              )}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      Quote #{quote.quoteId !== "—" ? quote.quoteId : "—"}
                    </span>
                    {isCheapest && (
                      <span className="rounded-full bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#2A2A2A]/70">
                    {quote.supplier ? (
                      <RelatedRecordLink
                        type="supplier"
                        id={quote.supplier.id}
                        className="text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
                      >
                        {quote.supplier.name}
                      </RelatedRecordLink>
                    ) : (
                      <span className="text-[#2A2A2A]/40">No supplier</span>
                    )}
                  </div>
                  {quote.dateReceived && (
                    <div className="text-xs text-[#606060]">
                      Received {formatDate(quote.dateReceived)}
                    </div>
                  )}
                </div>

                <QuoteAmountField
                  quoteId={quote.id}
                  price={quote.price}
                  isManuallyEntered={quote.isManuallyEntered}
                  onUpdated={(price) =>
                    updateQuote(quote.id, {
                      price,
                      isManuallyEntered: true,
                    })
                  }
                />
              </div>

              {quote.lineItems.length > 0 && (
                <div className="mt-3 border-t border-black/[0.05] pt-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-[#606060]">
                    Line items
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {quote.lineItems.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate text-[#2A2A2A]/80">
                          {line.name}
                          {line.quantity != null && line.quantity !== 1 && (
                            <span className="text-[#606060]">
                              {" "}
                              ×{line.quantity}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-medium text-[#1a1a1a]">
                          {formatCurrency(line.lineTotal ?? line.unitPrice)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 border-t border-black/[0.05] pt-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-[#606060]">
                  PDF
                </div>
                <div className="mt-1.5">
                  <QuotePdfAttach
                    quoteId={quote.id}
                    attachments={quote.attachments}
                    onAttached={(attachments: RequestAttachment[]) =>
                      updateQuote(quote.id, { attachments })
                    }
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {modalOpen && (
        <AddQuoteModal
          requestId={requestId}
          suppliers={suppliers}
          items={items}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
