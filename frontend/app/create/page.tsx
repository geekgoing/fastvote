"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresIn, setExpiresIn] = useState("24");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError("최소 2개의 선택지를 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          options: validOptions,
          expires_in: parseInt(expiresIn),
          password: password.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "투표 생성에 실패했습니다");
      }

      const data = await response.json();
      router.push(`/vote/${data.uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "투표 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={16} /> 홈으로
          </Button>
          <div>
            <Badge className="mb-3">Create Poll</Badge>
            <h1 className="text-3xl font-bold text-zinc-900">새로운 투표 만들기</h1>
            <p className="mt-2 text-zinc-500">
              제목과 선택지를 입력하면 즉시 투표 링크가 생성됩니다.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>투표 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">질문</label>
                <Textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="무엇을 투표할까요? (예: 점심 메뉴 추천)"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700">선택지</label>
                  <span className="text-xs text-zinc-400">최소 2개</span>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                          {index + 1}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`옵션 ${index + 1}`}
                          className="pl-8"
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          aria-label="선택지 삭제"
                        >
                          <Trash2 size={18} className="text-zinc-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addOption}>
                  <Plus size={16} /> 옵션 추가하기
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">만료 시간</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { value: "1", label: "1시간" },
                      { value: "6", label: "6시간" },
                      { value: "12", label: "12시간" },
                      { value: "24", label: "24시간" },
                    ].map((time) => (
                      <Button
                        key={time.value}
                        type="button"
                        variant={expiresIn === time.value ? "dark" : "secondary"}
                        onClick={() => setExpiresIn(time.value)}
                      >
                        {time.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">비밀번호 (선택)</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 설정하면 투표 결과를 보호할 수 있습니다"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? "생성 중..." : "투표 시작하기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
