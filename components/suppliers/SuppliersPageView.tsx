"use client";

import { useEffect } from "react";
import type { SupplierRecord } from "@/lib/suppliers";
import { useQuerySelection } from "@/lib/useQuerySelection";
import { useRelatedRecords } from "@/components/related-records/RelatedRecordProvider";
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
  const { openSupplier, close, activeRecord } = useRelatedRecords();

  useEffect(() => {
    if (!selectedId) return;
    const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedId);
    openSupplier(selectedId, selectedSupplier);
  }, [openSupplier, selectedId, suppliers]);

  const activeId =
    activeRecord?.type === "supplier" ? activeRecord.id : null;

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Suppliers
      </h1>
      <SuppliersTable
        suppliers={suppliers}
        isConfigured={isConfigured}
        fetchError={fetchError}
        selectedId={activeId}
        onSelect={(id) => {
          setSelectedId(id);
          if (!id) {
            close();
            return;
          }
          const selectedSupplier = suppliers.find((supplier) => supplier.id === id);
          openSupplier(id, selectedSupplier);
        }}
      />
    </div>
  );
}
