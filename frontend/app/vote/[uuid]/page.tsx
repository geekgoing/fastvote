"use client";

import { useEffect, useState, use } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Check, Copy, MessageCircle, Send, BarChart3, PieChartIcon, Share2, User } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { api, APIError, type VoteRoom, type VoteResults, type Comment } from "@/lib/api";
import { getFingerprint } from "@/lib/fingerprint";
import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Toast helper
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

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
          // Load comments
          try {
            const commentsData = await api.getComments(uuid);
            setComments(commentsData);
          } catch (err) {
            console.error('Failed to load comments:', err);
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
      // Load comments
      try {
        const commentsData = await api.getComments(uuid);
        setComments(commentsData);
      } catch (err) {
        console.error('Failed to load comments:', err);
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
      showToast(t.voteCompleted);
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
      showToast(t.copied);
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

  // Comment submission handler
  const handleCommentSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentContent.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await api.createComment(uuid, {
        content: commentContent.trim(),
        nickname: commentNickname.trim() || undefined,
      });
      setComments([...comments, newComment]);
      setCommentContent('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return t.minutesAgo(diffMins);
    if (diffHours < 24) return t.hoursAgo(diffHours);
    return date.toLocaleDateString();
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

  // Helper to find winner option
  const getWinnerOption = (): string | null => {
    if (!results || totalVotes === 0) return null;
    let maxVotes = -1;
    let winner: string | null = null;
    Object.entries(results.results).forEach(([option, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = option;
      }
    });
    return winner;
  };

  // Voting/Results state
  if ((state === "voting" || state === "voted") && room) {
    const winnerOption = getWinnerOption();

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Emerald Gradient Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-8 rounded-t-2xl relative">
            <button
              onClick={handleCopyLink}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={copySuccess ? t.copied : t.copyLink}
            >
              {copySuccess ? <Check size={20} /> : <Copy size={20} />}
            </button>

            {room.has_password && (
              <Badge className="bg-white/20 text-white border-0 mb-3 hover:bg-white/30">
                🔒 비공개
              </Badge>
            )}
            <h1 className="text-2xl font-bold mb-3 pr-12">{room.title}</h1>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span>총 {totalVotes}명 참여</span>
              <span>•</span>
              <span>{room.expires_at ? "만료 예정" : t.unlimited}</span>
              {room.tags && room.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {room.tags.map(tag => (
                      <span key={tag} className="bg-white/20 px-2 py-0.5 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="rounded-t-none border-t-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* VOTING STATE - Only show options, no results */}
              {state === "voting" && (
                <form onSubmit={handleVoteSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {room.options.map((option) => (
                      <label
                        key={option}
                        className={
                          "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all" +
                          (selectedOption === option
                            ? " border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                            : " border-gray-200 bg-white hover:border-emerald-200 dark:border-gray-700 dark:bg-slate-900 dark:hover:border-emerald-400/40")
                        }
                      >
                        <span
                          className={
                            "flex h-5 w-5 items-center justify-center rounded-full border-2" +
                            (selectedOption === option
                              ? " border-emerald-500 bg-emerald-500"
                              : " border-gray-300 bg-white dark:border-gray-600 dark:bg-slate-900")
                          }
                        >
                          {selectedOption === option && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-base font-medium text-gray-900 dark:text-gray-100 flex-1">
                          {option}
                        </span>
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
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      {voteError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={!selectedOption}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {t.submit}
                  </Button>
                </form>
              )}

              {/* VOTED STATE - Show results with view toggle */}
              {state === "voted" && (
                <div className="space-y-6">
                  {/* View Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.voteCompleted}
                    </div>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('bar')}
                        className={
                          "flex items-center justify-center w-9 h-9 rounded transition-colors" +
                          (viewMode === 'bar'
                            ? " bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                            : " text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200")
                        }
                        title={t.barView}
                      >
                        <BarChart3 size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('pie')}
                        className={
                          "flex items-center justify-center w-9 h-9 rounded transition-colors" +
                          (viewMode === 'pie'
                            ? " bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                            : " text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200")
                        }
                        title={t.pieView}
                      >
                        <PieChartIcon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Results Display */}
                  {results && totalVotes > 0 ? (
                    <>
                      {viewMode === 'bar' ? (
                        <div className="space-y-3">
                          {room.options.map((option) => {
                            const votes = results.results[option] || 0;
                            const percentage = getPercentage(option);
                            const isWinner = option === winnerOption;
                            return (
                              <div key={option} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {option}
                                    </span>
                                    {isWinner && totalVotes > 1 && (
                                      <Badge className="bg-emerald-600 text-white text-xs px-2 py-0 border-0">
                                        {t.winner}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {votes}표 · {percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                  <div
                                    className={
                                      "h-full flex items-center justify-end px-3 transition-all duration-500" +
                                      (isWinner
                                        ? " bg-gradient-to-r from-emerald-500 to-emerald-600"
                                        : " bg-gray-300 dark:bg-gray-600")
                                    }
                                    style={{ width: `${percentage}%` }}
                                  >
                                    {percentage > 10 && (
                                      <span className="text-sm font-semibold text-white">
                                        {percentage.toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={room.options.map((option) => ({
                                  name: option,
                                  value: results.results[option] || 0,
                                }))}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ percent }) =>
                                  `${((percent || 0) * 100).toFixed(0)}%`
                                }
                              >
                                {room.options.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value ?? 0}표`, '득표수']} />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-8">
                      {t.resultsPending}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button asChild variant="secondary" className="flex-1">
                      <Link href="/polls">
                        {t.viewOtherPolls}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      {t.share}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toast */}
          {toast.visible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 rounded-full bg-gray-900 dark:bg-gray-100 px-5 py-3 text-sm font-medium text-white dark:text-gray-900 shadow-lg">
                <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
                {toast.message}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                <MessageCircle size={20} />
                {t.comments} ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment Form Card */}
              <form onSubmit={handleCommentSubmit}>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      value={commentNickname}
                      onChange={(e) => setCommentNickname(e.target.value)}
                      placeholder={t.nicknamePlaceholder}
                      className="pl-9 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={t.commentPlaceholder}
                      className="flex-1 bg-white dark:bg-gray-900"
                    />
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || isSubmittingComment}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t.noCommentsYet}</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {comment.nickname}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
