import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/payers";

type PersonSummaryTileProps = {
  href: string;
  name: string;
  subtitle: string;
  label?: string;
};

export function PersonSummaryTile({
  href,
  name,
  subtitle,
  label,
}: PersonSummaryTileProps) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);

  return (
    <Link
      href={href}
      className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#2d6a4f]/[0.06]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-white"
        style={{ backgroundColor: color.bg, color: color.text }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        {label ? (
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#595959]">
            {label}
          </span>
        ) : null}
        <span className="block truncate text-sm font-medium text-[#2A2A2A]">
          {name}
        </span>
        <span className="block truncate text-xs text-[#595959]">
          {subtitle}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-[#595959] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2d6a4f]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </Link>
  );
}
