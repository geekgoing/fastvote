import { cookies } from "next/headers";
import { Navbar } from "@/components/site/navbar";
import { localeCookieName } from "@/lib/i18n";
import MyPolls from "./my-polls";

export default async function MyPollsPage() {
  const cookieStore = await cookies();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <MyPolls localeCookie={cookieStore.get(localeCookieName)?.value ?? null} />
      </main>
    </div>
  );
}
