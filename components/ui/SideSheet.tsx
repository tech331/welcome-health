"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PANEL_TRANSITION_MS = 300;

type SideSheetProps<T> = {
  record: T | null;
  onClose: () => void;
  title: (record: T) => string;
  width?: "w-80" | "w-96";
  children: (record: T) => React.ReactNode;
};

export function SideSheet<T>({
  record,
  onClose,
  title,
  width = "w-96",
  children,
}: SideSheetProps<T>) {
  const isOpen = record !== null;
  const [displayRecord, setDisplayRecord] = useState<T | null>(null);

  useEffect(() => {
    if (record) {
      setDisplayRecord(record);
      return;
    }

    const timer = setTimeout(() => setDisplayRecord(null), PANEL_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [record]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <aside
      aria-hidden={!isOpen}
      className={`flex h-full shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.08)] transition-[width] duration-300 ease-in-out ${
        isOpen ? width : "w-0 border-l-0 shadow-none"
      }`}
    >
      {displayRecord && (
        <div className={`flex h-full flex-col ${width}`}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
            <h2 className="truncate text-base font-semibold text-[#2A2A2A]">
              {title(displayRecord)}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-black/[0.04] hover:text-[#2A2A2A]"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {children(displayRecord)}
          </div>
        </div>
      )}
    </aside>
  );
}
