import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "투표 목록",
  description: "진행 중인 투표 목록을 확인하세요",
  openGraph: {
    title: "투표 목록 - FastVote",
    description: "진행 중인 투표 목록을 확인하세요",
  },
};

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
