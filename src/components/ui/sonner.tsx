"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/** Toast container, themed to match the app. Mounted once in the root layout. */
export function Toaster() {
  const { theme = "system" } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-lg",
        },
      }}
    />
  );
}
