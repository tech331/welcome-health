"use client";

import { useState } from "react";
import { ArrowRight, FilePenLine } from "lucide-react";
import { NewRequestModal } from "@/components/requests/new-request/NewRequestModal";

export function CreateRequestTile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full flex-col gap-5 self-start overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#22b473] to-[#1c7a54] p-5 text-left shadow-[0_2px_8px_rgba(28,122,84,0.25)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(28,122,84,0.32)] focus-visible:ring-2 focus-visible:ring-[#1c7a54] focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.985]"
      >
        <span
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl"
          aria-hidden="true"
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
          <FilePenLine className="h-6 w-6" strokeWidth={2} />
        </span>
        <span className="relative">
          <span className="flex items-center gap-1.5 text-lg font-semibold text-white">
            Create a Request
            <ArrowRight
              className="h-5 w-5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
              strokeWidth={2.25}
            />
          </span>
          <span className="mt-1 block text-sm text-white/80">
            Start a new quote request for a client.
          </span>
        </span>
      </button>
      {open && <NewRequestModal onClose={() => setOpen(false)} />}
    </>
  );
}
