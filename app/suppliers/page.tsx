import { getSuppliers, isAirtableConfigured } from "@/lib/airtable";
import type { SupplierRecord } from "@/lib/suppliers";
import { SuppliersPageView } from "@/components/suppliers/SuppliersPageView";

export default async function SuppliersPage() {
  let suppliers: SupplierRecord[] = [];
  let fetchError: string | null = null;

  try {
    suppliers = await getSuppliers();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch suppliers";
    console.error("Failed to fetch Airtable suppliers:", error);
    fetchError = message;
  }

  return (
    <SuppliersPageView
      suppliers={suppliers}
      isConfigured={isAirtableConfigured()}
      fetchError={fetchError}
    />
  );
}
