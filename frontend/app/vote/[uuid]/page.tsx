"use client";

import { useEffect, useState, use } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Check, Copy, ShieldCheck } from "lucide-react";

import { api, APIError, type VoteRoom, type VoteResults } from "@/lib/api";
import { getFingerprint } from "@/lib/fingerprint";
import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

type ViewState = 'loading' | 'password' | 'voting' | 'voted' | 'error';

export default function VotePage({ params }: PageProps) {
  const { uuid } = use(params);
  const { messages } = useLocale();
  const t = messages.vote;

  const [state, setState] = useState<ViewState>('loading');
  const [room, setRoom] = useState<VoteRoom | null>(null);
  const [results, setResults] = useState<VoteResults | null>(null);
  const [error, setError] = useState<string>('');

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [voteError, setVoteError] = useState('');

  const [copySuccess, setCopySuccess] = useState(false);
  const [shouldConnectWs, setShouldConnectWs] = useState(false);

  // Initial room fetch
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await api.getRoom(uuid);
        setRoom(data);

        if (data.has_password) {
          setState('password');
        } else {
          // Load results
          try {
            const resultsData = await api.getResults(uuid);
            setResults(resultsData);
          } catch (err) {
            console.error('Failed to load results:', err);
          }
          setState('voting');
          setShouldConnectWs(true);
        }
      } catch (err) {
        if (err instanceof APIError && err.status === 404) {
          setError(t.errors.notFound);
        } else {
          setError(t.errors.loadFailed);
        }
        setState('error');
      }
    };

    loadRoom();
  }, [uuid]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!shouldConnectWs) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      ws = new WebSocket(api.getWebSocketUrl(uuid));

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: VoteResults = JSON.parse(event.data);
          setResults(data);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onerror = (err: Event) => {
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        // Attempt reconnect after 3 seconds if still in active state
        reconnectTimer = setTimeout(() => {
          if (shouldConnectWs) {
            connect();
          }
        }, 3000);
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [uuid, shouldConnectWs]);

  // Password verification
  const handlePasswordSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');

    try {
      await api.verifyPassword(uuid, password);
      // Load results
      try {
        const data = await api.getResults(uuid);
        setResults(data);
      } catch (err) {
        console.error('Failed to load results:', err);
      }
      setState('voting');
      setShouldConnectWs(true);
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        setPasswordError(t.passwordErrors.incorrect);
      } else {
        setPasswordError(t.passwordErrors.failed);
      }
    }
  };

  // Vote submission
  const handleVoteSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOption) return;

    setVoteError('');
    const fingerprint = getFingerprint();

    try {
      await api.vote(uuid, [selectedOption], fingerprint);
      setState('voted');
    } catch (err) {
      if (err instanceof APIError && err.status === 409) {
        setVoteError(t.voteErrors.alreadyVoted);
        setState('voted');
      } else {
        setVoteError(t.voteErrors.submitFailed);
      }
    }
  };

  // Copy current URL to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Calculate percentage for progress bars
  const totalVotes = results
    ? Object.values(results.results).reduce((sum, value) => sum + value, 0)
    : 0;

  const getPercentage = (option: string): number => {
    if (!results || totalVotes === 0) return 0;
    const votes = results.results[option] || 0;
    return (votes / totalVotes) * 100;
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.loading}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full p-8 text-center">
            <Badge variant="secondary" className="mb-3">
              {t.errorBadge}
            </Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{error}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-300 mb-6">{t.errorDescription}</p>
            <Button asChild variant="secondary">
              <Link href="/">{t.backHome}</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Password entry state
  if (state === "password" && room) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full">
            <CardHeader>
              <Badge className="w-fit">{t.protectedBadge}</Badge>
              <CardTitle className="mt-3 text-2xl text-zinc-900 dark:text-zinc-100">
                {room.title}
              </CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-300">{t.protectedDescription}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {t.passwordLabel}
                  </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      autoFocus
                    />
                  {passwordError && (
                    <div className="text-sm text-red-600 dark:text-red-300">{passwordError}</div>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {t.passwordSubmit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Voting/Results state
  if ((state === "voting" || state === "voted") && room) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{t.liveBadge}</Badge>
              {room.has_password && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck size={12} /> {t.protected}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                  {room.title}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-300">
                  {results ? t.totalVotes(totalVotes) : t.resultsLoading}
                </p>
              </div>
              <Button variant="secondary" onClick={handleCopyLink}>
                <Copy size={16} /> {copySuccess ? t.copied : t.copyLink}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-zinc-100">{t.voteTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {state === "voting" && (
                  <form onSubmit={handleVoteSubmit} className="space-y-4">
                    <div className="space-y-3">
                      {room.options.map((option, index) => (
                        <label
                          key={option}
                          className={
                            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all" +
                             (selectedOption === option
                               ? " border-emerald-500 bg-emerald-50"
                               : " border-zinc-200 bg-slate-50 hover:border-emerald-100 dark:border-white/10 dark:bg-slate-900 dark:hover:border-emerald-400/40")
                           }
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={
                                "flex h-6 w-6 items-center justify-center rounded-full border" +
                                (selectedOption === option
                                  ? " border-emerald-500 bg-emerald-500"
                                 : " border-zinc-300 bg-slate-50 dark:border-white/30 dark:bg-slate-900")
                              }
                            >
                              {selectedOption === option && (
                                <Check size={14} className="text-white" />
                              )}
                            </span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                              {option}
                            </span>
                          </div>
                          <Badge variant="secondary">{String(index + 1).padStart(2, "0")}</Badge>
                          <input
                            type="radio"
                            name="vote"
                            value={option}
                            checked={selectedOption === option}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedOption(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>

                    {voteError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        {voteError}
                      </div>
                    )}

                    <Button type="submit" size="lg" disabled={!selectedOption} className="w-full">
                      {t.voteSubmit}
                    </Button>
                  </form>
                )}

                {state === "voted" && (
                  <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <div className="font-semibold">{t.votedTitle}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-200">
                      {t.votedDescription}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">{t.resultsTitle}</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="space-y-4">
                {results ? (
                  room.options.map((option) => {
                    const votes = results.results[option] || 0;
                    const percentage = getPercentage(option);

                    return (
                      <div key={option} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            {option}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {t.voteCount(votes, percentage)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-white/10">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-zinc-400 dark:text-zinc-500">{t.resultsPending}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
            <Link href="/polls" className="hover:text-emerald-600 dark:hover:text-emerald-300">
              {t.otherPolls}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
