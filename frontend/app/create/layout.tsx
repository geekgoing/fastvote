import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "투표 만들기",
  description: "FastVote에서 새 투표를 만들어 보세요",
  openGraph: {
    title: "투표 만들기 - FastVote",
    description: "FastVote에서 새 투표를 만들어 보세요",
  },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
