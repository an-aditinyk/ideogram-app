# Ideogram Studio

A premium, production-ready frontend for the **Ideogram image generation API**, with a secure
server-side proxy so your API key is **never exposed to the browser**.

Built with **Next.js 14 (App Router)**, **TypeScript (strict)**, **Tailwind CSS**, **shadcn-style UI**,
**Zustand**, **Axios**, **React Hook Form**, and **Zod**.

> Flow: **User → Frontend → Next.js backend (`/api/generate`) → Ideogram API**
> The frontend never calls Ideogram directly.

---

## ✨ Features

- **Studio** — full prompt panel: prompt, negative prompt, style preset, aspect ratio,
  resolution, number of images, optional seed (with randomizer), Magic Prompt option,
  private-generation toggle.
- **Generate** with validation, loading state, progress animation, and a
  **⌘/Ctrl + Enter** keyboard shortcut.
- **Gallery** — masonry grid with timestamp, prompt, and settings per image; per-image
  **Download**, **Copy prompt**, **Regenerate**, and **Delete**.
- **History persistence** — everything saved to `localStorage` (prompt, image URLs,
  parameters, date).
- **Credit tracking dashboard** — images generated, estimated spend, estimated remaining
  (Ideogram exposes no public balance endpoint, so spend is estimated locally — see below).
- **Prompt Lab** — save / edit / delete prompt **templates**, organize by category
  (realistic, anime, typography, poster, cinematic), add **tags**, and mark **favorites**.
- **Advanced UX** — dark mode, responsive mobile layout, **drag-and-drop** templates onto the
  prompt, favorite prompts, prompt tagging.
- **Robust error handling** — insufficient credits, rate limits, invalid API key, invalid
  payload, and network failures all surface as toast notifications.
- **Premium UI** — glassmorphism, aurora backdrop, smooth animations (Midjourney / Leonardo /
  Ideogram vibe).

---

## 🧱 Tech Stack

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Framework      | Next.js 14 (App Router)             |
| Language       | TypeScript (strict)                 |
| Styling        | Tailwind CSS + shadcn-style UI      |
| State          | Zustand (with `persist` middleware) |
| HTTP (client)  | Axios                               |
| Forms          | React Hook Form                     |
| Validation     | Zod (shared client + server schema) |
| Toasts         | Sonner                              |
| Icons          | lucide-react                        |
| Theme          | next-themes                         |

---

## 📁 Folder structure

