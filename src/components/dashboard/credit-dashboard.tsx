"use client";

/**
 * Credit / usage dashboard. Ideogram has no public balance endpoint, so this
 * estimates spend locally from history (count × configured per-image cost) and
 * compares it to the optional budget from NEXT_PUBLIC_CREDIT_BUDGET_USD.
 */
import { Coins, ImageIcon, Layers, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHistoryStore } from "@/store/history-store";
import { useMounted } from "@/hooks/use-mounted";
import { CREDIT_BUDGET_USD, COST_PER_IMAGE_USD } from "@/lib/credits";
import { formatUsd } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  );
}

export function CreditDashboard() {
  const mounted = useMounted();
  const entries = useHistoryStore((s) => s.entries);

  // Avoid hydration mismatch: render zeros until the persisted store is read.
  const totalImages = mounted
    ? entries.reduce((sum, e) => sum + e.images.length, 0)
    : 0;
  const totalGenerations = mounted ? entries.length : 0;
  const totalCost = mounted
    ? entries.reduce((sum, e) => sum + e.estimatedCost, 0)
    : 0;
  const remaining =
    CREDIT_BUDGET_USD > 0 ? Math.max(0, CREDIT_BUDGET_USD - totalCost) : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={ImageIcon}
        label="Images generated"
        value={String(totalImages)}
        hint={`${totalGenerations} generation${totalGenerations === 1 ? "" : "s"}`}
      />
      <StatCard
        icon={Coins}
        label="Estimated spent"
        value={formatUsd(totalCost)}
        hint={`@ ${formatUsd(COST_PER_IMAGE_USD)}/image`}
      />
      <StatCard
        icon={Wallet}
        label="Estimated remaining"
        value={remaining === null ? "—" : formatUsd(remaining)}
        hint={
          remaining === null
            ? "Set NEXT_PUBLIC_CREDIT_BUDGET_USD"
            : `of ${formatUsd(CREDIT_BUDGET_USD)} budget`
        }
      />
      <StatCard
        icon={Layers}
        label="Avg / generation"
        value={
          totalGenerations > 0
            ? (totalImages / totalGenerations).toFixed(1)
            : "0"
        }
        hint="images per request"
      />
    </div>
  );
}
