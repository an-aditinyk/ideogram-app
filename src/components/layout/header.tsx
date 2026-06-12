"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 lg:hidden">
          <Sparkles className="size-4 text-white" />
        </Link>
        <div>
          <h1 className="text-base font-semibold lg:text-lg">{title}</h1>
          {description ? (
            <p className="hidden text-sm text-muted-foreground sm:block">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
