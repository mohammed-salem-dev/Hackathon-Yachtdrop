import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchLiveInventory } from "@/lib/scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Groq (OpenAI-compatible)
const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// How many products we send as context — keeps token cost low
const CATALOGUE_CONTEXT_LIMIT = 80;

if (!GROQ_API_KEY) {
  // Fail fast with a clear message in server logs
  console.error("[ai-match] Missing GROQ_API_KEY in environment.");
}

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GROQ_API_KEY." },
        { status: 500 },
      );
    }

    const { problem } = await req.json();

    if (!problem || typeof problem !== "string" || problem.trim().length < 3) {
      return NextResponse.json(
        { error: "Please describe your problem or what you need." },
        { status: 400 },
      );
    }

    // Pull live inventory (uses cache — fast in practice)
    const inventory = await fetchLiveInventory();

    // Build a compact catalogue snapshot for the prompt
    const catalogueSnapshot = inventory
      .slice(0, CATALOGUE_CONTEXT_LIMIT)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description?.slice(0, 80) ?? "",
      }));

    const catalogueText = catalogueSnapshot
      .map((p) => `- [${p.id}] ${p.name} (${p.category}): ${p.description}`)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 200,
      // Groq supports JSON mode via response_format
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a marine parts assistant helping yacht crew find the right products. " +
            "Given a user's problem description and a product catalogue, " +
            'return the 3 most relevant product IDs as a JSON object: { "matches": ["id1", "id2", "id3"] }. ' +
            "Only return IDs that exist in the catalogue. " +
            "If fewer than 3 are relevant, return only the relevant ones.",
        },
        {
          role: "user",
          content: `Problem: "${problem.trim()}"\n\nAvailable products:\n${catalogueText}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let matchedIds: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      matchedIds = Array.isArray(parsed.matches) ? parsed.matches : [];
    } catch {
      matchedIds = [];
    }

    // Hydrate full product objects from matched IDs
    const matchedProducts = matchedIds
      .map((id) => inventory.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({ matches: matchedProducts });
  } catch (err: any) {
    console.error("[ai-match] Error:", err);

    // Groq/OpenAI-compatible errors often include status + code
    const status = err?.status ?? 500;
    const code = err?.code ?? err?.error?.code;

    const isInsufficientQuota = status === 429 && code === "insufficient_quota";
    const isRateLimit = status === 429 && !isInsufficientQuota;

    return NextResponse.json(
      {
        error: isInsufficientQuota
          ? "Groq quota/billing issue for this API key."
          : isRateLimit
            ? "Rate limited. Please wait a moment and try again."
            : "AI matching unavailable right now.",
        requestId: err?.requestID,
      },
      { status },
    );
  }
}
