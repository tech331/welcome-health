import { getPayers, isAirtableConfigured } from "@/lib/airtable";
import type { PayerRecord } from "@/lib/payers";
import { PayersList } from "@/components/payers/PayersList";

export const revalidate = 30;

export default async function PayersPage() {
  let payers: PayerRecord[] = [];
  let fetchError: string | null = null;

  try {
    payers = await getPayers();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch payers";
    console.error("Failed to fetch Airtable payers:", error);
    fetchError = message;
  }

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Payers
      </h1>
      <PayersList
        payers={payers}
        isConfigured={isAirtableConfigured()}
        fetchError={fetchError}
      />
    </div>
  );
}
