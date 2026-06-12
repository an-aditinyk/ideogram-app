/**
 * Generation history, persisted to localStorage. Stores prompt, parameters,
 * image URLs, timestamp and estimated cost for every generation.
 *
 * Note: Ideogram image URLs are ephemeral and may expire. History keeps the
 * metadata reliably; expired thumbnails should be re-generated.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GenerateRequest, HistoryEntry, IdeogramImage } from "@/types/ideogram";
import { estimateCost } from "@/lib/credits";
import { createId } from "@/lib/utils";

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (request: GenerateRequest, images: IdeogramImage[]) => HistoryEntry;
  removeEntry: (id: string) => void;
  clear: () => void;
  // Derived stats for the credit dashboard.
  totalImages: () => number;
  totalCost: () => number;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (request, images) => {
        const entry: HistoryEntry = {
          id: createId("gen"),
          createdAt: Date.now(),
          request,
          images,
          estimatedCost: estimateCost(images.length),
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
        return entry;
      },
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
      totalImages: () =>
        get().entries.reduce((sum, e) => sum + e.images.length, 0),
      totalCost: () => get().entries.reduce((sum, e) => sum + e.estimatedCost, 0),
    }),
    { name: "ideogram-history" },
  ),
);
