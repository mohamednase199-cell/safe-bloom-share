import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft } from "lucide-react";
import {
  STAGES, computeXP, currentStage, nextStage,
  getAchievements, getGoals, setGoals, GOAL_OPTIONS,
} from "@/lib/bloom-helpers";

export const Route = createFileRoute("/journey")({
  head: () => ({ meta: [{ title: "Bloom Journey" }, { name: "description", content: "Your personal growth map." }] }),
  component: Journey,
});

function Journey() {
  const [xp, setXP] = useState(0);
  const [goals, setGoalsState] = useState<string[]>([]);
  const [achs, setAchs] = useState(getAchievements());

  useEffect(() => {
    setXP(computeXP());
    setGoalsState(getGoals());
    setAchs(getAchievements());
  }, []);

  const stage = currentStage(xp);
  const next = nextStage(xp);
  const progress = next ? Math.min(100, Math.round(((xp - stage.min) / (next.min - stage.min)) * 100)) : 100;

  const toggleGoal = (id: string) => {
    const has = goals.includes(id);
    const upd = has ? goals.filter((g) => g !== id) : [...goals, id].slice(0, 3);
    setGoalsState(upd);
    setGoals(upd);
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-24">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bloom Journey 🌸</h1>
            <p className="text-xs text-muted-foreground">Your personal growth map</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl p-6 text-center shadow-[var(--shadow-soft)] animate-bloom-fade"
            style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 60%, white))" }}>
            <div className="text-6xl">{stage.emoji}</div>
            <p className="mt-2 text-xs uppercase tracking-wider opacity-70">You are</p>
            <p className="text-2xl font-semibold">{stage.label}</p>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--bloom-sage)" }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {next ? `${progress}% to ${next.emoji} ${next.label}` : "Maximum stage 🌟"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Stages</h2>
            <div className="mt-3 flex items-center justify-between">
              {STAGES.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <span className="text-3xl" style={{ opacity: xp >= s.min ? 1 : 0.3 }}>{s.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-semibold">Your goals 🎯</h2>
            <p className="text-xs text-muted-foreground">Pick up to 3 — Bloom will support you.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className="rounded-full px-3 py-2 text-xs font-medium transition"
                    style={{
                      background: active ? "var(--bloom-sage)" : "color-mix(in oklab, var(--bloom-beige) 60%, white)",
                      color: active ? "var(--primary-foreground)" : "var(--foreground)",
                    }}>
                    {g.emoji} {g.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-semibold">Achievements 🏅</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {achs.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1 rounded-2xl p-3 text-center"
                  style={{
                    background: a.unlocked ? "color-mix(in oklab, var(--bloom-sage) 22%, white)" : "color-mix(in oklab, var(--bloom-beige) 60%, white)",
                    opacity: a.unlocked ? 1 : 0.55,
                  }}>
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-[10px] leading-tight">{a.title}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}