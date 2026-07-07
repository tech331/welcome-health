import type { PayerRecord } from "@/lib/payers";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";
import { PayerTile } from "./PayerTile";

type PayersListProps = {
  payers: PayerRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

export function PayersList({
  payers,
  isConfigured,
  fetchError,
}: PayersListProps) {
  if (payers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-[#2A2A2A]/60 shadow-sm">
        {getTableEmptyMessage("payers", isConfigured, fetchError)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payers.map((payer) => (
        <PayerTile key={payer.id} payer={payer} />
      ))}
    </div>
  );
}
