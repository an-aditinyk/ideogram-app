"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the first client render. Used to guard against hydration
 * mismatches when reading from persisted (localStorage) Zustand stores.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
