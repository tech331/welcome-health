import { Plus } from "lucide-react";

export function NewRequestButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245a42]"
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      New Request
    </button>
  );
}
