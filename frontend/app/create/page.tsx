"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ChevronDown, X, Clock } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function CreatePage() {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.create;
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [expiresIn, setExpiresIn] = useState("24");
  const [password, setPassword] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      if (!trimmedTag) return;

      if (trimmedTag.length > 20) {
        setError(t.errors.tagTooLong || "Tag is too long");
        return;
      }

      if (tags.length >= 5) {
        setError(t.errors.tooManyTags || "Too many tags");
        return;
      }

      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }

      setTagInput("");
      setError("");
    }
  };

  const handleTagCompositionEnd = () => {
    setIsComposing(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(t.errors.missingTitle);
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError(t.errors.missingOptions);
      return;
    }

    setIsLoading(true);

    try {
      const ttl = parseInt(expiresIn, 10) * 60 * 60;
      const data = await api.createRoom({
        title: title.trim(),
        options: validOptions,
        password: password.trim() || undefined,
        ttl,
        tags,
        allow_multiple: allowMultiple,
        is_private: isPrivate,
      });
      router.push(`/vote/${data.uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.submitFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={16} /> {t.backHome}
          </Button>
          <div>
            <Badge className="mb-3">{t.badge}</Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-300">{t.description}</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">{t.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.questionLabel}</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.questionPlaceholder}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.optionsLabel}</label>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{t.optionsHint}</span>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                          {index + 1}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={t.optionPlaceholder(index + 1)}
                          className="pl-8"
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          aria-label={t.deleteOption}
                        >
                          <Trash2 size={18} className="text-zinc-500 dark:text-zinc-300" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addOption}>
                  <Plus size={16} /> {t.addOption}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.tagsLabel}</label>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{t.tagsHint}</span>
                </div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={handleTagCompositionEnd}
                  onKeyDown={handleTagKeyDown}
                  placeholder={t.tagsPlaceholder}
                  disabled={tags.length >= 5}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-800"
                      >
                        {tag}
                        <X size={14} className="opacity-70 hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <span>{t.advancedSettings}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          {t.allowMultipleLabel}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {t.allowMultipleHint}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAllowMultiple(!allowMultiple)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          allowMultiple
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            allowMultiple ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          {t.isPrivateLabel}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {t.isPrivateHint}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isPrivate
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            isPrivate ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {isPrivate && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.passwordLabel}</label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t.passwordPlaceholder}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.expiresLabel}</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <select
                          value={expiresIn}
                          onChange={(e) => setExpiresIn(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-11 pr-10 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 cursor-pointer"
                        >
                          {t.expiresOptions.map((time) => (
                            <option key={time.value} value={time.value}>{time.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? t.submitting : t.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
