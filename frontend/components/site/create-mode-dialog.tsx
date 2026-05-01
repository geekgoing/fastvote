"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, UsersRound, X } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateModeDialogProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showArrow?: boolean;
};

export function CreateModeDialog({
  children,
  className,
  variant,
  size,
  showArrow = false,
}: CreateModeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
        {showArrow && <ArrowRight size={18} />}
      </Button>

      {open && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-300">
                  FastVote
                </p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  투표 생성 방식 선택
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">
                  만들고 싶은 투표 유형을 선택해 주세요.
                </p>
              </div>
              <button
                aria-label="닫기"
                className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className={cn(
                  "group rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50",
                  "dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/10"
                )}
                type="button"
                onClick={() => goTo("/create")}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                  <ClipboardList size={20} />
                </span>
                <span className="mt-4 block text-base font-bold text-zinc-900 dark:text-zinc-100">
                  기본 투표 생성
                </span>
                <span className="mt-1 block text-sm leading-6 text-zinc-500 dark:text-zinc-300">
                  기존처럼 질문과 선택지만 입력해 빠르게 투표를 만듭니다.
                </span>
              </button>

              <button
                className={cn(
                  "group rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-100",
                  "dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/20"
                )}
                type="button"
                onClick={() => goTo("/create/restricted")}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                  <UsersRound size={20} />
                </span>
                <span className="mt-4 block text-base font-bold text-zinc-900 dark:text-zinc-100">
                  특정인원 투표 생성
                </span>
                <span className="mt-1 block text-sm leading-6 text-zinc-500 dark:text-zinc-300">
                  참여자를 등록하고 선택지별로 투표 가능한 사람을 조정합니다.
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
