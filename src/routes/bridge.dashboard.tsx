import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ChevronLeft, ShieldCheck, MessageSquareHeart, Leaf, HeartHandshake, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/bridge/dashboard")({
  head: () => ({ meta: [{ title: "Parent Dashboard — Bloom Bridge" }, { name: "description", content: "A respectful, AI-summarized view for parents." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [name, setName] = useState("your teen");
  const [parentName, setParentName] = useState("");
  const [stress, setStress] = useState<"Low" | "Medium" | "High">("Medium");
  const [week, setWeek] = useState<number[]>([]);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bloom.user") || "{}");
      if (u.name) setName(u.name.split(" ")[0]);
      const b = JSON.parse(localStorage.getItem("bloom.bridge") || "{}");
      if (b?.parent?.name) setParentName(b.parent.name);
      const scoreMap: Record<string, number> = { great: 5, good: 4, okay: 3, low: 2, tough: 1 };
      const log: { val: string; at: number }[] = JSON.parse(localStorage.getItem("bloom.moodLog") || "[]");
      const today = new Date(); today.setHours(0,0,0,0);
      const days: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = today.getTime() - i * 86400000;
        const dayEnd = dayStart + 86400000;
        const dayEntries = log.filter(e => e.at >= dayStart && e.at < dayEnd);
        const last = dayEntries[dayEntries.length - 1];
        days.push(last ? (scoreMap[last.val] ?? 0) : 0);
      }
      setWeek(days);
      const present = days.filter(n => n > 0);
      const avg = present.length ? present.reduce((s, n) => s + n, 0) / present.length : 0;
      setStress(avg >= 4 ? "Low" : avg >= 2.5 ? "Medium" : avg > 0 ? "High" : "Medium");
      const half = Math.floor(present.length / 2);
      if (half >= 1) {
        const a = present.slice(0, half).reduce((s,n)=>s+n,0)/half;
        const b2 = present.slice(-half).reduce((s,n)=>s+n,0)/half;
        setTrend(b2 - a > 0.4 ? "up" : a - b2 > 0.4 ? "down" : "flat");
      }
    } catch { /* noop */ }
  }, []);

  const stressColor = stress === "Low" ? "var(--bloom-sage)" : stress === "Medium" ? "oklch(0.8 0.12 75)" : "oklch(0.65 0.18 25)";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendLabel = trend === "up" ? "Gently lifting" : trend === "down" ? "Softening lately" : "Steady week";
  const insight = useMemo(() => {
    if (stress === "High") return `${name} experienced higher stress this week. Supportive, non-judgmental conversation — and less pressure around outcomes — may help most right now.`;
    if (stress === "Medium") return `${name} had a moderately stressful week, possibly tied to school or daily demands. A calm check-in, without questions about grades, can mean a lot.`;
    return `${name} had a balanced emotional week 🌿 Continue affirming small wins and the routines that feel good to them.`;
  }, [stress, name]);

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="px-6 pt-12 pb-5" style={{ background: "var(--gradient-bloom)" }}>
          <div className="flex items-center gap-3">
            <Link to="/bridge" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Bloom Bridge · Parent view</p>
              <h1 className="text-2xl font-semibold tracking-tight">Hi {parentName || "there"} 🌿</h1>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs">
            <ShieldCheck size={14} className="text-[var(--bloom-sage)]" />
            You see summaries — never messages
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-6 pb-10">
          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Weekly summary for {name}</p>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs" style={{ background: "color-mix(in oklab, var(--bloom-sage) 22%, white)" }}>
                <TrendIcon size={12} /> {trendLabel}
              </span>
            </div>
            <p className="mt-3 text-base leading-relaxed">
              This week shows <span className="font-semibold">{stress.toLowerCase()} stress</span> with {trend === "up" ? "an improving" : trend === "down" ? "a softening" : "a steady"} emotional tone. {name} has been engaging gently with self-reflection 💙
            </p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mood trend · last 7 days</p>
            <div className="mt-4 flex h-24 items-end justify-between gap-2">
              {week.map((s, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-xl transition-all"
                    style={{ height: `${Math.max(s * 18, s ? 8 : 4)}%`, background: s ? "var(--gradient-sage)" : "color-mix(in oklab, var(--bloom-beige) 80%, white)", minHeight: 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Trends only — no individual entries are visible.</p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Stress level</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-semibold" style={{ color: stressColor }}>{stress}</p>
              <div className="flex gap-1.5">
                {["Low","Medium","High"].map(l => (
                  <span key={l} className="h-2 w-10 rounded-full" style={{ background: l === stress ? stressColor : "color-mix(in oklab, currentColor 15%, transparent)" }} />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl p-5 text-foreground shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 55%, white))" }}>
            <p className="text-xs uppercase tracking-wider opacity-70">AI insight for parents 💡</p>
            <p className="mt-2 text-base leading-relaxed">{insight}</p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-semibold">Gentle guidance 🌿</h3>
            <div className="mt-3 space-y-3">
              <Tip icon={<MessageSquareHeart size={16} />} title="How to support emotionally" body={`Lead with curiosity, not solutions. Try “I'm here whenever you want to talk” instead of advice.`} />
              <Tip icon={<HeartHandshake size={16} />} title="Communication tips" body="Ask open questions. Avoid pressuring around grades or behaviour during low-mood days." />
              <Tip icon={<Leaf size={16} />} title="Stress management" body="Encourage small breaks, sleep, time outside, and shared calm moments like a walk or meal." />
            </div>
          </section>

          <section className="rounded-3xl bg-card p-5 text-sm shadow-[var(--shadow-soft)]">
            <h3 className="font-semibold">Your access</h3>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>✔ Weekly summary · ✔ Stress trend · ✔ Suggested support</li>
              <li>✘ No journal · ✘ No chat · ✘ No tracking</li>
            </ul>
          </section>
        </main>
      </div>
    </MobileShell>
  );
}

function Tip({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-2xl p-3" style={{ background: "color-mix(in oklab, var(--bloom-beige) 55%, white)" }}>
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "color-mix(in oklab, var(--bloom-sage) 25%, white)", color: "var(--bloom-sage)" }}>{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}