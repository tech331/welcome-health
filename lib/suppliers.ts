export type SupplierRecord = {
  id: string;
  name: string;
  group: string;
  contactEmail: string;
  averageDeliveryTime: string;
  website: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  acceptedPayers: string[];
};

export const UNGROUPED_SUPPLIER_LABEL = "Other";

export function groupSuppliers(
  suppliers: SupplierRecord[],
): { group: string; suppliers: SupplierRecord[] }[] {
  const groups = new Map<string, SupplierRecord[]>();

  for (const supplier of suppliers) {
    const key =
      supplier.group && supplier.group !== "—"
        ? supplier.group
        : UNGROUPED_SUPPLIER_LABEL;
    const existing = groups.get(key);
    if (existing) {
      existing.push(supplier);
    } else {
      groups.set(key, [supplier]);
    }
  }

  return Array.from(groups.entries())
    .map(([group, items]) => ({ group, suppliers: items }))
    .sort((a, b) => {
      if (a.group === UNGROUPED_SUPPLIER_LABEL) return 1;
      if (b.group === UNGROUPED_SUPPLIER_LABEL) return -1;
      return a.group.localeCompare(b.group);
    });
}
