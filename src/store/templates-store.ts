/**
 * Prompt Lab: saved prompt templates, persisted to localStorage. Supports
 * categories, tags, and favorites. Used by both the Prompt Lab page and the
 * drag-and-drop template tray on the studio page.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PromptCategory, PromptTemplate } from "@/types/ideogram";
import { createId } from "@/lib/utils";

export type TemplateDraft = Pick<
  PromptTemplate,
  "title" | "prompt" | "negativePrompt" | "category" | "tags"
>;

interface TemplatesState {
  templates: PromptTemplate[];
  addTemplate: (draft: TemplateDraft) => PromptTemplate;
  updateTemplate: (id: string, draft: Partial<TemplateDraft>) => void;
  removeTemplate: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

/** A few starter templates so the Prompt Lab isn't empty on first run. */
const SEED_TEMPLATES: PromptTemplate[] = [
  {
    id: "seed_realistic",
    title: "Golden-hour portrait",
    prompt:
      "Cinematic portrait of a young woman at golden hour, soft rim lighting, shallow depth of field, 85mm lens, photorealistic skin texture",
    negativePrompt: "blurry, distorted, extra fingers, low quality",
    category: "realistic",
    tags: ["portrait", "photography"],
    favorite: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "seed_typography",
    title: "Bold poster typography",
    prompt:
      'Modern minimalist poster with the large bold text "IDEOGRAM", clean grid layout, high contrast, Swiss design, vibrant accent color',
    category: "typography",
    tags: ["poster", "text", "design"],
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "seed_anime",
    title: "Anime cityscape",
    prompt:
      "Anime style neon-lit cyberpunk city at night, rain-soaked streets, dramatic lighting, detailed background, Studio-quality cel shading",
    category: "anime",
    tags: ["anime", "cyberpunk"],
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: SEED_TEMPLATES,
      addTemplate: (draft) => {
        const now = Date.now();
        const template: PromptTemplate = {
          id: createId("tpl"),
          favorite: false,
          createdAt: now,
          updatedAt: now,
          ...draft,
        };
        set((state) => ({ templates: [template, ...state.templates] }));
        return template;
      },
      updateTemplate: (id, draft) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...draft, updatedAt: Date.now() } : t,
          ),
        })),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, favorite: !t.favorite } : t,
          ),
        })),
    }),
    { name: "ideogram-templates" },
  ),
);

export type { PromptCategory };
