"use client";

import { useEffect, useState } from "react";
import { RelatedRecordLink } from "@/components/related-records/RelatedRecordLink";
import { ReceiptText } from "lucide-react";
import type {
  RequestAttachment,
  RequestQuoteDetail,
} from "@/lib/requestDetail";
import { QuoteAmountField } from "./QuoteAmountField";
import { QuotePdfAttach } from "./QuotePdfAttach";

type RelatedQuotesProps = {
  quotes: RequestQuoteDetail[];
};

function quoteRankColor(index: number, hasPrice: boolean): string {
  if (!hasPrice) return "bg-[#f3f0eb]/60";
  if (index === 0) return "bg-[#e8f0eb]/70 ring-1 ring-[#2d6a4f]/20";
  if (index === 1) return "bg-[#f0f5f1]/80";
  if (index === 2) return "bg-[#f3f0eb]/50";
  return "bg-[#f3f0eb]/40";
}

export function RelatedQuotes({ quotes }: RelatedQuotesProps) {
  const [localQuotes, setLocalQuotes] = useState(quotes);

  useEffect(() => {
    setLocalQuotes(quotes);
  }, [quotes]);

  function updateQuote(
    quoteId: string,
    patch: Partial<RequestQuoteDetail>,
  ) {
    setLocalQuotes((prev) => {
      const next = prev.map((quote) =>
        quote.id === quoteId ? { ...quote, ...patch } : quote,
      );
      return [...next].sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return a.price - b.price;
      });
    });
  }

  if (localQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e4ded6] bg-[#faf8f5]/60 px-4 py-10 text-center">
        <ReceiptText
          className="h-10 w-10 text-[#d8d2cb]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-sm text-[#606060]">No quotes received yet</p>
      </div>
    );
  }

  const cheapestId =
    localQuotes.find((quote) => quote.price != null)?.id ?? null;

  return (
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
  );
}
