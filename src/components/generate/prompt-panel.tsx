"use client";

/**
 * PromptPanel — the full generation form. Built on react-hook-form + zod
 * (shared schema with the backend). Persists non-prompt settings to the
 * settings store, accepts external drafts (reuse/templates), supports
 * drag-and-drop of prompt templates, and triggers generation on submit or
 * Ctrl/Cmd+Enter.
 */
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dice5, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import {
  generateRequestSchema,
  type GenerateRequestInput,
  DEFAULT_GENERATE_REQUEST,
  ASPECT_RATIO_OPTIONS,
  RESOLUTION_OPTIONS,
  STYLE_TYPE_OPTIONS,
  RENDERING_SPEED_OPTIONS,
  MAGIC_PROMPT_OPTIONS_META,
} from "@/lib/ideogram";
import type { GenerateRequest } from "@/types/ideogram";
import { useSettingsStore } from "@/store/settings-store";
import { useDraftStore } from "@/store/draft-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useMounted } from "@/hooks/use-mounted";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptPanelProps {
  onGenerate: (request: GenerateRequest) => void;
  isGenerating: boolean;
}

export function PromptPanel({ onGenerate, isGenerating }: PromptPanelProps) {
  const mounted = useMounted();
  const persistedSettings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const draft = useDraftStore((s) => s.draft);
  const draftVersion = useDraftStore((s) => s.version);

  const [isDragOver, setIsDragOver] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GenerateRequestInput>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: { ...DEFAULT_GENERATE_REQUEST, ...persistedSettings },
  });

  // Hydrate persisted settings once the client store is available.
  React.useEffect(() => {
    if (mounted) reset({ ...DEFAULT_GENERATE_REQUEST, ...persistedSettings });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Apply an external draft (gallery reuse / template) whenever it changes.
  React.useEffect(() => {
    if (!draft) return;
    Object.entries(draft).forEach(([key, value]) => {
      setValue(key as keyof GenerateRequestInput, value as never, {
        shouldValidate: true,
      });
    });
    toast.message("Prompt loaded into the studio.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftVersion]);

  const numImages = watch("numImages");
  const prompt = watch("prompt");

  const submit = handleSubmit((data) => {
    // Persist non-prompt settings for next session.
    const { prompt: _p, negativePrompt: _n, seed: _s, ...rest } = data;
    setSettings(rest);
    onGenerate(normalize(data));
  });

  // Ctrl/Cmd + Enter triggers generation from anywhere.
  useKeyboardShortcut(() => {
    if (!isGenerating) void submit();
  });

  const randomizeSeed = () =>
    setValue("seed", Math.floor(Math.random() * 2_147_483_647), {
      shouldValidate: true,
    });

  // ── Drag-and-drop prompt templates (payload set by TemplateTray) ──────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData("application/x-ideogram-template");
    if (!raw) return;
    try {
      const tpl = JSON.parse(raw) as { prompt: string; negativePrompt?: string };
      setValue("prompt", tpl.prompt, { shouldValidate: true });
      if (tpl.negativePrompt) setValue("negativePrompt", tpl.negativePrompt);
      toast.success("Template dropped into the prompt.");
    } catch {
      /* ignore malformed payloads */
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" /> Create
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">Prompt</Label>
              {prompt ? (
                <button
                  type="button"
                  onClick={() => setValue("prompt", "", { shouldValidate: true })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <Textarea
              id="prompt"
              rows={4}
              placeholder="A serene mountain landscape at dawn, cinematic lighting…"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={isDragOver ? "ring-2 ring-primary" : undefined}
              {...register("prompt")}
            />
            {errors.prompt ? (
              <p className="text-xs text-destructive">{errors.prompt.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tip: drag a template here, or press ⌘/Ctrl+Enter to generate.
              </p>
            )}
          </div>

          {/* Negative prompt */}
          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative prompt</Label>
            <Textarea
              id="negativePrompt"
              rows={2}
              placeholder="blurry, low quality, distorted, watermark…"
              {...register("negativePrompt")}
            />
          </div>

          {/* Style + Aspect ratio */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Style"
              control={control}
              name="styleType"
              options={STYLE_TYPE_OPTIONS}
            />
            <SelectField
              label="Aspect ratio"
              control={control}
              name="aspectRatio"
              options={ASPECT_RATIO_OPTIONS}
            />
          </div>

          {/* Resolution + Rendering speed */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Resolution"
              control={control}
              name="resolution"
              options={RESOLUTION_OPTIONS}
            />
            <SelectField
              label="Rendering speed"
              control={control}
              name="renderingSpeed"
              options={RENDERING_SPEED_OPTIONS}
            />
          </div>

          {/* Number of images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Number of images</Label>
              <span className="text-sm font-medium text-primary">{numImages}</span>
            </div>
            <Controller
              control={control}
              name="numImages"
              render={({ field }) => (
                <Slider
                  min={1}
                  max={8}
                  step={1}
                  value={[field.value]}
                  onValueChange={(v) => field.onChange(v[0])}
                />
              )}
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (optional)</Label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="seed"
                render={({ field }) => (
                  <Input
                    id="seed"
                    type="number"
                    inputMode="numeric"
                    placeholder="Random"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={randomizeSeed}
                aria-label="Randomize seed"
              >
                <Dice5 className="size-4" />
              </Button>
            </div>
            {errors.seed ? (
              <p className="text-xs text-destructive">{errors.seed.message}</p>
            ) : null}
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
            <ToggleRow
              label="Magic Prompt"
              description="Let Ideogram enhance your prompt automatically."
            >
              <Controller
                control={control}
                name="magicPrompt"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAGIC_PROMPT_OPTIONS_META.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </ToggleRow>
            <ToggleRow
              label="Private generation"
              description="Keep this generation private to your account."
            >
              <Controller
                control={control}
                name="isPrivate"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </ToggleRow>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Generate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** Convert the validated form input into the proxy request payload. */
function normalize(data: GenerateRequestInput): GenerateRequest {
  return {
    prompt: data.prompt.trim(),
    negativePrompt: data.negativePrompt?.trim() || undefined,
    aspectRatio: data.aspectRatio,
    resolution: data.resolution,
    styleType: data.styleType,
    renderingSpeed: data.renderingSpeed,
    magicPrompt: data.magicPrompt,
    numImages: data.numImages,
    seed: data.seed,
    isPrivate: data.isPrivate,
  };
}

// ── Small presentational helpers ─────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SelectField<Name extends keyof GenerateRequestInput>({
  label,
  control,
  name,
  options,
}: {
  label: string;
  control: ReturnType<typeof useForm<GenerateRequestInput>>["control"];
  name: Name;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={String(field.value)} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
