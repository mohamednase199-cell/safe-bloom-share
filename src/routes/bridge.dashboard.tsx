import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/bridge/dashboard")({
  head: () => ({ meta: [{ title: "Parent Dashboard — Bloom Bridge" }, { name: "description", content: "A respectful, AI-summarized view for parents." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [name, setName] = useState("your teen");
  const [parentName, setParentName] = useState("");
  const [stress, setStress] = useState<"Low" | "Medium" | "High">("Medium");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bloom.user") || "{}");
      if (u.name) setName(u.name.split(" ")[0]);
      const b = JSON.parse(localStorage.getItem("bloom.bridge") || "{}");
      if (b?.parent?.name) setParentName(b.parent.name);
      const log: { val: string }[] = JSON.parse(localStorage.getItem("bloom.moodLog") || "[]");
      const score = log.slice(-7).reduce((s, e) => s + ({ great:5, good:4, okay:3, low:2, tough:1 }[e.val as never] ?? 3), 0) / Math.max(1, log.slice(-7).length);
      setStress(score >= 4 ? "Low" : score >= 2.5 ? "Medium" : "High");
    } catch { /* noop */ }
  }, []);

  const stressColor = stress === "Low" ? "var(--bloom-sage)" : stress === "Medium" ? "oklch(0.8 0.12 75)" : "oklch(0.65 0.18 25)";

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
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Weekly emotional summary for {name}</p>
            <p className="mt-3 text-base leading-relaxed">
              This week shows <span className="font-semibold">moderate academic stress</span> with a generally hopeful outlook. {name} has been engaging gently with self-reflection and reaching out for support 💙
            </p>
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
            <p className="text-xs uppercase tracking-wider opacity-70">AI-generated guidance</p>
            <p className="mt-2 text-base leading-relaxed">
              Consider supportive, non-judgmental communication. A shared meal or a quiet walk can open the door — let {name} lead the pace 💙
            </p>
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