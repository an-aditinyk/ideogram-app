"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Images, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Studio", icon: Wand2 },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/prompt-lab", label: "Prompt Lab", icon: FlaskConical },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 p-4 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-fuchsia-600/30">
          <Sparkles className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Ideogram Studio</p>
          <p className="text-xs text-muted-foreground">AI image lab</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Tip</p>
        Press <kbd className="rounded bg-muted px-1">⌘/Ctrl</kbd> +{" "}
        <kbd className="rounded bg-muted px-1">Enter</kbd> to generate.
      </div>
    </aside>
  );
}

/** Mobile bottom nav, shown below the lg breakpoint. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-card/80 backdrop-blur-xl lg:hidden">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
