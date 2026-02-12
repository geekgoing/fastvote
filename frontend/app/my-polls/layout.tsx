import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 투표 - FastVote",
  description: "내가 만든 투표를 확인하고 관리하세요",
  openGraph: {
    title: "내 투표 - FastVote",
    description: "내가 만든 투표를 확인하고 관리하세요",
  },
};

export default function MyPollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
