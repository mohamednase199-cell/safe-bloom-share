import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/bridge")({
  head: () => ({ meta: [{ title: "Bloom Bridge" }, { name: "description", content: "A consent-based way to share your emotional wellbeing with family." }] }),
  component: Bridge,
});

type Privacy = "private" | "partial" | "summary";
const levels: { val: Privacy; label: string; desc: string }[] = [
  { val: "private", label: "Private", desc: "Nothing is shared. Just you." },
  { val: "partial", label: "Partial sharing", desc: "Mood trends only, no details." },
  { val: "summary", label: "Emotional summary only", desc: "A weekly AI-written summary." },
];

function Bridge() {
  const navigate = useNavigate();
  const [parent, setParent] = useState({ name: "", relation: "Mother", contact: "" });
  const [privacy, setPrivacy] = useState<Privacy>("summary");
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    const b = JSON.parse(localStorage.getItem("bloom.bridge") || "null");
    if (b) { setParent(b.parent); setPrivacy(b.privacy); setLinked(true); }
  }, []);

  const addParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent.name || !parent.contact) return;
    localStorage.setItem("bloom.bridge", JSON.stringify({ parent, privacy }));
    setLinked(true);
  };

  const unlink = () => { localStorage.removeItem("bloom.bridge"); setLinked(false); setParent({ name: "", relation: "Mother", contact: "" }); };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="px-6 pt-12 pb-5" style={{ background: "var(--gradient-bloom)" }}>
          <div className="flex items-center gap-3">
            <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
            <h1 className="text-2xl font-semibold tracking-tight">Bloom Bridge 💙</h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Share your emotional wellbeing safely with your family — only what you choose.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs text-foreground">
            <ShieldCheck size={14} className="text-[var(--bloom-sage)]" />
            Not monitoring · No chat access · You're in control
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-6">
          {!linked ? (
            <>
              <form onSubmit={addParent} className="space-y-3 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
                <h2 className="text-sm font-semibold">Add a parent</h2>
                <Field label="Parent name"><input value={parent.name} onChange={e => setParent({ ...parent, name: e.target.value })} className={inputCls} placeholder="e.g. Sara" /></Field>
                <Field label="Relationship">
                  <select value={parent.relation} onChange={e => setParent({ ...parent, relation: e.target.value })} className={inputCls}>
                    <option>Mother</option><option>Father</option><option>Guardian</option>
                  </select>
                </Field>
                <Field label="Email or phone"><input value={parent.contact} onChange={e => setParent({ ...parent, contact: e.target.value })} className={inputCls} placeholder="email@example.com" /></Field>
                <button type="submit" className="w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>Add parent now</button>
              </form>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate({ to: "/home" })} className="rounded-3xl bg-card p-4 text-sm font-medium shadow-[var(--shadow-soft)]">
                  Skip for now
                  <p className="mt-1 text-xs font-normal text-muted-foreground">Set this up later anytime.</p>
                </button>
                <button
                  onClick={() => { navigator.clipboard?.writeText(`https://bloom.app/invite/${crypto.randomUUID().slice(0,8)}`); alert("Invite link copied 💙"); }}
                  className="rounded-3xl bg-card p-4 text-sm font-medium shadow-[var(--shadow-soft)]"
                >
                  Invite later
                  <p className="mt-1 text-xs font-normal text-muted-foreground">Generate a private link.</p>
                </button>
              </div>
            </>
          ) : (
            <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] animate-bloom-fade">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Connected to</p>
              <p className="mt-1 text-lg font-semibold">{parent.name} <span className="text-sm text-muted-foreground">· {parent.relation}</span></p>
              <p className="text-xs text-muted-foreground">{parent.contact}</p>
              <div className="mt-4 flex gap-2">
                <Link to="/bridge/dashboard" className="flex-1 rounded-2xl py-2.5 text-center text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>View parent dashboard</Link>
                <button onClick={unlink} className="rounded-2xl border border-border bg-white px-4 text-sm">Unlink</button>
              </div>
            </section>
          )}

          <PrivacyPicker value={privacy} onChange={(p) => { setPrivacy(p); if (linked) localStorage.setItem("bloom.bridge", JSON.stringify({ parent, privacy: p })); }} />

          <section className="rounded-3xl bg-card p-5 text-sm shadow-[var(--shadow-soft)]">
            <h3 className="mb-2 flex items-center gap-2 font-semibold"><EyeOff size={16} /> Parents can never see</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>· Your journal entries</li>
              <li>· Your chat messages</li>
              <li>· Any individual mood entry</li>
            </ul>
            <h3 className="mt-4 mb-2 flex items-center gap-2 font-semibold"><Eye size={16} /> They can see</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>✔ Weekly emotional summary</li>
              <li>✔ Stress level (Low / Medium / High)</li>
              <li>✔ AI-generated support guidance</li>
            </ul>
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function PrivacyPicker({ value, onChange }: { value: Privacy; onChange: (v: Privacy) => void }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-sm font-semibold">How much do you want to share?</h2>
      <div className="mt-3 space-y-2">
        {levels.map(l => {
          const active = value === l.val;
          return (
            <button
              key={l.val}
              onClick={() => onChange(l.val)}
              className="flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition"
              style={{
                borderColor: active ? "var(--bloom-sage)" : "var(--border)",
                background: active ? "color-mix(in oklab, var(--bloom-sage) 10%, white)" : "white",
              }}
            >
              <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2" style={{ borderColor: active ? "var(--bloom-sage)" : "var(--border)" }}>
                {active && <span className="h-2 w-2 rounded-full" style={{ background: "var(--bloom-sage)" }} />}
              </span>
              <div>
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--bloom-sage)] focus:ring-4 focus:ring-[var(--bloom-sage)]/15";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>);
}