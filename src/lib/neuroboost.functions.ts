import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const breakdownTask = createServerFn({ method: "POST" })
  .inputValidator(z.object({ task: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const system = [
      "You are Bloom's NeuroBoost assistant 🌿 — a calm, supportive helper for teenagers with ADHD or focus difficulties.",
      "Break the user's task into 3–6 tiny, doable steps. Each step must be:",
      "- one short sentence (under 12 words)",
      "- starts with a gentle verb (Open, Read, Write, Pause, Breathe…)",
      "- includes a small emoji when natural",
      "Never overwhelm. Always include at least one short break step.",
      "Reply ONLY as a JSON array of strings. No commentary, no markdown.",
      'Example: ["Open your notebook 📓","Read 2 pages slowly","Pause 2 min 🌿","Write one key idea"]',
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.task },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "[]";
    let steps: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) steps = parsed;
      else if (Array.isArray(parsed.steps)) steps = parsed.steps;
      else steps = Object.values(parsed).flat() as string[];
    } catch {
      steps = raw.split(/\n+/).map((s) => s.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean);
    }
    return { steps: steps.slice(0, 6).map(String) };
  });