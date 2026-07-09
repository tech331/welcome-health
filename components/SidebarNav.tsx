"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bed,
  Building2,
  FilePenLine,
  Home,
  User,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/requests", label: "Requests", icon: FilePenLine },
  { href: "/clients", label: "Clients", icon: User },
  { href: "/payers", label: "Payers", icon: Building2 },
  { href: "/case-managers", label: "Case Managers", icon: Users },
  { href: "/suppliers", label: "Suppliers", icon: Bed },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 px-3 py-4">
      {navItems.map((item) => {
        const { href, label, icon: Icon } = item;
        const exact = "exact" in item && item.exact;
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "nav-item-active" : "text-[#2A2A2A] hover:bg-black/[0.04]"
            }`}
          >
            <Icon
              className="nav-link-icon h-[18px] w-[18px] shrink-0"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
