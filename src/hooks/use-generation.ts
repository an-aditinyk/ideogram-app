"use client";

/**
 * useGeneration — the single entry point the UI uses to request images.
 * Wraps the axios call to our `/api/generate` proxy, surfaces loading state,
 * writes results to history, and converts proxy errors into toasts.
 */
import { useCallback, useState } from "react";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import type {
  ApiErrorResponse,
  GenerateRequest,
  GenerateResponse,
  HistoryEntry,
} from "@/types/ideogram";
import { useHistoryStore } from "@/store/history-store";

const client = axios.create({ baseURL: "", timeout: 120_000 });

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const addEntry = useHistoryStore((s) => s.addEntry);

  const generate = useCallback(
    async (request: GenerateRequest): Promise<HistoryEntry | null> => {
      setIsGenerating(true);
      const toastId = toast.loading("Generating images…");
      try {
        const { data } = await client.post<GenerateResponse>(
          "/api/generate",
          request,
        );

        const safeImages = data.images.filter((img) => Boolean(img.url));
        if (safeImages.length === 0) {
          toast.error("No images returned (they may have failed a safety check).", {
            id: toastId,
          });
          return null;
        }

        const entry = addEntry(request, safeImages);
        toast.success(
          `Generated ${safeImages.length} image${safeImages.length > 1 ? "s" : ""}.`,
          { id: toastId },
        );
        return entry;
      } catch (err) {
        const message = extractErrorMessage(err);
        toast.error(message, { id: toastId });
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [addEntry],
  );

  return { generate, isGenerating };
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    if (axiosErr.response?.data?.error?.message) {
      return axiosErr.response.data.error.message;
    }
    if (axiosErr.code === "ECONNABORTED") {
      return "The request timed out. Try fewer images or a faster rendering speed.";
    }
    return axiosErr.message || "Network request failed.";
  }
  return "Something went wrong while generating images.";
}
