"use client";

/**
 * Create/edit dialog for a prompt template, validated with react-hook-form +
 * zod. Used by the Prompt Lab page.
 */
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  PROMPT_CATEGORIES,
  type PromptCategory,
  type PromptTemplate,
} from "@/types/ideogram";
import type { TemplateDraft } from "@/store/templates-store";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const templateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
  prompt: z.string().trim().min(1, "Prompt is required").max(2000),
  negativePrompt: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.enum(["realistic", "anime", "typography", "poster", "cinematic"]),
  tagsRaw: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this template; otherwise it creates one. */
  template?: PromptTemplate | null;
  onSubmit: (draft: TemplateDraft) => void;
}

export function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: TemplateDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: "",
      prompt: "",
      negativePrompt: "",
      category: "realistic",
      tagsRaw: "",
    },
  });

  // Populate the form whenever the dialog opens or the target template changes.
  React.useEffect(() => {
    if (!open) return;
    reset({
      title: template?.title ?? "",
      prompt: template?.prompt ?? "",
      negativePrompt: template?.negativePrompt ?? "",
      category: template?.category ?? "realistic",
      tagsRaw: template?.tags.join(", ") ?? "",
    });
  }, [open, template, reset]);

  const category = watch("category");

  const submit = handleSubmit((data) => {
    const tags = (data.tagsRaw ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({
      title: data.title.trim(),
      prompt: data.prompt.trim(),
      negativePrompt: data.negativePrompt?.trim() || undefined,
      category: data.category,
      tags,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            Save reusable prompts and organize them by category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" placeholder="Golden-hour portrait" {...register("title")} />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-prompt">Prompt</Label>
            <Textarea id="t-prompt" rows={4} {...register("prompt")} />
            {errors.prompt ? (
              <p className="text-xs text-destructive">{errors.prompt.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-neg">Negative prompt (optional)</Label>
            <Textarea id="t-neg" rows={2} {...register("negativePrompt")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setValue("category", v as PromptCategory, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-tags">Tags (comma-separated)</Label>
              <Input id="t-tags" placeholder="portrait, photography" {...register("tagsRaw")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              {template ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
