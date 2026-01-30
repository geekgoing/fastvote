"use client";

import Link from "next/link";
import { BarChart2, Clock } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PollsPage() {
  const { messages } = useLocale();
  const t = messages.polls;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-3">
          <Badge className="w-fit">{t.badge}</Badge>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-300">{t.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {t.mockPolls.map((poll) => (
            <Card key={poll.uuid} className="group">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t.mockBadge}</Badge>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {t.optionsCount(poll.options.length)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{poll.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {poll.options.slice(0, 3).map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                    >
                      {option}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <BarChart2 size={14} /> {t.participants(poll.totalVotes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {poll.createdAt}
                  </span>
                </div>
                <Button asChild variant="secondary" className="mt-2 w-full">
                  <Link href={`/vote/${poll.uuid}`}>{t.viewPoll}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
