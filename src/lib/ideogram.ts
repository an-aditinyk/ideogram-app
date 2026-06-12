/**
 * Ideogram API constants, option metadata, and the Zod schema shared by the
 * frontend form and the backend proxy. Keeping this in one place means the
 * client and server validate the exact same contract.
 */
import { z } from "zod";
import {
  ASPECT_RATIOS,
  MAGIC_PROMPT_OPTIONS,
  RENDERING_SPEEDS,
  RESOLUTIONS,
  STYLE_TYPES,
} from "@/types/ideogram";

export const IDEOGRAM_BASE_URL =
  process.env.IDEOGRAM_API_BASE_URL?.replace(/\/$/, "") ||
  "https://api.ideogram.ai";

export const IDEOGRAM_GENERATE_PATH = "/v1/ideogram-v3/generate";

/** Zod schema validating the JSON our `/api/generate` proxy accepts. */
export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(2000, "Prompt is too long (max 2000 characters)"),
  negativePrompt: z.string().trim().max(2000).optional().or(z.literal("")),
  aspectRatio: z.enum(ASPECT_RATIOS),
  resolution: z.enum(RESOLUTIONS),
  styleType: z.enum(STYLE_TYPES),
  renderingSpeed: z.enum(RENDERING_SPEEDS),
  magicPrompt: z.enum(MAGIC_PROMPT_OPTIONS),
  numImages: z.number().int().min(1).max(8),
  seed: z.number().int().min(0).max(2147483647).optional(),
  isPrivate: z.boolean(),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;

// ── UI option metadata (labels for selectors) ────────────────────────────────

export const ASPECT_RATIO_OPTIONS: { value: (typeof ASPECT_RATIOS)[number]; label: string }[] = [
  { value: "1x1", label: "1:1 · Square" },
  { value: "16x9", label: "16:9 · Widescreen" },
  { value: "9x16", label: "9:16 · Portrait" },
  { value: "4x3", label: "4:3 · Standard" },
  { value: "3x4", label: "3:4 · Vertical" },
  { value: "3x2", label: "3:2 · Photo" },
  { value: "2x3", label: "2:3 · Photo (tall)" },
  { value: "16x10", label: "16:10" },
  { value: "10x16", label: "10:16" },
];

export const RESOLUTION_OPTIONS = RESOLUTIONS.map((value) => ({
  value,
  label: value === "AUTO" ? "Auto (from aspect ratio)" : value.replace("x", " × "),
}));

export const STYLE_TYPE_OPTIONS: { value: (typeof STYLE_TYPES)[number]; label: string }[] = [
  { value: "AUTO", label: "Auto" },
  { value: "GENERAL", label: "General" },
  { value: "REALISTIC", label: "Realistic" },
  { value: "DESIGN", label: "Design" },
  { value: "FICTION", label: "Fiction" },
];

export const RENDERING_SPEED_OPTIONS: { value: (typeof RENDERING_SPEEDS)[number]; label: string }[] = [
  { value: "TURBO", label: "Turbo · fastest" },
  { value: "DEFAULT", label: "Default · balanced" },
  { value: "QUALITY", label: "Quality · best" },
];

export const MAGIC_PROMPT_OPTIONS_META: { value: (typeof MAGIC_PROMPT_OPTIONS)[number]; label: string }[] = [
  { value: "AUTO", label: "Auto" },
  { value: "ON", label: "On" },
  { value: "OFF", label: "Off" },
];

/** Default form values, also used to reset the form. */
export const DEFAULT_GENERATE_REQUEST: GenerateRequestInput = {
  prompt: "",
  negativePrompt: "",
  aspectRatio: "1x1",
  resolution: "AUTO",
  styleType: "AUTO",
  renderingSpeed: "DEFAULT",
  magicPrompt: "AUTO",
  numImages: 1,
  seed: undefined,
  isPrivate: false,
};
