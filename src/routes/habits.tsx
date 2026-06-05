import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Moon, BookOpen, Activity } from "lucide-react";
import { getHabits, saveHabit, type Habit } from "@/lib/bloom-helpers";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — Bloom" }, { name: "description", content: "Track sleep, study, and movement gently." }] }),
  component: Habits,
});

function todayKey() { return new Date().toISOString().slice(0, 10); }

function Habits() {
  const [today, setToday] = useState<Habit>({ day: todayKey() });
  const [history, setHistory] = useState<Habit[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const h = getHabits();
    setHistory(h);
    const t = h.find((x) => x.day === todayKey());
    if (t) setToday(t);
  }, []);

  const save = () => {
    saveHabit(today);
    setHistory(getHabits());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const insight = useMemo(() => {
    const withSleep = history.filter((h) => typeof h.sleep === "number");
    if (withSleep.length < 3) return "سجّل عاداتك كام يوم وBloom هيلاحظ معاك أنماط جميلة 🌱";
    const goodSleep = withSleep.filter((h) => (h.sleep ?? 0) >= 7).length;
    const total = withSleep.length;
    return `لقيت إنك في ${goodSleep} من ${total} أيام نمت 7+ ساعات 🌙 — استمر، النوم بيرفع مزاجك.`;
  }, [history]);

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-24">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Habits 🌙</h1>
            <p className="text-xs text-muted-foreground">Sleep · Study · Movement</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Today · {today.day}</h2>
            <div className="mt-4 space-y-4">
              <Slider icon={<Moon size={16} />} label="Sleep (hours)" value={today.sleep ?? 0} max={12}
                onChange={(v) => setToday({ ...today, sleep: v })} />
              <Slider icon={<BookOpen size={16} />} label="Study (hours)" value={today.study ?? 0} max={10}
                onChange={(v) => setToday({ ...today, study: v })} />
              <label className="flex items-center justify-between rounded-2xl p-3" style={{ background: "color-mix(in oklab, var(--bloom-sage) 14%, white)" }}>
                <span className="flex items-center gap-2 text-sm"><Activity size={16} /> Moved my body</span>
                <input type="checkbox" checked={!!today.exercise} onChange={(e) => setToday({ ...today, exercise: e.target.checked })} className="h-5 w-5 accent-[var(--bloom-sage)]" />
              </label>
            </div>
            <button onClick={save} className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>
              {saved ? "Saved 💙" : "Save today"}
            </button>
          </section>

          <section className="rounded-3xl p-5 shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 50%, white))" }}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">Insight 💡</p>
            <p className="mt-2 text-sm font-medium leading-relaxed">{insight}</p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Recent days</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {history.slice(-7).reverse().map((h) => (
                <li key={h.day} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "color-mix(in oklab, var(--bloom-beige) 60%, white)" }}>
                  <span>{h.day}</span>
                  <span className="text-xs text-muted-foreground">🌙 {h.sleep ?? "—"}h · 📖 {h.study ?? "—"}h · {h.exercise ? "🏃" : "·"}</span>
                </li>
              ))}
              {history.length === 0 && <li className="text-muted-foreground">No habits logged yet 🌱</li>}
            </ul>
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function Slider({ icon, label, value, max, onChange }: { icon: React.ReactNode; label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <input type="range" min={0} max={max} step={0.5} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--bloom-sage)]" />
    </div>
  );
}