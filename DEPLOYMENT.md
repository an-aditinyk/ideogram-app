# Deployment Guide — Vercel

This app is a standard Next.js 14 App Router project and deploys to Vercel with zero extra
configuration. The only required step is setting your **`IDEOGRAM_API_KEY`** environment
variable in Vercel (so the server-side proxy can authenticate to Ideogram).

---

## Prerequisites

- A [Vercel](https://vercel.com) account.
- Your Ideogram API key from <https://ideogram.ai/manage-api>.
- This project pushed to a Git provider (GitHub, GitLab, or Bitbucket), **or** the Vercel CLI.

---

## Option A — Deploy from the Vercel dashboard (recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Ideogram Studio"
   git branch -M main
   git remote add origin https://github.com/<you>/ideogram-app.git
   git push -u origin main
   ```

   > `.env.local` is git-ignored, so your key is **not** committed. Good.

2. **Import the project**
   - Go to <https://vercel.com/new>.
   - Select your repository and click **Import**.
   - Framework preset is auto-detected as **Next.js** — leave Build & Output settings default.

3. **Add environment variables** (Project → **Settings → Environment Variables**)

   | Name                             | Value                         | Environments                     |
   | -------------------------------- | ----------------------------- | -------------------------------- |
   | `IDEOGRAM_API_KEY`               | *your secret key*             | Production, Preview, Development  |
   | `NEXT_PUBLIC_COST_PER_IMAGE_USD` | e.g. `0.08` (optional)        | Production, Preview, Development  |
   | `NEXT_PUBLIC_CREDIT_BUDGET_USD`  | e.g. `5.00` (optional)        | Production, Preview, Development  |

   > Only `IDEOGRAM_API_KEY` is required. Mark it for **all** environments so Preview
   > deployments work too. It is server-only and never shipped to the browser.

4. **Deploy** — click **Deploy**. First build takes ~1–2 minutes. You'll get a
   `https://<project>.vercel.app` URL.

5. **Verify** — open the URL, enter a prompt, and click **Generate**. If you see images, the
   proxy and key are working.

---

## Option B — Deploy with the Vercel CLI

```bash
npm i -g vercel

# from the project root
vercel            # follow prompts to link/create the project (first deploy = Preview)

# add your key (repeat with --environment=preview and development if desired)
vercel env add IDEOGRAM_API_KEY production
# (paste the key when prompted)

vercel --prod     # promote to Production
```

To pull cloud env vars back into a local `.env.local`:

```bash
vercel env pull .env.local
```

---

## Important deployment notes

- **Function timeout.** Image generation can take a while, especially with `QUALITY` rendering
  speed or multiple images. The route declares `maxDuration = 60`. On Vercel **Hobby**, max
  duration is 60s; on **Pro** you can raise it. If you hit timeouts, prefer `TURBO`/`DEFAULT`
  rendering speed or fewer images per request.

- **Runtime.** The route uses `runtime = "nodejs"` (not Edge) because it forwards
  `multipart/form-data` to Ideogram. Keep it on Node.

- **Image domains.** `next.config.mjs` allow-lists Ideogram CDN hostnames for `next/image`.
  Generated `<Image>`s also use `unoptimized` because Ideogram URLs are **ephemeral** — they
  expire, so download images you want to keep. If Ideogram serves images from a new hostname,
  add it to `remotePatterns` in `next.config.mjs`.

- **History is per-device.** Generation history and templates are stored in the browser's
  `localStorage`. They are not synced across devices or users.

---

## Post-deploy checklist

- [ ] `IDEOGRAM_API_KEY` set in Vercel for all environments.
- [ ] A test generation returns images on the deployed URL.
- [ ] (Optional) `NEXT_PUBLIC_CREDIT_BUDGET_USD` set so the dashboard shows "remaining".
- [ ] Custom domain added under Project → **Settings → Domains** (optional).
