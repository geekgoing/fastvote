"use client";

import { useEffect, useState, use } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Check, Copy, ShieldCheck } from "lucide-react";

import { api, APIError, type VoteRoom, type VoteResults } from "@/lib/api";
import { getFingerprint } from "@/lib/fingerprint";
import { Navbar } from "@/components/site/navbar";
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
          setError('Vote room not found');
        } else {
          setError('Failed to load vote room');
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
        setPasswordError('Incorrect password');
      } else {
        setPasswordError('Verification failed');
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
      await api.vote(uuid, selectedOption, fingerprint);
      setState('voted');
    } catch (err) {
      if (err instanceof APIError && err.status === 409) {
        setVoteError('You have already voted');
        setState('voted');
      } else {
        setVoteError('Failed to submit vote');
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
  const getPercentage = (option: string): number => {
    if (!results || results.total_votes === 0) return 0;
    const votes = results.results[option] || 0;
    return (votes / results.total_votes) * 100;
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-emerald-50">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              투표방 정보를 불러오는 중...
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-emerald-50">
        <Navbar />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full p-8 text-center">
            <Badge variant="secondary" className="mb-3">
              Error
            </Badge>
            <h1 className="text-3xl font-bold text-zinc-900 mb-3">{error}</h1>
            <p className="text-sm text-zinc-500 mb-6">
              투표방을 찾을 수 없습니다. 홈으로 돌아가 다시 시도해주세요.
            </p>
            <Button asChild variant="secondary">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Password entry state
  if (state === "password" && room) {
    return (
      <div className="min-h-screen bg-emerald-50">
        <Navbar />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full">
            <CardHeader>
              <Badge className="w-fit">Protected</Badge>
              <CardTitle className="mt-3 text-2xl text-zinc-900">
                {room.title}
              </CardTitle>
              <p className="text-sm text-zinc-500">
                이 투표는 비밀번호로 보호되어 있습니다. 비밀번호를 입력해 주세요.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-zinc-700">
                    비밀번호
                  </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      autoFocus
                    />
                  {passwordError && (
                    <div className="text-sm text-red-600">{passwordError}</div>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  입장하기
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
      <div className="min-h-screen bg-emerald-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Live Vote</Badge>
              {room.has_password && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Protected
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                  {room.title}
                </h1>
                <p className="text-sm text-zinc-500">
                  {results ? `총 ${results.total_votes}명 참여` : "투표 결과를 불러오는 중..."}
                </p>
              </div>
              <Button variant="secondary" onClick={handleCopyLink}>
                <Copy size={16} /> {copySuccess ? "복사됨" : "링크 복사"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>투표하기</CardTitle>
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
                              : " border-zinc-200 bg-white hover:border-emerald-100")
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={
                                "flex h-6 w-6 items-center justify-center rounded-full border" +
                                (selectedOption === option
                                  ? " border-emerald-500 bg-emerald-500"
                                  : " border-zinc-300 bg-white")
                              }
                            >
                              {selectedOption === option && (
                                <Check size={14} className="text-white" />
                              )}
                            </span>
                            <span className="text-sm font-semibold text-zinc-800">
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
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {voteError}
                      </div>
                    )}

                    <Button type="submit" size="lg" disabled={!selectedOption} className="w-full">
                      투표 제출
                    </Button>
                  </form>
                )}

                {state === "voted" && (
                  <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <div className="font-semibold">투표가 완료되었습니다.</div>
                    <div className="text-xs text-emerald-600">
                      실시간 결과를 확인하고 링크를 공유해 보세요.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>실시간 결과</CardTitle>
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
                          <span className="text-sm font-semibold text-zinc-800">
                            {option}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {votes}표 ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-zinc-400">결과를 불러오는 중...</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center text-xs text-zinc-400">
            <Link href="/polls" className="hover:text-emerald-600">
              다른 투표 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
