import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { BookOpen, MessageCircle, BarChart3, Heart, Brain, Sparkles, Moon, GraduationCap } from "lucide-react";
import { computeXP, currentStage, nextStage } from "@/lib/bloom-helpers";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — Bloom" }, { name: "description", content: "Your gentle daily check-in with Bloom." }] }),
  component: HomePage,
});

const moods = [
  { e: "😄", label: "Happy", val: "great" },
  { e: "😊", label: "Calm", val: "good" },
  { e: "😐", label: "Neutral", val: "okay" },
  { e: "😔", label: "Sad", val: "low" },
  { e: "😣", label: "Stressed", val: "tough" },
];

function HomePage() {
  const [name, setName] = useState("Friend");
  const [mood, setMood] = useState<string | null>(null);
  const [xp, setXP] = useState(0);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bloom.user") || "{}");
      if (u.name) setName(u.name.split(" ")[0]);
      setMood(localStorage.getItem("bloom.todayMood"));
      setXP(computeXP());
    } catch { /* noop */ }
  }, []);

  const pick = (val: string) => {
    setMood(val);
    localStorage.setItem("bloom.todayMood", val);
    const log = JSON.parse(localStorage.getItem("bloom.moodLog") || "[]");
    log.push({ val, at: Date.now() });
    localStorage.setItem("bloom.moodLog", JSON.stringify(log.slice(-30)));
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back 🌿</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hi, {name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Take a slow breath. You made it here.</p>
        </header>

        <main className="flex-1 space-y-6 px-6 pt-6">
          <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] animate-bloom-fade">
            <h2 className="text-sm font-medium text-muted-foreground">How are you feeling today?</h2>
            <div className="mt-4 flex items-center justify-between gap-2">
              {moods.map(m => (
                <button
                  key={m.val}
                  onClick={() => pick(m.val)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-2 transition"
                  style={{
                    background: mood === m.val ? "color-mix(in oklab, var(--bloom-lavender) 70%, white)" : "transparent",
                    transform: mood === m.val ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <span className="text-3xl">{m.e}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
            {mood && (
              <p className="mt-3 text-xs text-muted-foreground">Thanks for sharing 💙 Your check-in was saved gently.</p>
            )}
          </section>

          <section
            className="rounded-3xl p-6 text-foreground animate-bloom-fade"
            style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 55%, white))" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">Daily card</p>
            <p className="mt-2 text-xl font-medium leading-snug">You are safe. Take a deep breath 💙</p>
            <p className="mt-2 text-sm opacity-80">Inhale for 4 · Hold for 4 · Exhale for 6.</p>
          </section>

          <Link to="/journey" className="block rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] animate-bloom-fade">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Your journey</p>
                <p className="mt-1 text-base font-semibold">{currentStage(xp).emoji} {currentStage(xp).label}</p>
              </div>
              <Sparkles size={18} className="opacity-60" />
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--bloom-beige) 70%, white)" }}>
              <div className="h-full rounded-full" style={{
                width: `${nextStage(xp) ? Math.min(100, Math.round(((xp - currentStage(xp).min) / (nextStage(xp)!.min - currentStage(xp).min)) * 100)) : 100}%`,
                background: "var(--bloom-sage)",
              }} />
            </div>
          </Link>

          <section className="grid grid-cols-2 gap-3">
            <QuickAction to="/journal" icon={<BookOpen size={20} />} label="Journal" hint="Write it out" />
            <QuickAction to="/chat" icon={<MessageCircle size={20} />} label="AI Chat" hint="Talk it through" />
            <QuickAction to="/mood" icon={<BarChart3 size={20} />} label="Mood Tracker" hint="See your week" />
            <QuickAction to="/bridge" icon={<Heart size={20} />} label="Bloom Bridge" hint="Family, safely" />
            <QuickAction to="/neuroboost" icon={<Brain size={20} />} label="NeuroBoost" hint="Focus, calmly" />
            <QuickAction to="/habits" icon={<Moon size={20} />} label="Habits" hint="Sleep · Study" />
            <QuickAction to="/exams" icon={<GraduationCap size={20} />} label="Exams" hint="Calm study plan" />
            <QuickAction to="/schools" icon={<Sparkles size={20} />} label="For Schools" hint="Coming soon" />
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function QuickAction({ to, icon, label, hint }: { to: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link to={to} className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-[var(--shadow-soft)] transition hover:translate-y-[-2px]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--bloom-sage) 25%, white)", color: "var(--bloom-sage)" }}>
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </Link>
  );
}