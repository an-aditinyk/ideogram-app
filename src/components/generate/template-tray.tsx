"use client";

/**
 * Draggable strip of saved prompt templates shown above the studio form.
 * Drag a chip onto the prompt textarea (or click it) to load the template.
 * Favorites are listed first.
 */
import { GripVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { useTemplatesStore } from "@/store/templates-store";
import { useDraftStore } from "@/store/draft-store";
import { useMounted } from "@/hooks/use-mounted";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PromptTemplate } from "@/types/ideogram";

export function TemplateTray() {
  const mounted = useMounted();
  const templates = useTemplatesStore((s) => s.templates);
  const loadDraft = useDraftStore((s) => s.loadDraft);

  if (!mounted || templates.length === 0) return null;

  const ordered = [...templates].sort(
    (a, b) => Number(b.favorite) - Number(a.favorite),
  );

  const onDragStart = (e: React.DragEvent, tpl: PromptTemplate) => {
    e.dataTransfer.setData(
      "application/x-ideogram-template",
      JSON.stringify({ prompt: tpl.prompt, negativePrompt: tpl.negativePrompt }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const onClick = (tpl: PromptTemplate) => {
    loadDraft({ prompt: tpl.prompt, negativePrompt: tpl.negativePrompt ?? "" });
    toast.success(`Loaded "${tpl.title}".`);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Templates · drag onto the prompt or click to load
      </p>
      <div className="scroll-thin flex gap-2 overflow-x-auto pb-1">
        {ordered.map((tpl) => (
          <button
            key={tpl.id}
            draggable
            onDragStart={(e) => onDragStart(e, tpl)}
            onClick={() => onClick(tpl)}
            className={cn(
              "group flex shrink-0 cursor-grab items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-left text-sm backdrop-blur transition-colors hover:border-primary/50 active:cursor-grabbing",
            )}
          >
            <GripVertical className="size-3.5 text-muted-foreground" />
            <span className="max-w-[12rem] truncate font-medium">{tpl.title}</span>
            {tpl.favorite ? (
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
            ) : null}
            <Badge variant="muted" className="hidden sm:inline-flex">
              {tpl.category}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
