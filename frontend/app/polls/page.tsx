import Link from "next/link";
import { cookies } from "next/headers";
import { BarChart2, Clock, Lock, CheckSquare } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { api, type RoomSummary } from "@/lib/api";
import { getLocaleFromCookie, getMessages, localeCookieName } from "@/lib/i18n";
import PollFilters from "./poll-filters";

type PollsPageProps = {
  searchParams?: {
    search?: string;
    sort?: string;
    tag?: string;
  };
};

export default async function PollsPage({ searchParams }: PollsPageProps) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get(localeCookieName)?.value);
  const messages = getMessages(locale);
  const t = messages.polls;

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const sort = searchParams?.sort === "popular" ? "popular" : "latest";
  const selectedTag = typeof searchParams?.tag === "string" ? searchParams.tag : "";

  let rooms: RoomSummary[] = [];

  try {
    const data = await api.listRooms({
      search: search || undefined,
      sort,
      tags: selectedTag ? [selectedTag] : undefined,
      page: 1,
      page_size: 30,
    });
    rooms = data.rooms;
  } catch (error) {
    console.error("Failed to load rooms:", error);
  }

  // Collect all unique tags from rooms
  const allTags = Array.from(new Set(rooms.flatMap((room) => room.tags))).slice(0, 8);

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const formatDate = (value: string) => {
    try {
      return formatter.format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t.totalPolls ? t.totalPolls(rooms.length) : `총 ${rooms.length}개의 투표`}
            </p>
          </div>
          <PollFilters
            search={search}
            sort={sort}
            labels={{
              searchPlaceholder: t.searchPlaceholder,
              sortLatest: t.sortLatest,
              sortPopular: t.sortPopular,
            }}
          />
        </div>

        {/* Tag Filter Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/polls"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !selectedTag
                ? "bg-emerald-600 text-white dark:bg-emerald-500"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t.allTags || "All"}
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/polls?tag=${encodeURIComponent(tag)}${sort !== "latest" ? `&sort=${sort}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-emerald-600 text-white dark:bg-emerald-500"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Polls Grid */}
        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.uuid}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Bar chart decoration */}
                <div className="absolute right-4 top-4 flex items-end gap-0.5 opacity-30">
                  <div className="h-3 w-1.5 rounded-sm bg-emerald-400" />
                  <div className="h-5 w-1.5 rounded-sm bg-emerald-400" />
                  <div className="h-4 w-1.5 rounded-sm bg-emerald-400" />
                  <div className="h-6 w-1.5 rounded-sm bg-emerald-400" />
                </div>

                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {room.has_password && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                      <Lock size={12} />
                      {t.protectedBadge}
                    </span>
                  )}
                  {room.allow_multiple && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckSquare size={12} />
                      {t.multipleAllowed}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">
                  {room.title}
                </h3>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {room.tags.length > 0 ? (
                    room.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400">{t.noTags}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="mb-5 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <BarChart2 size={14} />
                    {t.participants(room.total_votes)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatDate(room.created_at)}
                  </span>
                </div>

                {/* Bottom: Link */}
                <div className="flex items-center justify-end">
                  {/* Action Link */}
                  <Link
                    href={`/vote/${room.uuid}`}
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {room.has_password ? (t.enterPoll || "입장하기") : t.viewPoll}
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
