"use client";

/**
 * Studio — the main generation page. Composes the credit dashboard, the
 * template tray, the prompt panel, and a live results gallery wired to the
 * generation hook and persisted history.
 */
import * as React from "react";
import type { GenerateRequest, HistoryEntry } from "@/types/ideogram";
import { useGeneration } from "@/hooks/use-generation";
import { useHistoryStore } from "@/store/history-store";
import { useDraftStore } from "@/store/draft-store";
import { useMounted } from "@/hooks/use-mounted";

import { AppShell } from "@/components/layout/app-shell";
import { CreditDashboard } from "@/components/dashboard/credit-dashboard";
import { PromptPanel } from "@/components/generate/prompt-panel";
import { TemplateTray } from "@/components/generate/template-tray";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function StudioPage() {
  const mounted = useMounted();
  const { generate, isGenerating } = useGeneration();
  const entries = useHistoryStore((s) => s.entries);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const loadDraft = useDraftStore((s) => s.loadDraft);

  const recent = mounted ? entries.slice(0, 12) : [];

  const handleReuse = React.useCallback(
    (entry: HistoryEntry) => loadDraft(entry.request),
    [loadDraft],
  );

  const handleRegenerate = React.useCallback(
    (entry: HistoryEntry) => {
      // Re-run with a fresh seed so the output differs.
      const request: GenerateRequest = { ...entry.request, seed: undefined };
      void generate(request);
    },
    [generate],
  );

  return (
    <AppShell
      title="Studio"
      description="Craft prompts, tune settings, and generate with Ideogram."
    >
      <div className="space-y-6">
        <CreditDashboard />

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left: controls */}
          <div className="space-y-4">
            <TemplateTray />
            <PromptPanel onGenerate={generate} isGenerating={isGenerating} />
          </div>

          {/* Right: results */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Recent results
              </h2>
            </div>
            <GalleryGrid
              entries={recent}
              onReuse={handleReuse}
              onRegenerate={handleRegenerate}
              onDelete={removeEntry}
              emptyHint="No generations yet — write a prompt and hit Generate."
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
