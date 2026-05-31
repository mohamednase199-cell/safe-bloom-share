import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, BloomLogo } from "@/components/MobileShell";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Bloom" }, { name: "description", content: "Sign in to your safe space on Bloom." }] }),
  component: LoginPage,
});

const countries = ["Saudi Arabia", "United Arab Emirates", "Egypt", "Jordan", "Morocco", "United States", "United Kingdom", "Canada", "Germany", "France", "Other"];

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "Saudi Arabia" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bloom.user", JSON.stringify({ name: form.name || "Friend", email: form.email, country: form.country }));
    navigate({ to: "/onboarding" });
  };

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
              onClick={() => { localStorage.setItem("bloom.user", JSON.stringify({ name: "Friend", email: "you@google.com", country: "Saudi Arabia" })); navigate({ to: "/onboarding" }); }}
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