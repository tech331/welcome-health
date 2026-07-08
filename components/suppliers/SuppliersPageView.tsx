"use client";

import type { SupplierRecord } from "@/lib/suppliers";
import { useQuerySelection } from "@/lib/useQuerySelection";
import { SupplierSideSheet } from "./SupplierSideSheet";
import { SuppliersTable } from "./SuppliersTable";

type SuppliersPageViewProps = {
  suppliers: SupplierRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

export function SuppliersPageView({
  suppliers,
  isConfigured,
  fetchError,
}: SuppliersPageViewProps) {
  const [selectedId, setSelectedId] = useQuerySelection();

  const selected =
    suppliers.find((supplier) => supplier.id === selectedId) ?? null;

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-8 pb-8 pt-8">
        <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
          Suppliers
        </h1>
        <SuppliersTable
          suppliers={suppliers}
          isConfigured={isConfigured}
          fetchError={fetchError}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <SupplierSideSheet
        supplier={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
