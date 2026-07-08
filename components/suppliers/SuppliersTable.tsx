"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { groupSuppliers, type SupplierRecord } from "@/lib/suppliers";
import { getAvatarColor } from "@/lib/payers";
import { getTableEmptyMessage } from "@/lib/tableEmptyMessage";

type SuppliersTableProps = {
  suppliers: SupplierRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function SuppliersTable({
  suppliers,
  isConfigured,
  fetchError,
  selectedId,
  onSelect,
}: SuppliersTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  function toggleGroup(group: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  const groups = groupSuppliers(suppliers);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#faf8f5]">
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">
              Supplier Name
            </th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">
              Contact Email
            </th>
            <th className="px-4 py-3 font-medium text-[#2A2A2A]">
              Average Delivery Time
            </th>
            <th className="w-12 px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-[#2A2A2A]/60"
              >
                {getTableEmptyMessage("suppliers", isConfigured, fetchError)}
              </td>
            </tr>
          ) : (
            groups.map(({ group, suppliers: groupSuppliersList }) => {
              const isCollapsed = collapsedGroups.has(group);
              const color = getAvatarColor(group);

              return (
                <Fragment key={`group-${group}`}>
                  <tr
                    onClick={() => toggleGroup(group)}
                    className="cursor-pointer border-b border-gray-200 bg-[#faf8f5] transition-colors hover:bg-[#f2efe9]"
                  >
                    <td colSpan={4} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight
                            className="h-4 w-4 text-gray-400"
                            strokeWidth={2}
                          />
                        ) : (
                          <ChevronDown
                            className="h-4 w-4 text-gray-400"
                            strokeWidth={2}
                          />
                        )}
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: color.text }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-[#2A2A2A]">
                          {group}
                        </span>
                        <span className="text-xs text-[#2A2A2A]/50">
                          {groupSuppliersList.length}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {!isCollapsed &&
                    groupSuppliersList.map((supplier) => {
                      const isSelected = selectedId === supplier.id;

                      return (
                        <tr
                          key={supplier.id}
                          onClick={() =>
                            onSelect(isSelected ? null : supplier.id)
                          }
                          className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-black/[0.02] ${
                            isSelected ? "bg-[#e8f0eb]/60" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-[#2A2A2A]">
                            <span className="pl-6">{supplier.name}</span>
                          </td>
                          <td className="px-4 py-3 text-[#2A2A2A]">
                            {supplier.contactEmail}
                          </td>
                          <td className="px-4 py-3 text-[#2A2A2A]">
                            {supplier.averageDeliveryTime}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                                isSelected ? "text-[#2d6a4f]" : "text-gray-400"
                              }`}
                              aria-hidden="true"
                            >
                              <ChevronRight
                                className="h-4 w-4"
                                strokeWidth={1.75}
                              />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
