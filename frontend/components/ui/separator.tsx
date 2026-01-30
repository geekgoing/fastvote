"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px w-full bg-zinc-100 dark:bg-white/10", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
