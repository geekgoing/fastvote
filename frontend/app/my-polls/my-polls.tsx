"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, Clock, Lock, CheckSquare, Trash2 } from "lucide-react";
import { api, APIError, type MyPollRecord } from "@/lib/api";
import { getMessages, getLocaleFromCookie } from "@/lib/i18n";

const STORAGE_KEY = "fastvote:my-polls";
const MAX_ITEMS = 30;

function parseStored(): MyPollRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MyPollRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveStored(list: MyPollRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch {
    // ignore storage errors silently
  }
}

export default function MyPolls({ localeCookie }: { localeCookie?: string | null }) {
  const [items, setItems] = useState<MyPollRecord[]>([]);

  useEffect(() => {
    // Load from storage, cleanup expired entries
    const now = Date.now();
    const loaded = parseStored().filter((it) => {
      if (!it.expires_at) return true;
      const t = Date.parse(it.expires_at);
      return !isNaN(t) ? t > now : true;
    });

    // sort newest first by created_at (fallback to keep order)
    loaded.sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });

    const limited = loaded.slice(0, MAX_ITEMS);
    setItems(limited);
    saveStored(limited);

    // Background verification: remove items that return 404 from server
    limited.forEach((record) => {
      api.getRoom(record.uuid).catch((err) => {
        // If 404, remove from storage and state. Do not block rendering.
        if (err instanceof APIError && err.status === 404) {
          setItems((prev) => {
            const next = prev.filter((p) => p.uuid !== record.uuid);
            saveStored(next);
            return next;
          });
        }
      });
    });
  }, []);

  // locale for messages
  const locale = getLocaleFromCookie(localeCookie ?? undefined);
  const t = getMessages(locale).polls;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t.myPollsTitle}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {items.length > 0 ? t.myPollsTotal(items.length) : t.myPollsEmpty}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.myPollsEmpty}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((room) => (
          <div
            key={room.uuid}
            className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Delete button */}
            <button
              type="button"
              aria-label={t.deletePoll}
              title={t.deletePoll}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              onClick={() => {
                setItems((prev) => {
                  const next = prev.filter((p) => p.uuid !== room.uuid);
                  saveStored(next);
                  return next;
                });
              }}
            >
              <Trash2 size={16} />
            </button>

            {/* Badges - fixed height */}
            <div className="mb-3 flex min-h-[28px] flex-wrap items-start gap-2">
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
            <h3 className="mb-3 line-clamp-2 text-lg font-bold text-zinc-900 dark:text-white">
              {room.title}
            </h3>

            {/* Tags - fixed height */}
            <div className="mb-4 flex min-h-[28px] flex-wrap items-start gap-1.5">
              {room.tags && room.tags.length > 0 ? (
                room.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="py-1 text-xs text-zinc-400">{t.noTags}</span>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats & Action */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <BarChart2 size={14} />
                  {t.participants(room.total_votes ?? 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {room.created_at ? new Date(room.created_at).toLocaleDateString() : ""}
                </span>
              </div>
              <Link
                href={room.share_token ? `/vote/${room.uuid}?share_token=${encodeURIComponent(room.share_token)}` : `/vote/${room.uuid}`}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {t.viewPoll}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
