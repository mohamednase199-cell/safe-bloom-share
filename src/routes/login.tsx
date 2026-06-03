import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, BloomLogo } from "@/components/MobileShell";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Bloom" }, { name: "description", content: "Sign in to your safe space on Bloom." }] }),
  component: LoginPage,
});

const countries = ["Saudi Arabia", "United Arab Emirates", "Egypt", "Jordan", "Morocco", "United States", "United Kingdom", "Canada", "Germany", "France", "Other"];

const googleCountries = [
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇦🇪", name: "UAE" },
  { flag: "🇪🇬", name: "Egypt" },
  { flag: "🇯🇴", name: "Jordan" },
  { flag: "🇲🇦", name: "Morocco" },
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🌍", name: "Other" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "email" | "google">("choose");
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "Saudi Arabia" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bloom.user", JSON.stringify({ name: form.name || "Friend", email: form.email, country: form.country }));
    navigate({ to: "/onboarding" });
  };

  if (mode === "google") {
    return <GoogleOnboarding onBack={() => setMode("choose")} onDone={() => navigate({ to: "/onboarding" })} />;
  }

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col px-7 pb-10 pt-14" style={{ background: "var(--gradient-bloom)" }}>
        <div className="flex flex-col items-center gap-3 animate-bloom-fade">
          <BloomLogo size={64} />
          <h1 className="text-2xl font-semibold">Welcome to Bloom</h1>
          <p className="text-sm text-muted-foreground">A gentle place to grow with care 🌿</p>
        </div>

        {mode === "choose" ? (
          <div className="mt-12 flex flex-col gap-3 animate-bloom-fade">
            <button
              onClick={() => setMode("google")}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium shadow-sm transition hover:translate-y-[-1px]"
            >
              <span className="text-lg">🟢</span> Continue with Google
            </button>
            <button
              onClick={() => setMode("email")}
              className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-primary-foreground transition hover:translate-y-[-1px]"
              style={{ background: "var(--gradient-sage)", boxShadow: "var(--shadow-glow)" }}
            >
              ✉️ Continue with Email
            </button>
            <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to our gentle terms 💙</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4 animate-bloom-fade">
            <Field label="Full Name"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Layla" /></Field>
            <Field label="Email"><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="you@example.com" /></Field>
            <Field label="Password"><input required type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="••••••••" /></Field>
            <Field label="Country 🌍">
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputCls}>
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <button type="submit" className="mt-2 rounded-2xl px-5 py-4 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)", boxShadow: "var(--shadow-glow)" }}>
              Create my safe space
            </button>
            <button type="button" onClick={() => setMode("choose")} className="text-xs text-muted-foreground underline-offset-4 hover:underline">← Back</button>
          </form>
        )}

        <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          New here? <Link to="/onboarding" className="text-primary font-medium">Take a tour</Link>
        </div>
      </div>
    </MobileShell>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--bloom-sage)] focus:ring-4 focus:ring-[var(--bloom-sage)]/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/* ---------- Google 3-step onboarding ---------- */
function GoogleOnboarding({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [role, setRole] = useState<"teen" | "parent" | null>(null);

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? !!country : !!role;

  const next = () => {
    if (!canNext) return;
    if (step < 2) { setStep(step + 1); return; }
    localStorage.setItem(
      "bloom.user",
      JSON.stringify({ name: name.trim(), country, accountType: role, email: "you@google.com" }),
    );
    onDone();
  };

  const back = () => (step === 0 ? onBack() : setStep(step - 1));

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col px-6 pb-8 pt-12" style={{ background: "var(--gradient-bloom)" }}>
        {/* header */}
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === step ? 28 : 8,
                  background: i <= step ? "var(--bloom-sage)" : "color-mix(in oklab, var(--bloom-sage) 25%, transparent)",
                }}
              />
            ))}
          </div>
          <span className="w-9" />
        </div>

        {/* slide content */}
        <div className="relative mt-6 flex-1 overflow-hidden">
          <div
            className="flex h-full w-[300%] transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${step * (100 / 3)}%)` }}
          >
            {/* STEP 1 */}
            <div className="w-1/3 px-1">
              <div className="flex flex-col items-center gap-4 pt-2">
                <BloomLogo size={72} />
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-center">What should we call you?</h2>
                <p className="text-sm text-muted-foreground text-center">A name for your safe space 🌸</p>
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && next()}
                placeholder="e.g. Layla 🌸"
                className="mt-8 w-full rounded-2xl border border-border bg-white px-5 py-4 text-center text-lg outline-none transition focus:border-[var(--bloom-sage)] focus:ring-4 focus:ring-[var(--bloom-sage)]/15"
                autoFocus
              />
            </div>

            {/* STEP 2 */}
            <div className="w-1/3 px-1">
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Where are you from?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tap the place that feels like home 🌍</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {googleCountries.map(c => {
                  const active = country === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setCountry(c.name)}
                      className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-3 text-left text-sm transition"
                      style={{
                        borderColor: active ? "var(--bloom-sage)" : "var(--border)",
                        boxShadow: active ? "var(--shadow-glow)" : "var(--shadow-soft)",
                        transform: active ? "translateY(-1px)" : "none",
                        background: active ? "color-mix(in oklab, var(--bloom-sage) 12%, white)" : "white",
                      }}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3 */}
            <div className="w-1/3 px-1">
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Who are you joining as?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the experience that fits you 💙</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {([
                  { id: "teen", emoji: "🧑‍💻", title: "I'm a Teen", sub: "This is my safe space" },
                  { id: "parent", emoji: "👨‍👩‍👧", title: "I'm a Parent", sub: "I want to support my child" },
                ] as const).map(opt => {
                  const active = role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setRole(opt.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 text-center transition"
                      style={{
                        borderColor: active ? "transparent" : "var(--border)",
                        backgroundImage: active ? "var(--gradient-sage)" : undefined,
                        boxShadow: active ? "var(--shadow-glow)" : "var(--shadow-soft)",
                        transform: active ? "translateY(-2px)" : "none",
                        color: active ? "var(--primary-foreground)" : "var(--foreground)",
                      }}
                    >
                      <span className="text-4xl">{opt.emoji}</span>
                      <span className="text-sm font-semibold">{opt.title}</span>
                      <span className="text-[11px] opacity-80">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={next}
          disabled={!canNext}
          className="mt-6 rounded-2xl px-5 py-4 text-sm font-semibold text-primary-foreground transition disabled:opacity-40"
          style={{ background: "var(--gradient-sage)", boxShadow: canNext ? "var(--shadow-glow)" : undefined }}
        >
          {step < 2 ? "Continue" : "Enter Bloom 🌸"}
        </button>
      </div>
    </MobileShell>
  );
}