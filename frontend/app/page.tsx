"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    title: "완전 익명",
    desc: "개인정보 없이 자유롭게 의견을 표현하세요.",
    icon: ShieldCheck,
  },
  {
    title: "실시간 결과",
    desc: "투표 현황이 즉시 반영되어 확인 가능합니다.",
    icon: Zap,
  },
  {
    title: "간편한 공유",
    desc: "링크 하나로 어디서든 쉽게 공유할 수 있어요.",
    icon: CheckCircle2,
  },
];

const steps = [
  {
    title: "투표 만들기",
    desc: "제목과 선택지를 입력하면 즉시 공유 가능한 링크가 생성됩니다.",
  },
  {
    title: "링크 공유",
    desc: "카톡, 슬랙, 이메일 어디든 URL만 전달하면 누구나 참여할 수 있어요.",
  },
  {
    title: "실시간 확인",
    desc: "투표와 동시에 결과가 반영되어 현재 흐름을 바로 파악할 수 있습니다.",
  },
];

const useCases = [
  {
    title: "팀 의사결정",
    desc: "회의 전 의견을 빠르게 모아 결정 시간을 줄입니다.",
  },
  {
    title: "이벤트 & 모임",
    desc: "메뉴, 날짜, 장소 투표로 참석자 합의를 쉽게 만드세요.",
  },
  {
    title: "교육 & 워크숍",
    desc: "즉석 질문과 만족도 체크로 몰입도를 높입니다.",
  },
  {
    title: "제품 피드백",
    desc: "기능 우선순위를 투표로 정리해 다음 스텝을 명확히 합니다.",
  },
];

const faqs = [
  {
    question: "로그인 없이도 안전하게 사용할 수 있나요?",
    answer:
      "개인정보를 수집하지 않고 링크 기반으로 동작하며, 비밀방과 비밀번호 옵션으로 접근을 제한할 수 있습니다.",
  },
  {
    question: "투표 결과는 언제 업데이트되나요?",
    answer:
      "WebSocket 기반으로 참여 즉시 결과가 반영되어 새로고침 없이 확인 가능합니다.",
  },
  {
    question: "중복 투표를 어떻게 방지하나요?",
    answer:
      "브라우저 식별 정보와 토큰을 조합해 동일 사용자 중복 투표를 최소화합니다.",
  },
  {
    question: "투표방은 언제까지 유지되나요?",
    answer:
      "설정된 시간 이후 자동 만료되며, 만료 전까지 결과를 실시간으로 확인할 수 있습니다.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6">
          <Badge className="mb-6">로그인 없이 3초 만에 시작</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            빠르고 간편한
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              실시간 익명 투표
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-600">
            Fast Vote는 복잡한 절차 없이 누구나 즉시 투표를 만들고 공유할 수 있는 플랫폼입니다.
            의견을 모으고 결정을 내리는 가장 빠른 방법을 경험해보세요.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/create">
                투표 만들기 <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/polls">참여하기</Link>
            </Button>
          </div>

          <Separator className="my-12 max-w-4xl" />

          <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((item) => (
              <Card key={item.title} className="p-6 text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 shadow-sm">
                  <item.icon className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">How it works</Badge>
            <h2 className="text-3xl font-bold text-zinc-900">3단계로 끝나는 빠른 투표</h2>
            <p className="text-sm text-zinc-500">
              복잡한 설정 없이 바로 시작하고, 공유하고, 결과를 확인하세요.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm text-zinc-500">{step.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">Use cases</Badge>
            <h2 className="text-3xl font-bold text-zinc-900">모든 팀과 커뮤니티에 어울리는 활용</h2>
            <p className="text-sm text-zinc-500">
              빠른 의사결정부터 피드백 수집까지, 다양한 상황에 적용할 수 있습니다.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="p-6">
                <h3 className="text-lg font-bold text-zinc-900">{useCase.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{useCase.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">FAQ</Badge>
            <h2 className="text-3xl font-bold text-zinc-900">자주 묻는 질문</h2>
            <p className="text-sm text-zinc-500">
              도입 전에 자주 궁금해하는 내용을 모았습니다.
            </p>
          </div>
          <div className="mt-10 grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-emerald-100 bg-emerald-50 p-6">
                <h3 className="text-base font-semibold text-zinc-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <Card className="bg-emerald-500 p-8 text-white shadow-lg shadow-emerald-500/30">
            <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-3xl font-bold">지금 바로 투표를 시작해 보세요</h2>
                <p className="mt-2 text-sm text-emerald-50">
                  링크 하나로 빠르게 의견을 모으고, 실시간으로 결과를 확인할 수 있습니다.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                  <Link href="/create">투표 만들기</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="border-white/20 bg-emerald-600 text-white hover:bg-emerald-700">
                  <Link href="/polls">참여하기</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl animate-blob" />
          <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl animate-blob animation-delay-4000" />
        </div>
      </main>
    </div>
  );
}
