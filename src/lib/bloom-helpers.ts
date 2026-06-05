/* Client-side helpers shared by NeuroBoost/Journey/Habits/Culture features. */

export type Lang = "ar" | "en";

export function getLang(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    const u = JSON.parse(localStorage.getItem("bloom.user") || "{}");
    return (u.lang as Lang) || "ar";
  } catch {
    return "ar";
  }
}

export function setLang(lang: Lang) {
  try {
    const u = JSON.parse(localStorage.getItem("bloom.user") || "{}");
    u.lang = lang;
    localStorage.setItem("bloom.user", JSON.stringify(u));
  } catch {
    /* noop */
  }
}

/* ─── Memory store ───────────────────────────────────────────── */
export function getMemory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("bloom.memory") || "[]");
  } catch {
    return [];
  }
}
export function addMemory(note: string) {
  if (!note || typeof window === "undefined") return;
  const cur = getMemory();
  cur.push(note);
  localStorage.setItem("bloom.memory", JSON.stringify(cur.slice(-20)));
}

/* ─── Habits ─────────────────────────────────────────────────── */
export type Habit = { day: string; sleep?: number; study?: number; exercise?: boolean };
export function getHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("bloom.habits") || "[]");
  } catch {
    return [];
  }
}
export function saveHabit(h: Habit) {
  const cur = getHabits().filter((x) => x.day !== h.day);
  cur.push(h);
  localStorage.setItem("bloom.habits", JSON.stringify(cur.slice(-60)));
}

/* ─── Bloom Journey (level + XP) ────────────────────────────── */
export type Stage = { key: "seed" | "growing" | "blooming" | "thriving"; emoji: string; label: string; min: number };
export const STAGES: Stage[] = [
  { key: "seed", emoji: "🌱", label: "Seed", min: 0 },
  { key: "growing", emoji: "🌿", label: "Growing", min: 10 },
  { key: "blooming", emoji: "🌸", label: "Blooming", min: 30 },
  { key: "thriving", emoji: "⭐", label: "Thriving", min: 70 },
];

export function computeXP() {
  if (typeof window === "undefined") return 0;
  try {
    const moods = JSON.parse(localStorage.getItem("bloom.moodLog") || "[]") as { at: number }[];
    const journals = JSON.parse(localStorage.getItem("bloom.journal") || "[]") as unknown[];
    const habits = getHabits();
    return moods.length * 2 + journals.length * 3 + habits.length * 2;
  } catch {
    return 0;
  }
}

export function currentStage(xp: number): Stage {
  return [...STAGES].reverse().find((s) => xp >= s.min) ?? STAGES[0];
}

export function nextStage(xp: number): Stage | null {
  return STAGES.find((s) => s.min > xp) ?? null;
}

/* ─── Achievements ───────────────────────────────────────────── */
export type Achievement = { id: string; emoji: string; title: string; unlocked: boolean };
export function getAchievements(): Achievement[] {
  if (typeof window === "undefined") return [];
  try {
    const moods = JSON.parse(localStorage.getItem("bloom.moodLog") || "[]") as { at: number }[];
    const journals = JSON.parse(localStorage.getItem("bloom.journal") || "[]") as { at?: number }[];
    const habits = getHabits();
    const uniqueDays = new Set(moods.map((m) => new Date(m.at).toDateString())).size;
    return [
      { id: "first-checkin", emoji: "🌱", title: "First check-in", unlocked: moods.length >= 1 },
      { id: "week-moods", emoji: "🌿", title: "7 days mood tracking", unlocked: uniqueDays >= 7 },
      { id: "first-journal", emoji: "📓", title: "First journal entry", unlocked: journals.length >= 1 },
      { id: "month", emoji: "🌸", title: "Month of commitment", unlocked: uniqueDays >= 30 },
      { id: "habits-7", emoji: "🌙", title: "7 habit logs", unlocked: habits.length >= 7 },
      { id: "thriving", emoji: "⭐", title: "Reached Thriving", unlocked: computeXP() >= 70 },
    ];
  } catch {
    return [];
  }
}

/* ─── Goals ──────────────────────────────────────────────────── */
export type Goal = { id: string; label: string; emoji: string };
export const GOAL_OPTIONS: Goal[] = [
  { id: "stress", label: "Reduce stress", emoji: "🌿" },
  { id: "focus", label: "Improve focus", emoji: "🧠" },
  { id: "time", label: "Organize my time", emoji: "⏰" },
  { id: "sleep", label: "Sleep better", emoji: "🌙" },
  { id: "confidence", label: "Build confidence", emoji: "🌸" },
];
export function getGoals(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("bloom.goals") || "[]");
  } catch {
    return [];
  }
}
export function setGoals(ids: string[]) {
  localStorage.setItem("bloom.goals", JSON.stringify(ids.slice(0, 3)));
}