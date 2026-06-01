import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Headphones, NotebookPen, MessageCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/mood")({
  head: () => ({ meta: [{ title: "Mood Tracker — Bloom" }, { name: "description", content: "See your emotional weather and gentle weekly insights." }] }),
  component: Mood,
});

const moodMeta: Record<string, { e: string; label: string; score: number }> = {
  great: { e: "😄", label: "Happy", score: 5 },
  good:  { e: "😊", label: "Calm", score: 4 },
  okay:  { e: "😐", label: "Neutral", score: 3 },
  low:   { e: "😔", label: "Sad", score: 2 },
  tough: { e: "😣", label: "Stressed", score: 1 },
};

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

type Entry = { val: string; at: number };

function buildWeek(log: Entry[]): (Entry | null)[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const week: (Entry | null)[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today); day.setDate(today.getDate() - i);
    const dayStart = day.getTime();
    const dayEnd = dayStart + 86400000;
    const dayEntries = log.filter(e => e.at >= dayStart && e.at < dayEnd);
    week.push(dayEntries.length ? dayEntries[dayEntries.length - 1] : null);
  }
  return week;
}

function Mood() {
  const [log, setLog] = useState<Entry[]>([]);
  useEffect(() => { setLog(JSON.parse(localStorage.getItem("bloom.moodLog") || "[]")); }, []);

  const week = useMemo(() => buildWeek(log), [log]);
  const present = week.filter(Boolean) as Entry[];
  const scores = present.map(e => moodMeta[e.val]?.score ?? 3);
  const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;

  const half = Math.floor(present.length / 2);
  const firstAvg = half ? present.slice(0, half).reduce((s, e) => s + (moodMeta[e.val]?.score ?? 3), 0) / half : 0;
  const lastAvg  = half ? present.slice(-half).reduce((s, e) => s + (moodMeta[e.val]?.score ?? 3), 0) / half : 0;
  const trend: "up" | "down" | "flat" = present.length < 2 ? "flat" : lastAvg - firstAvg > 0.4 ? "up" : firstAvg - lastAvg > 0.4 ? "down" : "flat";

  const counts: Record<string, number> = {};
  present.forEach(e => { counts[e.val] = (counts[e.val] ?? 0) + 1; });
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const stressDays = present.filter(e => e.val === "tough").length;
  const sadDays = present.filter(e => e.val === "low").length;
  const calmDays = present.filter(e => e.val === "good" || e.val === "great").length;
  const stressLevel = stressDays >= 3 ? "High" : stressDays >= 1 || sadDays >= 2 ? "Medium" : "Low";

  const variance = scores.length ? scores.reduce((s, n) => s + (n - avg) ** 2, 0) / scores.length : 0;
  const stability = variance < 0.5 ? "Very steady" : variance < 1.5 ? "Mostly steady" : "Shifting";

  const insight = useMemo(() => {
    if (!present.length) return "Start checking in daily and Bloom will gently notice patterns with you 🌱";
    if (stressDays >= 3) return "It seems you've been feeling more stressed this week 💙 This might be tied to school or daily pressure. Try small breaks, a few slow breaths, or stepping outside for a moment.";
    if (sadDays >= 3) return "We noticed you've been feeling down more than usual 💙 You're not alone. Talking to someone you trust — or writing it out — can lighten the weight a little.";
    if (calmDays >= 4) return "You've had a balanced emotional week 🌿 Keep nurturing the small routines that feel good — they're working.";
    if (trend === "up") return "Your week is gently lifting 🌸 Whatever you've been doing, it's worth noticing and keeping.";
    if (trend === "down") return "Things have felt a bit heavier lately 💙 Be soft with yourself — rest counts, and tomorrow is a new check-in.";
    return "Your week has been a mix of feelings 🌿 That's completely human. Keep checking in — patterns become clearer with time.";
  }, [present.length, stressDays, sadDays, calmDays, trend]);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendLabel = trend === "up" ? "Lifting" : trend === "down" ? "Softening" : "Steady";

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-24">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mood Tracker 📊</h1>
            <p className="text-xs text-muted-foreground">Gentle patterns from your week</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">This week</h2>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs" style={{ background: "color-mix(in oklab, var(--bloom-sage) 22%, white)" }}>
                <TrendIcon size={12} /> {trendLabel}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {week.map((entry, i) => {
                const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
                const meta = entry ? moodMeta[entry.val] : null;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{dayLabels[d.getDay()]}</span>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
                      style={{
                        background: meta ? "color-mix(in oklab, var(--bloom-lavender) 55%, white)" : "color-mix(in oklab, var(--bloom-beige) 70%, white)",
                        outline: isToday ? "2px solid var(--bloom-sage)" : "none",
                        outlineOffset: 2,
                      }}
                    >
                      {meta?.e ?? "·"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl p-5 shadow-[var(--shadow-soft)] animate-bloom-fade" style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 50%, white))" }}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">Your Emotional Insight 💡</p>
            <p className="mt-2 text-base font-medium leading-relaxed">{insight}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wider opacity-60">Bloom doesn't diagnose — it listens.</p>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <StatCard label="Stress level" value={stressLevel} tone={stressLevel === "High" ? "warn" : stressLevel === "Medium" ? "soft" : "calm"} />
            <StatCard label="Stability" value={stability} tone="calm" />
            <StatCard label="Most common" value={mostCommon ? moodMeta[mostCommon].e : "—"} sub={mostCommon ? moodMeta[mostCommon].label : "No data"} tone="soft" />
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">A gentle next step</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <QuickBtn to="/home" icon={<Headphones size={18} />} label="Calm" hint="Breathe" />
              <QuickBtn to="/journal" icon={<NotebookPen size={18} />} label="Journal" hint="Write" />
              <QuickBtn to="/chat" icon={<MessageCircle size={18} />} label="AI" hint="Talk" />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-medium text-muted-foreground">Recent check-ins</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {log.slice(-10).reverse().map((e, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "color-mix(in oklab, var(--bloom-beige) 60%, white)" }}>
                  <span>{moodMeta[e.val]?.e} {moodMeta[e.val]?.label}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.at).toLocaleDateString()}</span>
                </li>
              ))}
              {log.length === 0 && <li className="text-muted-foreground">No check-ins yet — try one from Home 🌱</li>}
            </ul>
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "calm" | "soft" | "warn" }) {
  const bg = tone === "warn"
    ? "color-mix(in oklab, var(--bloom-lavender) 70%, #f4c2c2)"
    : tone === "soft"
    ? "color-mix(in oklab, var(--bloom-lavender) 60%, white)"
    : "color-mix(in oklab, var(--bloom-sage) 35%, white)";
  return (
    <div className="rounded-2xl p-3 shadow-[var(--shadow-soft)]" style={{ background: bg }}>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-base font-semibold leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function QuickBtn({ to, icon, label, hint }: { to: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-[var(--shadow-soft)] transition hover:translate-y-[-2px]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "color-mix(in oklab, var(--bloom-sage) 25%, white)", color: "var(--bloom-sage)" }}>{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </Link>
  );
}