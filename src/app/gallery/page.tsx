"use client";

/**
 * Gallery — full generation history in a masonry grid, with reuse (sends the
 * prompt back to the studio), regenerate, per-image delete, and clear-all.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { HistoryEntry } from "@/types/ideogram";
import { useHistoryStore } from "@/store/history-store";
import { useDraftStore } from "@/store/draft-store";
import { useGeneration } from "@/hooks/use-generation";
import { useMounted } from "@/hooks/use-mounted";

import { AppShell } from "@/components/layout/app-shell";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function GalleryPage() {
  const mounted = useMounted();
  const router = useRouter();
  const entries = useHistoryStore((s) => s.entries);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const clear = useHistoryStore((s) => s.clear);
  const loadDraft = useDraftStore((s) => s.loadDraft);
  const { generate } = useGeneration();

  const handleReuse = (entry: HistoryEntry) => {
    loadDraft(entry.request);
    router.push("/");
  };

  const handleRegenerate = (entry: HistoryEntry) => {
    void generate({ ...entry.request, seed: undefined });
  };

  const count = mounted ? entries.length : 0;

  return (
    <AppShell title="Gallery" description="Everything you've generated, saved locally.">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} generation{count === 1 ? "" : "s"} in local history
        </p>

        {count > 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="size-4" /> Clear history
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Clear all history?</DialogTitle>
                <DialogDescription>
                  This removes all generations from this device. Images already
                  downloaded are unaffected. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clear();
                      toast.success("History cleared.");
                    }}
                  >
                    Clear everything
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <GalleryGrid
        entries={mounted ? entries : []}
        onReuse={handleReuse}
        onRegenerate={handleRegenerate}
        onDelete={removeEntry}
        emptyHint="No images yet. Head to the Studio to create your first generation."
      />
    </AppShell>
  );
}
