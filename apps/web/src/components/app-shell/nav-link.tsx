"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function NavLink({
  href,
  match,
  children,
}: {
  href: Route;
  match: { path: string; brand: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const brand = useSearchParams().get("brand");
  const active = pathname === match.path && brand === match.brand;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-field px-2 py-1.5 transition-colors ${
        active ? "bg-base-100 font-semibold shadow-sm" : "hover:bg-base-100/60"
      }`}
    >
      {children}
    </Link>
  );
}
