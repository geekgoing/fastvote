"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PollFiltersProps = {
  search: string;
  sort: "latest" | "popular";
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    sortLabel: string;
    sortLatest: string;
    sortPopular: string;
  };
};

export default function PollFilters({ search, sort, labels }: PollFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search);

  // Keep local query state in sync with `search` prop (e.g. browser back/forward)
  useEffect(() => {
    setQuery(search);
  }, [search]);

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const updateParams = (next: { search?: string; sort?: "latest" | "popular" }) => {
    const nextParams = new URLSearchParams(params);

    if (next.search !== undefined) {
      const trimmed = next.search.trim();
      if (trimmed) {
        nextParams.set("search", trimmed);
      } else {
        nextParams.delete("search");
      }
    }

    if (next.sort) {
      nextParams.set("sort", next.sort);
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{labels.searchLabel}</span>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateParams({ search: query });
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
            />
            <Button type="submit" variant="secondary" className="sm:w-auto">
              {labels.searchButton}
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{labels.sortLabel}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={sort === "latest" ? "dark" : "secondary"}
              onClick={() => updateParams({ sort: "latest" })}
            >
              {labels.sortLatest}
            </Button>
            <Button
              type="button"
              variant={sort === "popular" ? "dark" : "secondary"}
              onClick={() => updateParams({ sort: "popular" })}
            >
              {labels.sortPopular}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
