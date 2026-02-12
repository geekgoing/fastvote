"use client";

import { useState, useRef, useCallback } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "bottom" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900 ${
            side === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
