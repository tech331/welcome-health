import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getRequestById, isAirtableConfigured } from "@/lib/airtable";
import type { RequestRecord } from "@/lib/requests";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;

  let request: RequestRecord | null = null;
  let fetchError: string | null = null;

  if (isAirtableConfigured()) {
    try {
      request = await getRequestById(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch request";
      console.error("Failed to fetch Airtable request:", error);
      fetchError = message;
    }
  }

  const headerLabel = request ? request.requestId : "Request";

  return (
    <div className="h-full w-full overflow-y-auto px-8 pb-8 pt-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-[#2A2A2A]/60">
        <Link
          href="/requests"
          className="transition-colors hover:text-[#2d6a4f]"
        >
          Requests
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-[#2A2A2A]">{headerLabel}</span>
      </nav>

      <h1 className="font-sans text-2xl font-semibold text-[#2A2A2A]">
        {headerLabel}
      </h1>

      {!request && (
        <p className="mt-4 text-sm text-[#2A2A2A]/60">
          {fetchError
            ? "Could not load this request from Airtable."
            : "Request not found."}
        </p>
      )}
    </div>
  );
}
