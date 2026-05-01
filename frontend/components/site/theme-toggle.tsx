"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";

const subscribeToClientMount = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { messages } = useLocale();
  const mounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  );

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={messages.navbar.themeLabel}
      data-testid="theme-toggle"
      disabled={!mounted}
    >
      {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
    </Button>
  );
}
