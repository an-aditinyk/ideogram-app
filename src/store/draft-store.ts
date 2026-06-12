"use client";

/**
 * Ephemeral "current form draft" used to push a prompt/settings into the studio
 * form from elsewhere (gallery "reuse", template drag-and-drop, Prompt Lab
 * "use template"). Not persisted — it's just a cross-component channel.
 */
import { create } from "zustand";
import type { GenerateRequestInput } from "@/lib/ideogram";

interface DraftState {
  /** Incremented each time a new draft is pushed, so the form can react. */
  version: number;
  draft: Partial<GenerateRequestInput> | null;
  loadDraft: (draft: Partial<GenerateRequestInput>) => void;
  clear: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  version: 0,
  draft: null,
  loadDraft: (draft) =>
    set((s) => ({ draft, version: s.version + 1 })),
  clear: () => set({ draft: null }),
}));
