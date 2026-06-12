/**
 * Image download helper. Ideogram image URLs are ephemeral, so we proxy the
 * fetch through our own origin where possible and fall back to a direct
 * anchor download. Everything here is client-side only.
 */

function filenameFromPrompt(prompt: string, seed: number): string {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `ideogram-${slug || "image"}-${seed}.png`;
}

export async function downloadImage(
  url: string,
  prompt: string,
  seed: number,
): Promise<void> {
  const filename = filenameFromPrompt(prompt, seed);
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open/download directly (may navigate if CORS blocks blob).
    triggerDownload(url, filename);
  }
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
