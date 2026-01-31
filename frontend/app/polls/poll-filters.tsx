"use client";

import { useMemo, useState, useEffect, KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type PollFiltersProps = {
  search: string;
  sort: "latest" | "popular";
  tags: string[];
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    sortLabel: string;
    sortLatest: string;
    sortPopular: string;
    tagFilterLabel: string;
    tagFilterPlaceholder: string;
    clearFilters: string;
  };
};

export default function PollFilters({ search, sort, tags, labels }: PollFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  const [tagInput, setTagInput] = useState("");

  // Keep local state in sync with props (e.g. browser back/forward)
  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    setSelectedTags(tags);
  }, [tags]);

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const updateParams = (next: {
    search?: string;
    sort?: "latest" | "popular";
    tags?: string[];
  }) => {
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

    if (next.tags !== undefined) {
      if (next.tags.length > 0) {
        nextParams.set("tags", next.tags.join(","));
      } else {
        nextParams.delete("tags");
      }
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateParams({ search: query });
  };

  const handleAddTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !selectedTags.includes(trimmed)) {
        const newTags = [...selectedTags, trimmed];
        setSelectedTags(newTags);
        updateParams({ tags: newTags });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    updateParams({ tags: newTags });
  };

  const handleClearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setTagInput("");
    router.replace(pathname);
  };

  const hasActiveFilters = query.trim() !== "" || selectedTags.length > 0 || sort !== "latest";

  return (
    <div className="relative rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/95">
      {/* Search and Sort Row */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        {/* Search Input */}
        <div className="flex-1">
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {labels.searchLabel}
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              size={18}
              strokeWidth={2}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:focus:border-emerald-400 dark:focus:bg-slate-800 dark:focus:ring-emerald-400/20"
            />
          </form>
        </div>

        {/* Sort Segmented Control */}
        <div className="lg:w-auto">
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {labels.sortLabel}
          </label>
          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50/50 p-1 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => updateParams({ sort: "latest" })}
              className={`relative rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                sort === "latest"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {labels.sortLatest}
            </button>
            <button
              type="button"
              onClick={() => updateParams({ sort: "popular" })}
              className={`relative rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                sort === "popular"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {labels.sortPopular}
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filter Section */}
      <div className="space-y-3 border-t border-zinc-100 pt-5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {labels.tagFilterLabel}
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="group flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              <X size={14} className="transition-transform group-hover:rotate-90" />
              {labels.clearFilters}
            </button>
          )}
        </div>

        <Input
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={handleAddTag}
          placeholder={labels.tagFilterPlaceholder}
          className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 text-sm transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:focus:border-emerald-400 dark:focus:bg-slate-800 dark:focus:ring-emerald-400/20"
        />

        {/* Tag Chips */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/20"
              >
                {tag}
                <X
                  size={14}
                  className="transition-transform group-hover:rotate-90"
                  strokeWidth={2.5}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
