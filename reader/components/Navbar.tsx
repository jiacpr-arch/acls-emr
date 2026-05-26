"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "เนื้อหา ACLS" },
  { href: "/qa-deep", label: "Q&A เชิงลึก" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand">
          <HeartPulse className="h-5 w-5" />
          <span>ACLS Reader</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
