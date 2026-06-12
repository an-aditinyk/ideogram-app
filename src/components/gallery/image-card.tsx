"use client";

/**
 * A single generated image with hover actions: download, copy prompt,
 * regenerate, and delete. Shows the prompt and key settings used.
 */
import Image from "next/image";
import * as React from "react";
import { Copy, Download, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { HistoryEntry, IdeogramImage } from "@/types/ideogram";
import { copyToClipboard, downloadImage } from "@/lib/download";
import { formatTimestamp } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageCardProps {
  entry: HistoryEntry;
  image: IdeogramImage;
  onReuse: (entry: HistoryEntry) => void;
  onRegenerate?: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function ImageCard({
  entry,
  image,
  onReuse,
  onRegenerate,
  onDelete,
}: ImageCardProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const { request } = entry;

  const handleDownload = async () => {
    if (!image.url) return;
    setDownloading(true);
    try {
      await downloadImage(image.url, image.prompt || request.prompt, image.seed);
      toast.success("Download started.");
    } catch {
      toast.error("Could not download this image.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(image.prompt || request.prompt);
      toast.success("Prompt copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  };

  return (
    <figure className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm">
      <div className="relative w-full bg-muted/40">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 to-muted/10" />
        )}
        {image.url ? (
          // unoptimized: Ideogram URLs are ephemeral; skip Next image caching.
          <Image
            src={image.url}
            alt={image.prompt || request.prompt}
            width={1024}
            height={1024}
            unoptimized
            onLoad={() => setLoaded(true)}
            className="h-auto w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}

        {/* Hover overlay actions */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/30 p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex justify-end gap-1.5">
            <IconAction
              label="Download"
              onClick={handleDownload}
              disabled={downloading || !image.url}
            >
              <Download className="size-4" />
            </IconAction>
            <IconAction label="Copy prompt" onClick={handleCopy}>
              <Copy className="size-4" />
            </IconAction>
            {onRegenerate ? (
              <IconAction
                label="Regenerate"
                onClick={() => onRegenerate(entry)}
              >
                <RefreshCw className="size-4" />
              </IconAction>
            ) : null}
            <IconAction
              label="Delete from history"
              destructive
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="size-4" />
            </IconAction>
          </div>
        </div>
      </div>

      {/* Meta */}
      <figcaption className="space-y-2 p-3">
        <p className="line-clamp-2 text-sm text-foreground/90">
          {image.prompt || request.prompt}
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="muted">{request.styleType}</Badge>
          <Badge variant="muted">
            {request.resolution !== "AUTO" ? request.resolution : request.aspectRatio}
          </Badge>
          <Badge variant="muted">seed {image.seed}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTimestamp(entry.createdAt)}</span>
          <button
            onClick={() => onReuse(entry)}
            className="font-medium text-primary hover:underline"
          >
            Reuse prompt
          </button>
        </div>
      </figcaption>
    </figure>
  );
}

function IconAction({
  label,
  children,
  onClick,
  disabled,
  destructive,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant={destructive ? "destructive" : "secondary"}
          className="pointer-events-auto size-8 backdrop-blur"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
