"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/providers/locale-provider";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, messages } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-white/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/fastvote.png" alt="FastVote" fill sizes="36px" className="object-cover" />
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {messages.navbar.brand}
          </span>
        </Link>

        {/* Primary navbar links removed per user request. CTAs, locale and theme toggles remain. */}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-1 py-1 shadow-sm shadow-zinc-200/50 dark:border-white/10 dark:bg-slate-900">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-full px-3 text-xs",
                locale === "ko" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
              )}
              onClick={() => setLocale("ko")}
              aria-pressed={locale === "ko"}
              data-testid="locale-ko"
            >
              KO
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-full px-3 text-xs",
                locale === "en" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
              )}
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              data-testid="locale-en"
            >
              EN
            </Button>
          </div>

          <ThemeToggle />

          <Button asChild variant="secondary" className="hidden md:inline-flex">
            <Link href="/polls">{messages.navbar.actions.join}</Link>
          </Button>
          <Button asChild>
            <Link href="/create">{messages.navbar.actions.create}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
