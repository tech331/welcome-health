"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { RequestTab } from "@/lib/requests";

const tabs: { id: RequestTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "overdue", label: "Overdue" },
];

type RequestTabsProps = {
  counts: Record<RequestTab, number>;
};

export function RequestTabs({ counts }: RequestTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as RequestTab) || "all";

  function setTab(tab: RequestTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(query ? `/requests?${query}` : "/requests");
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8">
        {tabs.map(({ id, label }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#2d6a4f] text-[#2d6a4f]"
                  : "border-transparent text-[#2A2A2A] hover:text-[#2d6a4f]"
              }`}
            >
              {label}
              <span
                className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? "bg-[#e8f0eb] text-[#2d6a4f]"
                    : "bg-[#ede8e3] text-[#2A2A2A]"
                }`}
              >
                {counts[id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