```
ideogram-app/
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts   # Secure backend proxy to Ideogram
│   │   ├── gallery/page.tsx        # Full history gallery
│   │   ├── prompt-lab/page.tsx     # Prompt template manager
│   │   ├── layout.tsx              # Root layout (theme, toaster, tooltips)
│   │   ├── page.tsx                # Studio (main generation page)
│   │   └── globals.css             # Tailwind + design tokens + glass styles
│   ├── components/
│   │   ├── ui/                     # shadcn-style primitives (button, card, select…)
│   │   ├── layout/                 # app shell, sidebar, header, theme toggle
│   │   ├── generate/               # prompt panel, template tray
│   │   ├── gallery/                # gallery grid, image card
│   │   ├── dashboard/              # credit dashboard
│   │   ├── prompt-lab/             # template dialog
│   │   └── providers/              # theme provider
│   ├── hooks/                      # use-generation, use-keyboard-shortcut, use-mounted
│   ├── lib/                        # ideogram constants + zod schema, credits, download, utils
│   ├── store/                      # zustand: history, settings, templates, draft
│   └── types/                      # shared TypeScript types
├── .env.example
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Installation & local run

> Requires **Node 18.17+** (Node 20 recommended).

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.example .env.local
#   then edit .env.local and set IDEOGRAM_API_KEY=...

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Getting an API key

1. Go to <https://ideogram.ai/manage-api>.
2. Accept the Developer API agreement and add payment / credits.
3. Create an API key — **it is shown only once**, copy it immediately.
4. Paste it into `.env.local` as `IDEOGRAM_API_KEY`.

---

## 🔐 Environment variables

See [`.env.example`](./.env.example). Summary:

| Variable                          | Required | Scope  | Purpose                                                              |
| --------------------------------- | -------- | ------ | ------------------------------------------------------------------- |
| `IDEOGRAM_API_KEY`                | ✅       | server | Your secret Ideogram key. Read **only** in `/api/generate`.         |
| `IDEOGRAM_API_BASE_URL`           | ❌       | server | Override the Ideogram base URL (defaults to official endpoint).     |
| `NEXT_PUBLIC_COST_PER_IMAGE_USD`  | ❌       | client | Per-image cost used for local credit estimates (default `0.08`).    |
| `NEXT_PUBLIC_CREDIT_BUDGET_USD`   | ❌       | client | Your purchased budget, for the "remaining" estimate (default `0`).  |

**Security:** `IDEOGRAM_API_KEY` has no `NEXT_PUBLIC_` prefix, so Next.js never bundles it into
the client. It is read at runtime on the server only.

---

## 🔌 API contract

### Backend route — `POST /api/generate`

The frontend sends **JSON** to our own route, which validates it with the shared Zod schema,
converts it to the **`multipart/form-data`** body that Ideogram v3 expects, attaches the
`Api-Key` header, and forwards to:

```
POST https://api.ideogram.ai/v1/ideogram-v3/generate
```

**Request body (JSON to our proxy):**

```jsonc
{
  "prompt": "A serene mountain landscape at dawn",
  "negativePrompt": "blurry, low quality",      // optional
  "aspectRatio": "16x9",                          // 1x1 | 16x9 | 9x16 | 4x3 | 3x4 | …
  "resolution": "AUTO",                           // AUTO or e.g. "1024x1024"
  "styleType": "REALISTIC",                       // AUTO | GENERAL | REALISTIC | DESIGN | FICTION
  "renderingSpeed": "DEFAULT",                    // TURBO | DEFAULT | QUALITY
  "magicPrompt": "AUTO",                          // AUTO | ON | OFF
  "numImages": 2,                                  // 1–8
  "seed": 12345,                                   // optional
  "isPrivate": false
}
```

**Normalized success response:**

```jsonc
{
  "created": "2026-06-12T10:00:00Z",
  "images": [
    {
      "url": "https://…",
      "prompt": "…",
      "resolution": "1344x768",
      "is_image_safe": true,
      "seed": 12345,
      "style_type": "REALISTIC"
    }
  ]
}
```

**Normalized error response:**

```jsonc
{ "error": { "code": "UPSTREAM_429", "message": "Rate limit exceeded…", "status": 429 } }
```

> ℹ️ **Schema note:** Ideogram updates its API over time. All request/enum values live in
> [`src/lib/ideogram.ts`](./src/lib/ideogram.ts) and [`src/types/ideogram.ts`](./src/types/ideogram.ts).
> If Ideogram changes a field, update those two files — the client form and server proxy both
> derive from them.

---

## 💳 A note on credit tracking

Ideogram does **not** currently expose a public balance/usage endpoint. This app therefore
**estimates** spend locally: `images generated × NEXT_PUBLIC_COST_PER_IMAGE_USD`, compared
against `NEXT_PUBLIC_CREDIT_BUDGET_USD`. Adjust the per-image price to match your plan and
rendering speed. If/when Ideogram ships a usage endpoint, wire it into the dashboard in
[`src/components/dashboard/credit-dashboard.tsx`](./src/components/dashboard/credit-dashboard.tsx).

---

## 🧪 Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit (strict)
```

---

## ☁️ Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide. Short version:

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new>.
3. Add the env var **`IDEOGRAM_API_KEY`** (and optionally the `NEXT_PUBLIC_*` ones) in
   **Project → Settings → Environment Variables**.
4. Deploy. Vercel auto-detects Next.js — no extra config needed.

---

## 🛡️ Security checklist

- ✅ API key stored in `.env.local` (git-ignored), read only on the server.
- ✅ Frontend talks only to `/api/generate`; it never sees the key or calls Ideogram directly.
- ✅ Payload validated with Zod on the server before forwarding.
- ✅ No secrets hardcoded anywhere in the codebase.

## License

MIT — use freely.
