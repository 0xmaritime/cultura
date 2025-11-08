"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  if (!resolvedTheme) {
    return (
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]/80 bg-white/40 text-[var(--foreground)]/70 dark:bg-black/30 dark:text-white/70"
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]/80 bg-white/40 text-[var(--foreground)] transition hover:border-[var(--foreground)]/50 hover:bg-white/70 dark:bg-black/30 dark:text-white"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
