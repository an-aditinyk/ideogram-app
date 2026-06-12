/**
 * Local credit estimation. Ideogram does not currently expose a public
 * balance/usage endpoint, so we estimate cost on-device from a configurable
 * per-image price and the number of images generated.
 */

export const COST_PER_IMAGE_USD = Number(
  process.env.NEXT_PUBLIC_COST_PER_IMAGE_USD ?? "0.08",
);

export const CREDIT_BUDGET_USD = Number(
  process.env.NEXT_PUBLIC_CREDIT_BUDGET_USD ?? "0",
);

/** Estimated cost for generating `count` images. */
export function estimateCost(count: number): number {
  const perImage = Number.isFinite(COST_PER_IMAGE_USD) ? COST_PER_IMAGE_USD : 0.08;
  return Math.max(0, count) * perImage;
}
