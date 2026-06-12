/**
 * Persisted generation settings — remembers the user's last-used parameters
 * (everything except the prompt text) so each new session starts where they
 * left off.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GenerateRequestInput } from "@/lib/ideogram";
import { DEFAULT_GENERATE_REQUEST } from "@/lib/ideogram";

type PersistedSettings = Omit<GenerateRequestInput, "prompt" | "negativePrompt" | "seed">;

interface SettingsState {
  settings: PersistedSettings;
  setSettings: (partial: Partial<PersistedSettings>) => void;
  reset: () => void;
}

const { prompt: _p, negativePrompt: _n, seed: _s, ...defaults } =
  DEFAULT_GENERATE_REQUEST;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaults,
      setSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      reset: () => set({ settings: defaults }),
    }),
    { name: "ideogram-settings" },
  ),
);
