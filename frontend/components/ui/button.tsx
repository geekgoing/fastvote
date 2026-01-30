"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 dark:bg-emerald-500 dark:hover:bg-emerald-400",
        secondary:
          "bg-white text-zinc-800 border border-zinc-200 hover:border-zinc-300 dark:bg-slate-900 dark:text-zinc-100 dark:border-white/10 dark:hover:border-white/20",
        outline:
          "border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5",
        ghost: "bg-transparent hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 dark:hover:bg-white/10",
        dark: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
