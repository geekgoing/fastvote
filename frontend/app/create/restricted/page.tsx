"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type MyPollRecord } from "@/lib/api";

type OptionDraft = {
  id: string;
  label: string;
  allowedParticipants: string[];
};

const initialParticipants: string[] = [];

const createInitialOptions = (): OptionDraft[] => [
  {
    id: "option-1",
    label: "",
    allowedParticipants: initialParticipants,
  },
  {
    id: "option-2",
    label: "",
    allowedParticipants: initialParticipants,
  },
];

export default function RestrictedCreatePage() {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.create;
  const [title, setTitle] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [isParticipantComposing, setIsParticipantComposing] = useState(false);
  const [participants, setParticipants] = useState(initialParticipants);
  const [options, setOptions] = useState<OptionDraft[]>(createInitialOptions);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTagComposing, setIsTagComposing] = useState(false);
  const [expiresIn, setExpiresIn] = useState("24");
  const [password, setPassword] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addParticipant = () => {
    const name = participantInput.trim();

    if (!name || participants.includes(name)) return;

    setParticipants((current) => [...current, name]);
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        allowedParticipants: [...option.allowedParticipants, name],
      }))
    );
    setParticipantInput("");
  };

  const removeParticipant = (name: string) => {
    setParticipants((current) =>
      current.filter((participant) => participant !== name)
    );
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        allowedParticipants: option.allowedParticipants.filter(
          (participant) => participant !== name
        ),
      }))
    );
  };

  const updateOptionLabel = (optionId: string, label: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, label } : option
      )
    );
  };

  const removeOption = (optionId: string) => {
    if (options.length <= 2) return;

    setOptions((current) => current.filter((option) => option.id !== optionId));
  };

  const addOption = () => {
    setOptions((current) => [
      ...current,
      {
        id: `option-${Date.now()}`,
        label: "",
        allowedParticipants: participants,
      },
    ]);
  };

  const excludeParticipant = (optionId: string, name: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              allowedParticipants: option.allowedParticipants.filter(
                (participant) => participant !== name
              ),
            }
          : option
      )
    );
  };

  const restoreParticipant = (optionId: string, name: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId && !option.allowedParticipants.includes(name)
          ? {
              ...option,
              allowedParticipants: [...option.allowedParticipants, name],
            }
          : option
      )
    );
  };

  const allowAll = (optionId: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? { ...option, allowedParticipants: participants }
          : option
      )
    );
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) return;

    if (trimmedTag.length > 20) {
      setError(t.errors.tagTooLong);
      return;
    }

    if (tags.length >= 5) {
      setError(t.errors.tooManyTags);
      return;
    }

    if (!tags.includes(trimmedTag)) {
      setTags((current) => [...current, trimmedTag]);
    }

    setTagInput("");
    setError("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(t.errors.missingTitle);
      return;
    }

    const validOptionDrafts = options
      .map((option) => ({
        label: option.label.trim(),
        allowedParticipants: option.allowedParticipants.filter((name) =>
          participants.includes(name)
        ),
      }))
      .filter((option) => option.label);

    if (validOptionDrafts.length < 2) {
      setError(t.errors.missingOptions);
      return;
    }

    if (participants.length < 1) {
      setError("참여 인원을 1명 이상 추가해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const ttl = parseInt(expiresIn, 10) * 60 * 60;
      const validOptions = validOptionDrafts.map((option) => option.label);
      const optionAllowedParticipants = validOptionDrafts.map(
        (option) => option.allowedParticipants
      );
      const data = await api.createRoom({
        title: title.trim(),
        options: validOptions,
        participants,
        option_allowed_participants: optionAllowedParticipants,
        password: password.trim() || undefined,
        ttl,
        tags,
        allow_multiple: allowMultiple,
        is_private: isPrivate,
      });

      let record: MyPollRecord = {
        uuid: data.uuid,
        title: title.trim(),
        created_at: new Date().toISOString(),
        expires_at: null,
        tags,
        total_votes: 0,
        has_password: Boolean(password.trim()),
        allow_multiple: allowMultiple,
        is_private: isPrivate,
        share_token: data.share_token,
      };

      try {
        const full = await api.getRoom(data.uuid);
        record = {
          uuid: full.uuid,
          title: full.title,
          created_at: full.created_at,
          expires_at: full.expires_at ?? null,
          tags: full.tags ?? tags,
          total_votes: 0,
          has_password: full.has_password,
          allow_multiple: full.allow_multiple ?? allowMultiple,
          is_private: isPrivate,
          share_token: data.share_token,
        };
      } catch {
        // Keep the local fallback record if the detail fetch fails.
      }

      try {
        const key = "fastvote:my-polls";
        const raw = localStorage.getItem(key);
        const list: MyPollRecord[] = raw ? (JSON.parse(raw) as MyPollRecord[]) : [];
        const filtered = list.filter((item) => item.uuid !== record.uuid);
        filtered.unshift(record);
        localStorage.setItem(key, JSON.stringify(filtered.slice(0, 30)));
      } catch (storageErr) {
        console.warn("Failed to save my poll to localStorage", storageErr);
      }

      const params = new URLSearchParams();
      if (data.share_token) {
        params.set("share_token", data.share_token);
      }
      const query = params.toString();
      router.push(query ? `/vote/${data.uuid}?${query}` : `/vote/${data.uuid}`);
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
            <Badge className="mb-4">특정인원 투표 생성</Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              참여자별 선택 제한 투표
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-300">
              기존 투표 생성 흐름에 참여자와 선택지별 제외 인원을 추가합니다.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">
              투표 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              <section className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {t.questionLabel}
                </label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t.questionPlaceholder}
                />
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    참여 인원
                  </label>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {participants.length}명
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={participantInput}
                    onChange={(event) => setParticipantInput(event.target.value)}
                    onCompositionStart={() => setIsParticipantComposing(true)}
                    onCompositionEnd={() => setIsParticipantComposing(false)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing || isParticipantComposing) {
                        return;
                      }

                      if (event.key === "Enter") {
                        event.preventDefault();
                        addParticipant();
                      }
                    }}
                    placeholder="참여자 이름 입력 후 Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addParticipant}
                    disabled={!participantInput.trim()}
                    aria-label="참여자 추가"
                  >
                    <UserPlus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {participants.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => removeParticipant(name)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                    >
                      {name}
                      <X size={14} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                      선택지별 참여 가능 인원
                    </label>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      기본값은 모든 참여자가 선택 가능입니다. 제외할 이름의 칩을 눌러 제거하세요.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addOption}>
                    <Plus size={16} /> {t.addOption}
                  </Button>
                </div>

                <div className="space-y-4">
                  {options.map((option, index) => {
                    const excludedParticipants = participants.filter(
                      (name) => !option.allowedParticipants.includes(name)
                    );

                    return (
                      <div
                        key={option.id}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1 space-y-4">
                            <div className="flex gap-2">
                              <Input
                                value={option.label}
                                onChange={(event) =>
                                  updateOptionLabel(option.id, event.target.value)
                                }
                                placeholder={t.optionPlaceholder(index + 1)}
                              />
                              {options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(option.id)}
                                  aria-label={t.deleteOption}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                                  선택 가능 인원
                                </span>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
                                  onClick={() => allowAll(option.id)}
                                >
                                  <RotateCcw size={12} /> 전체 허용
                                </button>
                              </div>
                              <div className="flex min-h-10 flex-wrap gap-2">
                                {option.allowedParticipants.length > 0 ? (
                                  option.allowedParticipants.map((name) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => excludeParticipant(option.id, name)}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-emerald-400/30 dark:bg-slate-950 dark:text-emerald-200 dark:hover:border-red-400/40 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                                    >
                                      <Check size={13} />
                                      {name}
                                      <X size={14} />
                                    </button>
                                  ))
                                ) : (
                                  <span className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-400 dark:border-white/10">
                                    선택 가능한 인원이 없습니다
                                  </span>
                                )}
                              </div>
                            </div>

                            {excludedParticipants.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                                  제외 인원
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {excludedParticipants.map((name) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => restoreParticipant(option.id, name)}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-white dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-slate-950"
                                    >
                                      {name}
                                      <Plus size={14} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {t.tagsLabel}
                  </label>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {t.tagsHint}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onCompositionStart={() => setIsTagComposing(true)}
                    onCompositionEnd={() => setIsTagComposing(false)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing || isTagComposing) {
                        return;
                      }

                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t.tagsPlaceholder}
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                  >
                    {t.addTag}
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800"
                      >
                        {tag}
                        <X size={14} className="opacity-70 hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between py-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                >
                  <span>{t.advancedSettings}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-1 items-start gap-3">
                          <CheckSquare size={18} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                          <div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                              {t.allowMultipleLabel}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {t.allowMultipleHint}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAllowMultiple(!allowMultiple)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
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
                        <div className="flex flex-1 items-start gap-3">
                          <Lock size={18} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                          <div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                              {t.isPrivateLabel}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {t.isPrivateHint}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPrivate(!isPrivate)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
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
                        <div className="space-y-2 pl-8">
                          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                            {t.passwordLabel}
                          </label>
                          <Input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder={t.passwordPlaceholder}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-1 items-start gap-3">
                          <Calendar size={18} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                          <div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                              {t.expiresLabel}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {t.expiresHint}
                            </div>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <select
                            value={expiresIn}
                            onChange={(event) => setExpiresIn(event.target.value)}
                            className="cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          >
                            {t.expiresOptions.map((time) => (
                              <option key={time.value} value={time.value}>
                                {time.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? t.submitting : "특정인원 투표 만들기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
