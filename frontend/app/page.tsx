"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { messages } = useLocale();
  const t = messages.home;
  const featureIcons = [ShieldCheck, Zap, CheckCircle2];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6">
          <Badge className="mb-6">{t.badge}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
            {t.heroTitleLine1}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            {t.heroDescription}
          </p>

            <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/create" className="flex items-center gap-2">
                {t.primaryCta} <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/polls">{t.secondaryCta}</Link>
            </Button>
          </div>

          <Separator className="my-12 max-w-4xl" />

          <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {t.features.map((item, index) => {
              const Icon = featureIcons[index];
              return (
              <Card key={item.title} className="p-6 text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 shadow-sm dark:bg-emerald-500/10">
                  <Icon className="text-emerald-600 dark:text-emerald-300" size={22} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">{item.description}</p>
              </Card>
            )})}
          </div>
        </div>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">{t.howItWorksBadge}</Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.howItWorksTitle}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-300">{t.howItWorksDescription}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {t.steps.map((step, index) => (
              <Card key={step.title} className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-300">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">{t.useCasesBadge}</Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.useCasesTitle}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-300">{t.useCasesDescription}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {t.useCases.map((useCase) => (
              <Card key={useCase.title} className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{useCase.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 text-center">
            <Badge className="mx-auto w-fit">{t.faqBadge}</Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.faqTitle}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-300">{t.faqDescription}</p>
          </div>
          <div className="mt-10 grid gap-4">
            {t.faqs.map((faq) => (
              <Card key={faq.question} className="p-6">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{faq.question}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <Card className="bg-emerald-500 p-8 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-600">
            <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-3xl font-bold">{t.ctaTitle}</h2>
                <p className="mt-2 text-sm text-emerald-50">{t.ctaDescription}</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-white/90 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700">
                  <Link href="/create" className="flex items-center justify-center">{t.ctaPrimary}</Link>
                </Button>
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-white/90 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700">
                  <Link href="/polls">{t.ctaSecondary}</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl animate-blob dark:bg-emerald-500/15" />
          <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl animate-blob animation-delay-2000 dark:bg-emerald-500/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl animate-blob animation-delay-4000 dark:bg-emerald-500/10" />
        </div>
      </main>
    </div>
  );
}
