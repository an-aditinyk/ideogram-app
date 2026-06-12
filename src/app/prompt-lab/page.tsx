"use client";

/**
 * Prompt Lab — manage reusable prompt templates: create, edit, delete,
 * favorite, filter by category, and send a template straight to the studio.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Send, Star, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  PROMPT_CATEGORIES,
  type PromptCategory,
  type PromptTemplate,
} from "@/types/ideogram";
import {
  useTemplatesStore,
  type TemplateDraft,
} from "@/store/templates-store";
import { useDraftStore } from "@/store/draft-store";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

import { AppShell } from "@/components/layout/app-shell";
import { TemplateDialog } from "@/components/prompt-lab/template-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Filter = "all" | "favorites" | PromptCategory;

export default function PromptLabPage() {
  const mounted = useMounted();
  const router = useRouter();
  const templates = useTemplatesStore((s) => s.templates);
  const addTemplate = useTemplatesStore((s) => s.addTemplate);
  const updateTemplate = useTemplatesStore((s) => s.updateTemplate);
  const removeTemplate = useTemplatesStore((s) => s.removeTemplate);
  const toggleFavorite = useTemplatesStore((s) => s.toggleFavorite);
  const loadDraft = useDraftStore((s) => s.loadDraft);

  const [filter, setFilter] = React.useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PromptTemplate | null>(null);

  const visible = (mounted ? templates : []).filter((t) => {
    if (filter === "all") return true;
    if (filter === "favorites") return t.favorite;
    return t.category === filter;
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (tpl: PromptTemplate) => {
    setEditing(tpl);
    setDialogOpen(true);
  };

  const handleSubmit = (draft: TemplateDraft) => {
    if (editing) {
      updateTemplate(editing.id, draft);
      toast.success("Template updated.");
    } else {
      addTemplate(draft);
      toast.success("Template created.");
    }
  };

  const sendToStudio = (tpl: PromptTemplate) => {
    loadDraft({ prompt: tpl.prompt, negativePrompt: tpl.negativePrompt ?? "" });
    router.push("/");
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "favorites", label: "★ Favorites" },
    ...PROMPT_CATEGORIES.map((c) => ({ key: c, label: cap(c) })),
  ];

  return (
    <AppShell
      title="Prompt Lab"
      description="Save, organize, and reuse your best prompts."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="scroll-thin flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
                filter === f.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button variant="gradient" onClick={openCreate}>
          <Plus className="size-4" /> New template
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-20 text-center text-sm text-muted-foreground">
          No templates here yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{tpl.title}</CardTitle>
                  <button
                    onClick={() => toggleFavorite(tpl.id)}
                    aria-label="Toggle favorite"
                    className="shrink-0"
                  >
                    <Star
                      className={cn(
                        "size-4 transition-colors",
                        tpl.favorite
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground hover:text-amber-400",
                      )}
                    />
                  </button>
                </div>
                <Badge variant="default" className="w-fit capitalize">
                  {tpl.category}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {tpl.prompt}
                </p>
                {tpl.tags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="size-3 text-muted-foreground" />
                    {tpl.tags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="gradient"
                    className="flex-1"
                    onClick={() => sendToStudio(tpl)}
                  >
                    <Send className="size-3.5" /> Use
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-8"
                    aria-label="Edit"
                    onClick={() => openEdit(tpl)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-8"
                    aria-label="Delete"
                    onClick={() => {
                      removeTemplate(tpl.id);
                      toast.success("Template deleted.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editing}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
