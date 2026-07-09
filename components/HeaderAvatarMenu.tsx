"use client";

import { useEffect, useRef, useState } from "react";
import { CircleUser, Settings, User } from "lucide-react";

export function HeaderAvatarMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <CircleUser className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#2A2A2A] transition-colors hover:bg-black/[0.04]"
          >
            <User className="h-4 w-4 shrink-0 text-gray-500" strokeWidth={1.75} />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#2A2A2A] transition-colors hover:bg-black/[0.04]"
          >
            <Settings
              className="h-4 w-4 shrink-0 text-gray-500"
              strokeWidth={1.75}
            />
            Settings
          </button>
        </div>
      )}
    </div>
  );
}
