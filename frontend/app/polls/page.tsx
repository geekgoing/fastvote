import Link from "next/link";
import { cookies } from "next/headers";
import { BarChart2, Clock } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type RoomSummary } from "@/lib/api";
import { getLocaleFromCookie, getMessages, localeCookieName } from "@/lib/i18n";
import PollFilters from "./poll-filters";

type PollsPageProps = {
  searchParams?: {
    search?: string;
    sort?: string;
  };
};

export default async function PollsPage({ searchParams }: PollsPageProps) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get(localeCookieName)?.value);
  const messages = getMessages(locale);
  const t = messages.polls;

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const sort = searchParams?.sort === "popular" ? "popular" : "latest";

  let rooms: RoomSummary[] = [];

  try {
    const data = await api.listRooms({
      search: search || undefined,
      sort,
      page: 1,
      page_size: 30,
    });
    rooms = data.rooms;
  } catch (error) {
    console.error("Failed to load rooms:", error);
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-3">
          <Badge className="w-fit">{t.badge}</Badge>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-300">{t.description}</p>
        </div>

        <div className="mb-8">
          <PollFilters
            search={search}
            sort={sort}
            labels={{
              searchLabel: t.searchLabel,
              searchPlaceholder: t.searchPlaceholder,
              searchButton: t.searchButton,
              sortLabel: t.sortLabel,
              sortLatest: t.sortLatest,
              sortPopular: t.sortPopular,
            }}
          />
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-400">
            {t.emptyState}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.uuid} className="group">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{room.has_password ? t.protectedBadge : t.openBadge}</Badge>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {room.allow_multiple ? t.multipleAllowed : t.singleOnly}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{room.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.tags.length > 0 ? (
                      room.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{t.noTags}</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <BarChart2 size={14} /> {t.participants(room.total_votes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {formatDate(room.created_at)}
                    </span>
                  </div>
                  <Button asChild variant="secondary" className="mt-2 w-full">
                    <Link href={`/vote/${room.uuid}`}>{t.viewPoll}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
