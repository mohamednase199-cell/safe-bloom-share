import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { breakdownTask } from "@/lib/neuroboost.functions";
import {
  Brain,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wind,
  EyeOff,
  Eye,
  Check,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/neuroboost")({
  head: () => ({
    meta: [
      { title: "NeuroBoost 🧠 — Bloom" },
      { name: "description", content: "Focus, calm down, and break tasks into tiny steps. Built for ADHD-friendly minds." },
    ],
  }),
  component: NeuroBoost,
});

type Mode = "dashboard" | "calm" | "focus";

const defaultPlan = [
  { id: "1", text: "Wake up & hydrate 💧", done: false },
  { id: "2", text: "10 min focus task 🧠", done: false },
  { id: "3", text: "Short break 🌿", done: false },
  { id: "4", text: "Continue your task ✍️", done: false },
  { id: "5", text: "Celebrate one small win 🌸", done: false },
];

function NeuroBoost() {
  const [mode, setMode] = useState<Mode>("dashboard");
  const [plan, setPlan] = useState(defaultPlan);
  const [distractionFree, setDistractionFree] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bloom.nb.plan");
    if (saved) try { setPlan(JSON.parse(saved)); } catch { /* noop */ }
  }, []);
  useEffect(() => { localStorage.setItem("bloom.nb.plan", JSON.stringify(plan)); }, [plan]);

  if (mode === "calm") return <CalmMode onExit={() => setMode("dashboard")} />;

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="px-6 pt-12 pb-5" style={{ background: "var(--gradient-bloom)" }}>
          <div className="flex items-center gap-2">
            <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">NeuroBoost</span>
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Brain size={24} style={{ color: "var(--bloom-sage)" }} /> One step at a time 🌿
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calm focus, made for your brain.
          </p>
        </header>

        <main className="flex-1 space-y-5 px-5 pt-5 pb-2">
          {/* Calm down banner */}
          <button
            onClick={() => setMode("calm")}
            className="flex w-full items-center gap-3 rounded-3xl p-4 text-left transition hover:translate-y-[-1px]"
            style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--bloom-lavender) 80%, white), color-mix(in oklab, var(--bloom-sage) 35%, white))", boxShadow: "var(--shadow-soft)" }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70">
              <Wind size={20} style={{ color: "var(--bloom-sage)" }} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Feeling overwhelmed?</p>
              <p className="text-xs text-muted-foreground">Tap to slow things down with me 💙</p>
            </div>
          </button>

          {/* Focus Timer */}
          <FocusTimer distractionFree={distractionFree} onToggleDistraction={() => setDistractionFree(d => !d)} />

          {!distractionFree && (
            <>
              {/* Daily Plan */}
              <Section title="Daily Focus Plan" hint="Tap a step when you finish it. No pressure 🌱">
                <ul className="space-y-2">
                  {plan.map((s, i) => (
                    <li key={s.id}>
                      <button
                        onClick={() => setPlan(p => p.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
                        className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-[var(--shadow-soft)] transition"
                        style={{ opacity: s.done ? 0.55 : 1 }}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold"
                          style={{
                            background: s.done ? "var(--bloom-sage)" : "transparent",
                            color: s.done ? "white" : "var(--muted-foreground)",
                            borderColor: "color-mix(in oklab, var(--bloom-sage) 50%, white)",
                          }}
                        >
                          {s.done ? <Check size={14} /> : i + 1}
                        </span>
                        <span className={`flex-1 text-sm ${s.done ? "line-through" : ""}`}>{s.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Break it down */}
              <BreakItDown />

              {/* Gentle assistant suggestions */}
              <Section title="Gentle reminders 💙" hint="From your NeuroBoost assistant">
                <div className="space-y-2">
                  <Tip>That's okay 💙 Let's break this into one small step only.</Tip>
                  <Tip>You don't need to do everything at once. One step is enough.</Tip>
                  <Tip>Let's try just 5 minutes. You can stop after that if you want 🌿</Tip>
                </div>
              </Section>
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] animate-bloom-fade">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-white p-3 text-xs leading-relaxed text-foreground/80 shadow-[var(--shadow-soft)]">
      {children}
    </p>
  );
}

/* ---------- Focus Timer ---------- */
function FocusTimer({ distractionFree, onToggleDistraction }: { distractionFree: boolean; onToggleDistraction: () => void }) {
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [left, setLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          const next = phase === "focus" ? "break" : "focus";
          setPhase(next);
          return next === "focus" ? FOCUS : BREAK;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running, phase]);

  const total = phase === "focus" ? FOCUS : BREAK;
  const pct = ((total - left) / total) * 100;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <section className="rounded-3xl p-5 shadow-[var(--shadow-soft)] animate-bloom-fade" style={{ background: "var(--gradient-bloom)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Focus Timer</p>
          <p className="text-sm font-semibold">
            {phase === "focus" ? "25 min focus" : "5 min break"} · Pomodoro
          </p>
        </div>
        <button
          onClick={onToggleDistraction}
          className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium"
        >
          {distractionFree ? <Eye size={12} /> : <EyeOff size={12} />}
          {distractionFree ? "Show all" : "Focus mode"}
        </button>
      </div>

      <div className="my-4 flex items-center justify-center">
        <div
          className="flex h-44 w-44 items-center justify-center rounded-full text-3xl font-semibold tracking-wider"
          style={{
            background: `conic-gradient(var(--bloom-sage) ${pct}%, color-mix(in oklab, var(--bloom-sage) 15%, white) 0)`,
          }}
        >
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
            <span>{mm}:{ss}</span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{phase}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-sage)", boxShadow: "var(--shadow-glow)" }}
        >
          {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start Focus Session</>}
        </button>
        <button
          onClick={() => { setRunning(false); setPhase("focus"); setLeft(FOCUS); }}
          className="flex items-center justify-center rounded-2xl bg-white px-4 text-sm shadow-[var(--shadow-soft)]"
          aria-label="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </section>
  );
}

/* ---------- Break it down (AI) ---------- */
function BreakItDown() {
  const breakdown = useServerFn(breakdownTask);
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    const t = task.trim();
    if (!t) return;
    setLoading(true); setErr(null); setSteps([]);
    try {
      const res = await breakdown({ data: { task: t } });
      setSteps(res.steps);
    } catch {
      // Fallback simulation so the feature still works offline
      setSteps([
        `Open what you need for: ${t} 📒`,
        "Spend 5 minutes on the first small part",
        "Pause and breathe for 1 minute 🌿",
        "Continue with the next small part",
        "Celebrate finishing one step 🌸",
      ]);
      setErr("Used a gentle offline plan 💙");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Break it down for me ✨" hint="Write a task, I'll turn it into tiny steps.">
      <div className="flex gap-2">
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run()}
          placeholder="e.g. Study biology chapter"
          className="flex-1 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--bloom-sage)]"
        />
        <button
          onClick={run}
          disabled={loading || !task.trim()}
          className="flex items-center gap-1.5 rounded-2xl px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          style={{ background: "var(--gradient-sage)" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Break
        </button>
      </div>
      {err && <p className="mt-2 text-[11px] text-muted-foreground">{err}</p>}
      {steps.length > 0 && (
        <ol className="mt-3 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-white p-3 text-sm shadow-[var(--shadow-soft)] animate-bloom-fade">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-primary-foreground"
                style={{ background: "var(--bloom-sage)" }}
              >{i + 1}</span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

/* ---------- Calm Down Mode ---------- */
function CalmMode({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const seq: { p: typeof phase; ms: number }[] = [
      { p: "in", ms: 4000 },
      { p: "hold", ms: 4000 },
      { p: "out", ms: 6000 },
    ];
    let i = 0;
    setPhase(seq[0].p);
    const tick = () => {
      i = (i + 1) % seq.length;
      setPhase(seq[i].p);
    };
    const id = window.setInterval(tick, 4666);
    return () => window.clearInterval(id);
  }, []);

  const scale = phase === "in" ? 1.35 : phase === "hold" ? 1.35 : 0.85;
  const label = phase === "in" ? "Breathe in" : phase === "hold" ? "Hold gently" : "Breathe out";

  return (
    <MobileShell>
      <div
        className="flex min-h-screen flex-col items-center justify-center px-8 text-center"
        style={{ background: "linear-gradient(180deg, var(--bloom-cream), color-mix(in oklab, var(--bloom-lavender) 55%, white))" }}
      >
        <p className="text-sm text-muted-foreground">You are safe 💙</p>
        <h2 className="mt-1 max-w-xs text-xl font-medium leading-snug">Let's slow things down together.</h2>

        <div className="my-12 flex h-64 w-64 items-center justify-center">
          <div
            className="flex h-44 w-44 items-center justify-center rounded-full text-sm font-medium text-foreground/80"
            style={{
              background: "var(--gradient-sage)",
              boxShadow: "var(--shadow-glow)",
              transform: `scale(${scale})`,
              transition: "transform 4s cubic-bezier(.45,.05,.55,.95)",
            }}
          >
            {label}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Inhale 4 · Hold 4 · Exhale 6</p>

        <button
          onClick={onExit}
          className="mt-10 rounded-2xl bg-white px-6 py-3 text-sm font-medium shadow-[var(--shadow-soft)]"
        >
          I feel a little better 🌸
        </button>
      </div>
    </MobileShell>
  );
}