"use client";

import Link from "next/link";
import { BarChart2, Clock } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const mockPolls = [
  {
    uuid: "demo-01",
    title: "점심 메뉴는 무엇이 좋을까요?",
    totalVotes: 24,
    createdAt: "2025-01-12",
    options: ["샐러드", "덮밥", "파스타"],
  },
  {
    uuid: "demo-02",
    title: "다음 회의 시간 투표",
    totalVotes: 18,
    createdAt: "2025-01-20",
    options: ["오전 10시", "오후 2시", "오후 4시", "오후 5시"],
  },
  {
    uuid: "demo-03",
    title: "팀 워크숍 장소 선택",
    totalVotes: 42,
    createdAt: "2025-01-29",
    options: ["강릉", "양양", "제주"],
  },
];

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-3">
          <Badge className="w-fit">Live Polls</Badge>
          <h1 className="text-3xl font-bold text-zinc-900">진행 중인 투표</h1>
          <p className="text-zinc-500">
            현재 참여 가능한 투표 목록을 확인하고 빠르게 참여해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockPolls.map((poll) => (
            <Card key={poll.uuid} className="group">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Mock</Badge>
                  <span className="text-xs text-zinc-400">{poll.options.length} options</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{poll.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {poll.options.slice(0, 3).map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs text-zinc-600"
                    >
                      {option}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <BarChart2 size={14} /> {poll.totalVotes}명 참여
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {poll.createdAt}
                  </span>
                </div>
                <Button asChild variant="secondary" className="mt-2 w-full">
                  <Link href={`/vote/${poll.uuid}`}>투표 보기</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
