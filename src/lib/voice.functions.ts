import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DIALECT_INSTRUCTIONS: Record<string, string> = {
  egyptian:
    "Reply in Egyptian Arabic (اللهجة المصرية). Use words like 'ازيك', 'حلو', 'يلا', 'معلش', 'كده'.",
  gulf:
    "Reply in Gulf Arabic (اللهجة الخليجية). Use words like 'شلونك', 'زين', 'وايد', 'عسى', 'يبه'.",
  levantine:
    "Reply in Levantine Arabic (اللهجة الشامية). Use words like 'كيفك', 'منيح', 'هلق', 'شو', 'عنجد'.",
};

const ENERGY_GUIDANCE: Record<string, string> = {
  high: "The user sounds energetic or stressed. Match a calm, grounding tone — slow, soft, and reassuring.",
  low: "The user sounds quiet, tired, or sad. Be warm, gentle, encouraging — lift them softly.",
  neutral: "The user sounds steady. Match a calm, friendly, present tone.",
};

export const voiceReply = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      transcript: z.string().min(1).max(2000),
      dialect: z.enum(["egyptian", "gulf", "levantine"]),
      energy: z.enum(["low", "neutral", "high"]),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const system = [
      "You are Bloom 🌸 — a warm, non-judgmental AI emotional support companion for an Arabic-speaking teenager (13–19).",
      DIALECT_INSTRUCTIONS[data.dialect],
      ENERGY_GUIDANCE[data.energy],
      "Rules: Never diagnose. Never label mental illness. Always validate feelings first. Keep replies short (2–4 sentences) so they sound natural when spoken aloud. Use light emojis sparingly (🌸💙🌿). If the user mentions self-harm or danger, gently encourage talking to a trusted adult or local helpline.",
      "Privacy: You do not store or remember audio. Only the current text matters.",
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.transcript },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply =
      json.choices?.[0]?.message?.content?.trim() ??
      "أنا معاك 💙 احكيلي أكتر.";
    return { reply };
  });