import type { RequestItemDetail } from "@/lib/requestDetail";

type ItemsRequestedTableProps = {
  items: RequestItemDetail[];
};

export function ItemsRequestedTable({ items }: ItemsRequestedTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#606060]">
        No items on this request
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#eceae6] text-[11px] font-medium uppercase tracking-wide text-[#606060]">
            <th className="px-3 py-2.5 font-medium">Item</th>
            <th className="px-3 py-2.5 font-medium">Category</th>
            <th className="px-3 py-2.5 font-medium">Details</th>
            <th className="px-3 py-2.5 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="odd:bg-white even:bg-[#faf8f5]">
              <td className="px-3 py-3 align-top font-medium text-[#1a1a1a]">
                {item.name}
              </td>
              <td className="px-3 py-3 align-top text-[#1a1a1a]">
                {item.category || "—"}
              </td>
              <td className="px-3 py-3 align-top">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-xs truncate text-[#2d6a4f] underline-offset-2 hover:underline"
                  >
                    {item.url}
                  </a>
                ) : null}
                {item.notes ? (
                  <p
                    className={`text-xs text-[#606060] ${item.url ? "mt-1" : ""}`}
                  >
                    {item.notes}
                  </p>
                ) : null}
                {!item.url && !item.notes ? (
                  <span className="text-[#606060]">—</span>
                ) : null}
              </td>
              <td className="px-3 py-3 text-right align-top font-medium tabular-nums text-[#1a1a1a]">
                {item.quantity ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
