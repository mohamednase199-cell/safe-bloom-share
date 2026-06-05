import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Plus, X, Sparkles } from "lucide-react";
import { generateStudyPlan } from "@/lib/bloom-ai.functions";
import { getLang } from "@/lib/bloom-helpers";

export const Route = createFileRoute("/exams")({
  head: () => ({ meta: [{ title: "Academic Stress Mode — Bloom" }, { name: "description", content: "A calm study plan for your exams." }] }),
  component: Exams,
});

type Subject = { name: string; date: string };
type Plan = { days: { day: string; blocks: string[] }[]; tip: string };

function Exams() {
  const gen = useServerFn(generateStudyPlan);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [draft, setDraft] = useState<Subject>({ name: "", date: "" });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSubjects(JSON.parse(localStorage.getItem("bloom.exams") || "[]"));
      const p = localStorage.getItem("bloom.examsPlan");
      if (p) setPlan(JSON.parse(p));
    } catch { /* noop */ }
  }, []);

  const persist = (s: Subject[]) => { setSubjects(s); localStorage.setItem("bloom.exams", JSON.stringify(s)); };
  const add = () => { if (!draft.name || !draft.date) return; persist([...subjects, draft]); setDraft({ name: "", date: "" }); };
  const remove = (i: number) => persist(subjects.filter((_, idx) => idx !== i));

  const build = async () => {
    if (!subjects.length) return;
    setLoading(true); setErr(null);
    try {
      const res = await gen({ data: { subjects, lang: getLang() } });
      setPlan(res);
      localStorage.setItem("bloom.examsPlan", JSON.stringify(res));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't build plan");
    } finally { setLoading(false); }
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-24">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Academic Stress Mode 📚</h1>
            <p className="text-xs text-muted-foreground">A calm plan for your exams</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-semibold">Your subjects</h2>
            <ul className="mt-3 space-y-2">
              {subjects.map((s, i) => (
                <li key={i} className="flex items-center justify-between rounded-2xl px-3 py-2"
                  style={{ background: "color-mix(in oklab, var(--bloom-lavender) 50%, white)" }}>
                  <span className="text-sm"><span className="font-medium">{s.name}</span> · <span className="text-xs text-muted-foreground">{s.date}</span></span>
                  <button onClick={() => remove(i)} className="rounded-full p-1 hover:bg-white/60"><X size={14} /></button>
                </li>
              ))}
              {subjects.length === 0 && <li className="text-xs text-muted-foreground">Add your subjects below 🌱</li>}
            </ul>
            <div className="mt-3 flex gap-2">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Subject (e.g. Math)" className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none" />
              <input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                placeholder="Date" className="w-28 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none" />
              <button onClick={add} className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: "var(--gradient-sage)" }}>
                <Plus size={16} />
              </button>
            </div>
            <button onClick={build} disabled={!subjects.length || loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              style={{ background: "var(--gradient-sage)" }}>
              <Sparkles size={14} /> {loading ? "Building your plan…" : "Generate study plan"}
            </button>
            {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          </section>

          {plan && (
            <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] animate-bloom-fade">
              <h2 className="text-sm font-semibold">Your weekly plan 🌿</h2>
              <div className="mt-3 space-y-3">
                {plan.days.map((d, i) => (
                  <div key={i} className="rounded-2xl p-3" style={{ background: "color-mix(in oklab, var(--bloom-beige) 55%, white)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.day}</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {d.blocks.map((b, j) => <li key={j}>· {b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              {plan.tip && (
                <div className="mt-4 rounded-2xl p-3 text-sm" style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 50%, white))" }}>
                  💙 {plan.tip}
                </div>
              )}
            </section>
          )}
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}