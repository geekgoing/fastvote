import type { Metadata } from "next";

import { VoteClient } from "./vote-client";

const API_URL = `${process.env.BACKEND_URL || "http://localhost:8000"}/api`;

async function fetchRoom(uuid: string) {
  try {
    const res = await fetch(`${API_URL}/rooms/${uuid}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const room = await fetchRoom(uuid);

  if (!room) {
    return {
      title: "투표를 찾을 수 없습니다",
    };
  }

  const title = room.title;
  const description = `${room.options.length}개 선택지 투표에 참여하세요`;
  const tags = room.tags?.length ? ` | ${room.tags.map((t: string) => `#${t}`).join(" ")}` : "";

  return {
    title,
    description: description + tags,
    openGraph: {
      title: `${title} - FastVote`,
      description: description + tags,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - FastVote`,
      description: description + tags,
      images: ["/og-image.png"],
    },
  };
}

export default function VotePage({ params }: { params: Promise<{ uuid: string }> }) {
  return <VoteClient params={params} />;
}
