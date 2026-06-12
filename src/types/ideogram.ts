/**
 * Types for the Ideogram 3.0 API and our local domain model.
 *
 * The request schema mirrors the official multipart/form-data contract of
 * `POST https://api.ideogram.ai/v1/ideogram-v3/generate`. Our frontend speaks
 * JSON to our own `/api/generate` proxy, which converts it to multipart and
 * attaches the secret `Api-Key` header server-side.
 *
 * Docs: https://developer.ideogram.ai/api-reference/api-reference/generate-v3
 */

// ── Enums (exact values accepted by the Ideogram v3 API) ─────────────────────

export const ASPECT_RATIOS = [
  "1x1",
  "16x9",
  "9x16",
  "4x3",
  "3x4",
  "3x2",
  "2x3",
  "16x10",
  "10x16",
  "5x4",
  "4x5",
  "1x2",
  "2x1",
  "1x3",
  "3x1",
] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const RENDERING_SPEEDS = ["TURBO", "DEFAULT", "QUALITY"] as const;
export type RenderingSpeed = (typeof RENDERING_SPEEDS)[number];

export const MAGIC_PROMPT_OPTIONS = ["AUTO", "ON", "OFF"] as const;
export type MagicPromptOption = (typeof MAGIC_PROMPT_OPTIONS)[number];

export const STYLE_TYPES = [
  "AUTO",
  "GENERAL",
  "REALISTIC",
  "DESIGN",
  "FICTION",
] as const;
export type StyleType = (typeof STYLE_TYPES)[number];

/**
 * A subset of commonly used v3 resolutions. `resolution` conflicts with
 * `aspect_ratio` on the API, so we only send one of them. "AUTO" means
 * "let aspect_ratio decide the resolution" and is handled client-side.
 */
export const RESOLUTIONS = [
  "AUTO",
  "1024x1024",
  "1344x768",
  "768x1344",
  "1152x864",
  "864x1152",
  "1248x832",
  "832x1248",
  "1536x640",
  "640x1536",
] as const;
export type Resolution = (typeof RESOLUTIONS)[number];

// ── Request / response contracts ─────────────────────────────────────────────

/** The normalized payload our frontend sends to `/api/generate`. */
export interface GenerateRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  styleType: StyleType;
  renderingSpeed: RenderingSpeed;
  magicPrompt: MagicPromptOption;
  numImages: number;
  seed?: number;
  /** Ideogram's "private" generation flag. */
  isPrivate: boolean;
}

/** A single generated image as returned by Ideogram's `data[]`. */
export interface IdeogramImage {
  url: string | null;
  prompt: string;
  resolution: string;
  is_image_safe: boolean;
  seed: number;
  style_type: string | null;
}

/** Raw Ideogram API response shape. */
export interface IdeogramApiResponse {
  created: string;
  data: IdeogramImage[];
}

/** Normalized success response our proxy returns to the frontend. */
export interface GenerateResponse {
  created: string;
  images: IdeogramImage[];
}

/** Normalized error response our proxy returns to the frontend. */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

// ── Local domain model (history, templates) ──────────────────────────────────

export interface HistoryEntry {
  id: string;
  createdAt: number;
  request: GenerateRequest;
  images: IdeogramImage[];
  /** Estimated USD cost we charged this generation against the local budget. */
  estimatedCost: number;
}

export type PromptCategory =
  | "realistic"
  | "anime"
  | "typography"
  | "poster"
  | "cinematic";

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "realistic",
  "anime",
  "typography",
  "poster",
  "cinematic",
];

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  category: PromptCategory;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}
