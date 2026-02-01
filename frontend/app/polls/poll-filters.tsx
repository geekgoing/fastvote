"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

type PollFiltersProps = {
  search: string;
  sort: "latest" | "popular";
  labels: {
    searchPlaceholder: string;
    sortLatest: string;
    sortPopular: string;
  };
};

export default function PollFilters({ search, sort, labels }: PollFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search);
  const [currentSort, setCurrentSort] = useState(sort);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    setCurrentSort(sort);
  }, [sort]);

  const updateParams = (next: { search?: string; sort?: "latest" | "popular" }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

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
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateParams({ search: query });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          size={18}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full h-10 rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </form>

      {/* Sort Dropdown */}
      <div className="relative">
        <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <select
          value={currentSort}
          onChange={(e) => {
            const newSort = e.target.value as "latest" | "popular";
            setCurrentSort(newSort);
            updateParams({ sort: newSort });
          }}
          className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="latest">{labels.sortLatest}</option>
          <option value="popular">{labels.sortPopular}</option>
        </select>
      </div>
    </div>
  );
}
