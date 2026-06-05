import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callAI(system: string, user: string, json = false): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return j.choices?.[0]?.message?.content?.trim() ?? "";
}

/* ─── Chat with memory ────────────────────────────────────────────── */
export const chatReply = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      message: z.string().min(1).max(2000),
      memory: z.array(z.string()).max(20).default([]),
      lang: z.enum(["ar", "en"]).default("ar"),
      history: z
        .array(z.object({ role: z.enum(["user", "ai"]), text: z.string().max(2000) }))
        .max(10)
        .default([]),
    }),
  )
  .handler(async ({ data }) => {
    const langLine =
      data.lang === "ar"
        ? "Reply in warm Arabic (Egyptian dialect). Use soft emojis sparingly (🌸💙🌿)."
        : "Reply in warm English. Use soft emojis sparingly (🌸💙🌿).";
    const mem = data.memory.length
      ? `Things you remember about this user (use naturally, don't list them):\n- ${data.memory.join("\n- ")}`
      : "You don't have memories about this user yet.";
    const system = [
      "You are Bloom 🌸 — a kind, non-judgmental AI life companion for a teenager.",
      langLine,
      mem,
      "Reference past patterns naturally when relevant (e.g., 'I noticed you often feel stressed before exams'). Never diagnose. Validate feelings first. Keep replies short (2–4 sentences).",
    ].join("\n");
    const convo = data.history
      .map((h) => `${h.role === "user" ? "User" : "Bloom"}: ${h.text}`)
      .join("\n");
    const userBlock = convo ? `${convo}\nUser: ${data.message}` : data.message;
    const reply = await callAI(system, userBlock);
    // Generate short memory note (best-effort, ignore failure)
    let memoryNote = "";
    try {
      memoryNote = await callAI(
        "Extract ONE short memory note (max 12 words) from the user's message that would help a companion remember them later. Focus on emotions, recurring topics, events (exams, family, sleep, friends). If nothing notable, reply with exactly: SKIP",
        data.message,
      );
      if (memoryNote.toUpperCase().includes("SKIP")) memoryNote = "";
    } catch {
      memoryNote = "";
    }
    return { reply: reply || (data.lang === "ar" ? "أنا معاك 💙" : "I'm here with you 💙"), memoryNote };
  });

/* ─── Pattern detection ───────────────────────────────────────────── */
export const detectPatterns = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      moodLog: z
        .array(z.object({ val: z.string(), at: z.number() }))
        .max(60)
        .default([]),
      habits: z
        .array(z.object({ day: z.string(), sleep: z.number().optional(), study: z.number().optional(), exercise: z.boolean().optional() }))
        .max(60)
        .default([]),
      memory: z.array(z.string()).max(20).default([]),
      lang: z.enum(["ar", "en"]).default("ar"),
    }),
  )
  .handler(async ({ data }) => {
    if (data.moodLog.length < 3 && data.habits.length < 3) {
      return {
        patterns: [
          data.lang === "ar"
            ? "لسه محتاجين شوية بيانات أكتر علشان نلاحظ أنماط 🌱 كمّل check-in يومي."
            : "Need a few more check-ins to see patterns 🌱 Keep going.",
        ],
      };
    }
    const langLine =
      data.lang === "ar"
        ? "Reply in friendly Egyptian Arabic."
        : "Reply in friendly English.";
    const system = [
      "You analyze a teen's mood + habit data and surface 2–4 short, kind, specific patterns.",
      langLine,
      "Output JSON: { patterns: string[] }. Each pattern <= 18 words. Be specific (mention days, numbers, correlations). Never diagnose.",
    ].join("\n");
    const moodSummary = data.moodLog
      .slice(-21)
      .map((m) => `${new Date(m.at).toLocaleDateString("en-US", { weekday: "short" })}:${m.val}`)
      .join(", ");
    const habitSummary = data.habits
      .slice(-14)
      .map((h) => `${h.day}: sleep=${h.sleep ?? "?"}h study=${h.study ?? "?"}h ex=${h.exercise ? "y" : "n"}`)
      .join("; ");
    const user = `Mood log: ${moodSummary || "none"}\nHabits: ${habitSummary || "none"}\nMemory notes: ${data.memory.join(" | ") || "none"}`;
    const raw = await callAI(system, user, true);
    let patterns: string[] = [];
    try {
      const p = JSON.parse(raw);
      patterns = Array.isArray(p.patterns) ? p.patterns : [];
    } catch {
      patterns = [raw];
    }
    return { patterns: patterns.slice(0, 4).map(String) };
  });

/* ─── Study plan ──────────────────────────────────────────────────── */
export const generateStudyPlan = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      subjects: z
        .array(z.object({ name: z.string().min(1).max(80), date: z.string().min(1).max(40) }))
        .min(1)
        .max(15),
      lang: z.enum(["ar", "en"]).default("ar"),
    }),
  )
  .handler(async ({ data }) => {
    const langLine =
      data.lang === "ar"
        ? "Reply in supportive Egyptian Arabic."
        : "Reply in supportive English.";
    const system = [
      "You are Bloom's calm study coach for a teenager 🌿.",
      langLine,
      "Produce a realistic, kind weekly plan. Include short breaks, sleep reminders, and one emotional-support tip.",
      "Output JSON: { days: [{ day: string, blocks: string[] }], tip: string }. Max 7 days, max 4 blocks per day, each block under 16 words.",
    ].join("\n");
    const user = data.subjects.map((s) => `${s.name} — ${s.date}`).join("\n");
    const raw = await callAI(system, user, true);
    try {
      const p = JSON.parse(raw);
      return {
        days: Array.isArray(p.days) ? p.days.slice(0, 7) : [],
        tip: typeof p.tip === "string" ? p.tip : "",
      };
    } catch {
      return { days: [], tip: raw };
    }
  });