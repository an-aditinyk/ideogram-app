"use client";

/**
 * Masonry gallery of generated images, sourced from persisted history.
 * Renders every image across all history entries; each card carries its own
 * reuse/regenerate/delete actions.
 */
import { ImageOff } from "lucide-react";
import type { HistoryEntry } from "@/types/ideogram";
import { ImageCard } from "@/components/gallery/image-card";
import { useMounted } from "@/hooks/use-mounted";

interface GalleryGridProps {
  entries: HistoryEntry[];
  onReuse: (entry: HistoryEntry) => void;
  onRegenerate?: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  emptyHint?: string;
}

export function GalleryGrid({
  entries,
  onReuse,
  onRegenerate,
  onDelete,
  emptyHint = "Your generated images will appear here.",
}: GalleryGridProps) {
  const mounted = useMounted();

  if (!mounted) {
    // Skeleton to avoid hydration flash while reading persisted history.
    return (
      <div className="masonry columns-1 sm:columns-2 xl:columns-3 2xl:columns-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 h-64 animate-pulse rounded-xl bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
        <ImageOff className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="masonry columns-1 animate-fade-in sm:columns-2 xl:columns-3 2xl:columns-4">
      {entries.flatMap((entry) =>
        entry.images.map((image, idx) => (
          <ImageCard
            key={`${entry.id}-${idx}`}
            entry={entry}
            image={image}
            onReuse={onReuse}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
          />
        )),
      )}
    </div>
  );
}
