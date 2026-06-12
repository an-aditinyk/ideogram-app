/**
 * Backend proxy: User → Frontend → THIS route → Ideogram API.
 *
 * The frontend never talks to Ideogram directly and never sees the API key.
 * This route:
 *   1. Reads the secret key from the server-only `IDEOGRAM_API_KEY` env var.
 *   2. Validates the incoming JSON payload with the shared Zod schema.
 *   3. Builds the multipart/form-data body Ideogram v3 expects.
 *   4. Forwards the request with the `Api-Key` header.
 *   5. Normalizes both success and error responses to a stable shape.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  IDEOGRAM_BASE_URL,
  IDEOGRAM_GENERATE_PATH,
  generateRequestSchema,
} from "@/lib/ideogram";
import type {
  ApiErrorResponse,
  GenerateResponse,
  IdeogramApiResponse,
} from "@/types/ideogram";

// Image generation can take a while; opt out of caching and run on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorResponse(code: string, message: string, status: number) {
  const body: ApiErrorResponse = { error: { code, message, status } };
  return NextResponse.json(body, { status });
}

/** Map an upstream Ideogram HTTP status to a friendly, actionable message. */
function describeUpstreamError(status: number, raw: string): string {
  switch (status) {
    case 400:
      return "Invalid request payload. Check your prompt and settings.";
    case 401:
    case 403:
      return "Invalid or unauthorized API key. Verify IDEOGRAM_API_KEY.";
    case 402:
      return "Insufficient credits. Top up your Ideogram balance to continue.";
    case 422:
      return "The request failed a safety/content check and was rejected.";
    case 429:
      return "Rate limit exceeded. Please wait a moment and try again.";
    default:
      if (status >= 500) return "Ideogram is temporarily unavailable. Try again shortly.";
      return raw?.slice(0, 300) || "Unexpected error from Ideogram.";
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "MISSING_API_KEY",
      "Server is missing IDEOGRAM_API_KEY. Add it to .env.local and restart.",
      500,
    );
  }

  // 1. Parse JSON body.
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  // 2. Validate against the shared schema.
  const parsed = generateRequestSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return errorResponse(
      "INVALID_PAYLOAD",
      first ? `${first.path.join(".")}: ${first.message}` : "Invalid payload.",
      400,
    );
  }
  const input = parsed.data;

  // 3. Build the multipart/form-data body Ideogram v3 requires.
  const form = new FormData();
  form.append("prompt", input.prompt);
  if (input.negativePrompt) form.append("negative_prompt", input.negativePrompt);

  // `resolution` and `aspect_ratio` are mutually exclusive on the API.
  if (input.resolution && input.resolution !== "AUTO") {
    form.append("resolution", input.resolution);
  } else {
    form.append("aspect_ratio", input.aspectRatio);
  }

  form.append("rendering_speed", input.renderingSpeed);
  form.append("magic_prompt", input.magicPrompt);
  if (input.styleType && input.styleType !== "AUTO") {
    form.append("style_type", input.styleType);
  }
  form.append("num_images", String(input.numImages));
  if (typeof input.seed === "number") form.append("seed", String(input.seed));

  // Ideogram treats "PRIVATE" visibility via the X-Generation-Visibility header.
  const visibility = input.isPrivate ? "private" : "public";

  // 4. Forward to Ideogram with the secret key. (fetch handles multipart boundary.)
  let upstream: Response;
  try {
    upstream = await fetch(`${IDEOGRAM_BASE_URL}${IDEOGRAM_GENERATE_PATH}`, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "X-Generation-Visibility": visibility,
      },
      body: form,
    });
  } catch {
    return errorResponse(
      "NETWORK_ERROR",
      "Could not reach Ideogram. Check your network connection.",
      502,
    );
  }

  const rawText = await upstream.text();

  if (!upstream.ok) {
    return errorResponse(
      `UPSTREAM_${upstream.status}`,
      describeUpstreamError(upstream.status, rawText),
      upstream.status,
    );
  }

  // 5. Normalize the success response.
  let data: IdeogramApiResponse;
  try {
    data = JSON.parse(rawText) as IdeogramApiResponse;
  } catch {
    return errorResponse(
      "INVALID_UPSTREAM_RESPONSE",
      "Ideogram returned an unexpected response format.",
      502,
    );
  }

  const result: GenerateResponse = {
    created: data.created ?? new Date().toISOString(),
    images: Array.isArray(data.data) ? data.data : [],
  };

  return NextResponse.json(result, { status: 200 });
}
