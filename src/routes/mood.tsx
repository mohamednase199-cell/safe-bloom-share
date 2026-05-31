import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/mood")({
  head: () => ({ meta: [{ title: "Mood Tracker — Bloom" }, { name: "description", content: "See your emotional weather across the week." }] }),
  component: Mood,
});

const moodMeta: Record<string, { e: string; label: string; score: number }> = {
  great: { e: "😄", label: "Great", score: 5 },
  good: { e: "😊", label: "Good", score: 4 },
  okay: { e: "😐", label: "Okay", score: 3 },
  low: { e: "😔", label: "Low", score: 2 },
  tough: { e: "😣", label: "Tough", score: 1 },
};

function Mood() {
  const [log, setLog] = useState<{ val: string; at: number }[]>([]);
  useEffect(() => { setLog(JSON.parse(localStorage.getItem("bloom.moodLog") || "[]")); }, []);

  const last7 = log.slice(-7);
  const avg = last7.length ? (last7.reduce((s, e) => s + (moodMeta[e.val]?.score ?? 3), 0) / last7.length) : 0;
  const summary = avg >= 4 ? "You're flourishing 🌸" : avg >= 3 ? "Steady and gentle 🌿" : avg > 0 ? "It's been a tender stretch 💙" : "Check in to start your bloom 🌱";

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mood Tracker 📊</h1>
            <p className="text-xs text-muted-foreground">Your last 7 check-ins</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl p-5 text-foreground shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 55%, white))" }}>
            <p className="text-xs uppercase tracking-wider opacity-70">This week</p>
            <p className="mt-2 text-2xl font-semibold">{summary}</p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Recent check-ins</h2>
            <div className="mt-4 flex items-end justify-between gap-2 h-32">
              {Array.from({ length: 7 }).map((_, i) => {
                const entry = last7[i];
                const score = entry ? moodMeta[entry.val]?.score ?? 0 : 0;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-xl transition-all"
                        style={{ height: `${score * 18}%`, background: "var(--gradient-sage)", minHeight: 4 }}
                      />
                    </div>
                    <span className="text-base">{entry ? moodMeta[entry.val]?.e : "·"}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Recent entries</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {log.slice(-10).reverse().map((e, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                  <span>{moodMeta[e.val]?.e} {moodMeta[e.val]?.label}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.at).toLocaleDateString()}</span>
                </li>
              ))}
              {log.length === 0 && <li className="text-muted-foreground">No check-ins yet — try one from the Home screen 🌱</li>}
            </ul>
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}