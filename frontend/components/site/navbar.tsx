"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, ClipboardList } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const { locale, setLocale, messages, mounted } = useLocale();

  const LOCALE_TESTID_EN = "locale-en";
  const LOCALE_TESTID_KO = "locale-ko";

  const toggleLang = () => {
    const newLocale = locale === "ko" ? "en" : "ko";
    setLocale(newLocale);
    router.refresh();
  };

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

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language & Theme Toggles */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <Tooltip content={messages.navbar.languageLabel}>
              <button
                type="button"
                onClick={toggleLang}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                data-testid={mounted ? (locale === "ko" ? LOCALE_TESTID_EN : LOCALE_TESTID_KO) : LOCALE_TESTID_EN}
              >
                <Globe size={16} />
                {mounted ? locale.toUpperCase() : "KO"}
              </button>
            </Tooltip>
          </div>

          <Tooltip content={messages.navbar.themeLabel}>
            <ThemeToggle />
          </Tooltip>

          <Tooltip content={messages.navbar.actions.myPolls}>
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/my-polls">
                <ClipboardList size={18} />
              </Link>
            </Button>
          </Tooltip>

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
