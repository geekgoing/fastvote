"use client";

import { useEffect, useState, use } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MessageCircle, Send, BarChart3, PieChartIcon, Share2, User } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import confetti from 'canvas-confetti';

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
  const { locale, messages } = useLocale();
  const t = messages.vote;

  const [state, setState] = useState<ViewState>('loading');
  const [room, setRoom] = useState<VoteRoom | null>(null);
  const [results, setResults] = useState<VoteResults | null>(null);
  const [error, setError] = useState<string>('');

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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

        const params = new URLSearchParams(window.location.search);
        const shareToken = params.get('share_token');

         if (data.has_password) {
           // attempt share_token bypass
           if (shareToken) {
             try {
               await api.verifyPassword(uuid, undefined, shareToken);
             } catch (err) {
               setState('password');
               return;
             }
           } else {
             setState('password');
             return;
           }
         }
         {
          // Load results then comments sequentially; log errors separately
           try {
             try {
               const fingerprint = getFingerprint();
               const resultsData = await api.getResults(uuid, fingerprint);
               setResults(resultsData);
               if (resultsData.has_voted) {
                 setState('voted');
               }
             } catch (err) {
               console.error('Failed to load results:', err);
             }

            try {
              const commentsData = await api.getComments(uuid);
              setComments(commentsData);
            } catch (err) {
              console.error('Failed to load comments:', err);
            }
          } catch (err) {
            // Defensive: keep parity with previous behavior
            console.error('Unexpected error when loading results/comments:', err);
          }
           setState(prev => (prev === 'voted' ? 'voted' : 'voting'));
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
      // Load results and comments in parallel; log errors separately
       try {
         try {
           const fingerprint = getFingerprint();
           const resultsData = await api.getResults(uuid, fingerprint);
           setResults(resultsData);
           if (resultsData.has_voted) {
             setState('voted');
           }
         } catch (err) {
           console.error('Failed to load results:', err);
         }

        try {
          const commentsData = await api.getComments(uuid);
          setComments(commentsData);
        } catch (err) {
          console.error('Failed to load comments:', err);
        }
      } catch (err) {
        console.error('Unexpected error when loading results/comments:', err);
      }
       setState(prev => (prev === 'voted' ? 'voted' : 'voting'));
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
    if (selectedOptions.length === 0) return;

    setVoteError('');
    const fingerprint = getFingerprint();

    try {
      await api.vote(uuid, selectedOptions, fingerprint);
      setState('voted');
      showToast(t.voteCompleted);
      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
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
      setCommentNickname('');
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

  // Calculate hours until expiration
  const getExpirationHours = (expiresAt: string): number => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    return Math.max(1, hours);
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
                  <label htmlFor="room-password" className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {t.passwordLabel}
                  </label>
                      <Input
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

  // Helper to find winner option (returns null if tied)
  const getWinnerOption = (): string | null => {
    if (!results || totalVotes === 0) return null;
    const entries = Object.entries(results.results);
    if (entries.length === 0) return null;

    // Sort by votes descending
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const maxVotes = sorted[0][1];

    // Check if there's a tie for first place
    const topOptions = sorted.filter(([, votes]) => votes === maxVotes);
    if (topOptions.length > 1) return null; // Tie - no winner

    return sorted[0][0];
  };

  // Voting/Results state
  if ((state === "voting" || state === "voted") && room) {
    const winnerOption = getWinnerOption();
    const isVoting = state === "voting";
    const isVoted = state === "voted";

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Back to List */}
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-4"
            onClick={() => window.location.href = "/polls"}
          >
            <ArrowLeft size={16} /> {t.backToList}
          </Button>

          {/* Emerald Gradient Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-8 rounded-t-2xl relative">
            {room.has_password && (
              <Badge className="bg-white/20 text-white border-0 mb-3 hover:bg-white/30">
                🔒 {t.privateBadge}
              </Badge>
            )}
            <h1 className="text-2xl font-bold mb-3 pr-12">{room.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-white/90 flex-wrap">
                <span>{t.totalVotes(totalVotes)}</span>
                <span>•</span>
                <span>{room.expires_at ? t.expiresIn(getExpirationHours(room.expires_at)) : t.unlimited}</span>
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
              {/* Chart Toggle - visible only when voted */}
               {isVoted && (
                <div className="flex gap-1 bg-white/20 p-1 rounded-lg ml-4">
                  <button
                    onClick={() => setViewMode('bar')}
                    className={
                      "flex items-center justify-center w-8 h-8 rounded transition-colors" +
                      (viewMode === 'bar'
                        ? " bg-white text-emerald-600"
                        : " text-white/70 hover:text-white hover:bg-white/10")
                    }
                    title={t.barView}
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('pie')}
                    className={
                      "flex items-center justify-center w-8 h-8 rounded transition-colors" +
                      (viewMode === 'pie'
                        ? " bg-white text-emerald-600"
                        : " text-white/70 hover:text-white hover:bg-white/10")
                    }
                    title={t.pieView}
                  >
                    <PieChartIcon size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="rounded-t-none border-t-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* VOTING STATE - Only show options, no results */}
               {isVoting && (
                <div>
                  {/* Voting title required by tests */}
                  <h2 data-testid="vote-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t.voteTitle}
                  </h2>
                  <form onSubmit={handleVoteSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {room.options.map((option) => {
                      const isSelected = selectedOptions.includes(option);
                      const handleToggle = () => {
                        if (room.allow_multiple) {
                          setSelectedOptions(prev =>
                            prev.includes(option)
                              ? prev.filter(o => o !== option)
                              : [...prev, option]
                          );
                        } else {
                          setSelectedOptions([option]);
                        }
                      };
                      return (
                        <label
                          key={option}
                          className={
                            "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all" +
                            (isSelected
                              ? " border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                              : " border-gray-200 bg-white hover:border-emerald-200 dark:border-gray-700 dark:bg-slate-900 dark:hover:border-emerald-400/40")
                          }
                        >
                          <span
                            className={
                              "flex h-5 w-5 items-center justify-center border-2" +
                              (room.allow_multiple ? " rounded" : " rounded-full") +
                              (isSelected
                                ? " border-emerald-500 bg-emerald-500"
                                : " border-gray-300 bg-white dark:border-gray-600 dark:bg-slate-900")
                            }
                          >
                            {isSelected && (
                              room.allow_multiple
                                ? <Check size={12} className="text-white" />
                                : <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </span>
                          <span className="text-base font-medium text-gray-900 dark:text-gray-100 flex-1">
                            {option}
                          </span>
                          <input
                            type={room.allow_multiple ? "checkbox" : "radio"}
                            name="vote"
                            value={option}
                            checked={isSelected}
                            onChange={handleToggle}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {voteError && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      {voteError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={selectedOptions.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {t.submit}
                  </Button>
                  </form>
                </div>
              )}

              {/* VOTED STATE - Show results */}
               {isVoted && (
                <div className="space-y-4">
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
                              <div key={option} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                                {/* Background bar */}
                                <div
                                  className={
                                    "absolute inset-y-0 left-0 transition-all duration-500" +
                                    (isWinner
                                      ? " bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      : " bg-gray-300 dark:bg-gray-600")
                                  }
                                  style={{ width: `${percentage}%` }}
                                />
                                {/* Content overlay */}
                                <div className="relative h-full flex items-center justify-between px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {option}
                                    </span>
                                    {isWinner && (
                                      <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                        {t.winner}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <span>{percentage.toFixed(0)}%</span>
                                    <span className="text-gray-400">·</span>
                                    <span>{t.votes(votes)}</span>
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
                              >
                                {room.options.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0];
                                    const value = Number(data.value);
                                    const percent = totalVotes > 0 ? (value / totalVotes) * 100 : 0;
                                    return (
                                      <div className="rounded-lg bg-white dark:bg-gray-800 px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                          {t.votes(value)} · {percent.toFixed(0)}%
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <Input
                      value={commentNickname}
                      onChange={(e) => setCommentNickname(e.target.value)}
                      placeholder={t.nicknamePlaceholder}
                      className="text-sm bg-white dark:bg-gray-900 h-9 max-w-[200px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={t.commentPlaceholder}
                      className="flex-1 bg-white dark:bg-gray-900 h-9"
                    />
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || isSubmittingComment}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 h-9"
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div key={locale} className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t.noCommentsYet}</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <User size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {comment.nickname || t.anonymous}
                          </span>
                        </div>
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
