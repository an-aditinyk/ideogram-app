"use client";

import { useEffect } from "react";

/**
 * Registers a global keyboard shortcut. Defaults to Ctrl/Cmd + Enter.
 * Used on the studio page to trigger generation from anywhere in the form.
 */
export function useKeyboardShortcut(
  handler: () => void,
  options: { key?: string; ctrlOrMeta?: boolean; enabled?: boolean } = {},
) {
  const { key = "Enter", ctrlOrMeta = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      const modifier = ctrlOrMeta ? e.ctrlKey || e.metaKey : true;
      if (modifier && e.key === key) {
        e.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler, key, ctrlOrMeta, enabled]);
}
