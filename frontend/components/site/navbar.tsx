"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "홈" },
  { href: "/polls", label: "투표 목록" },
  { href: "/create", label: "투표 만들기" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/fastvote.png" alt="FastVote" fill sizes="36px" className="object-cover" />
          </span>
          <span className="text-lg font-bold text-zinc-900">Fast Vote</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900",
                pathname === link.href && "text-emerald-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="hidden md:inline-flex">
            <Link href="/polls">참여하기</Link>
          </Button>
          <Button asChild>
            <Link href="/create">투표 생성</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
