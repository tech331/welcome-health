"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function HomeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#2d6a4f]/15 bg-[#eaf4ee] px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2d6a4f]/10">
        <Sparkles className="h-4 w-4 text-[#2d6a4f]" strokeWidth={2} />
      </span>
      <p className="flex-1 text-sm text-[#2A2A2A]">
        Have a play around with the latest features on our Dashboard.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#2d6a4f]/70 transition-colors hover:bg-[#2d6a4f]/10 hover:text-[#2d6a4f]"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
