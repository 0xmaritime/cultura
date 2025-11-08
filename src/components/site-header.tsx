"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/lens", label: "Lens" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)]/60 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em]">
          Cultura
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 transition ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)]/70 text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
