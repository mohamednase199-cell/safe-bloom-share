import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileShell, BloomLogo } from "@/components/MobileShell";
import { ChevronLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

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

  if (mode === "google") {
    return <GoogleOnboarding onBack={() => setMode("choose")} onDone={() => navigate({ to: "/onboarding" })} />;
  }

  if (mode === "email") {
    return <EmailAuth onBack={() => setMode("choose")} onDone={(u) => { localStorage.setItem("bloom.user", JSON.stringify(u)); navigate({ to: "/onboarding" }); }} />;
  }

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col px-7 pb-10 pt-14" style={{ background: "var(--gradient-bloom)" }}>
        <div className="flex flex-col items-center gap-3 animate-bloom-fade">
          <BloomLogo size={64} />
          <h1 className="text-2xl font-semibold">Welcome to Bloom</h1>
          <p className="text-sm text-muted-foreground">A gentle place to grow with care 🌿</p>
        </div>

        <div className="mt-12 flex flex-col gap-3 animate-bloom-fade">
            <button
              onClick={() => setMode("google")}
              className="btn-base btn-secondary"
            >
              <span className="text-lg">🟢</span> Continue with Google
            </button>
            <button
              onClick={() => setMode("email")}
              className="btn-base btn-primary"
            >
              ✉️ Continue with Email
            </button>
            <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to our gentle terms 💙</p>
          </div>

        <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          New here? <Link to="/onboarding" className="text-primary font-medium">Take a tour</Link>
        </div>
      </div>
    </MobileShell>
  );
}

/* ---------- Email auth (sign in / sign up) ---------- */
type AuthMode = "signin" | "signup";
type SavedUser = { name: string; email: string; country: string; passwordHash: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const hashPwd = (s: string) => {
  // Tiny non-crypto digest just so we don't store plaintext in localStorage.
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return `b1$${(h >>> 0).toString(36)}.${s.length}`;
};
const readUsers = (): Record<string, SavedUser> => {
  try { return JSON.parse(localStorage.getItem("bloom.users") || "{}"); } catch { return {}; }
};
const writeUsers = (u: Record<string, SavedUser>) => localStorage.setItem("bloom.users", JSON.stringify(u));

function EmailAuth({ onBack, onDone }: { onBack: () => void; onDone: (u: { name: string; email: string; country: string }) => void }) {
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "Saudi Arabia" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Please enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (authMode === "signup" && !form.name.trim()) e.name = "What should we call you?";
    return e;
  }, [form, authMode]);

  const emailValid = !errors.email && form.email.length > 0;
  const pwdValid = !errors.password && form.password.length > 0;
  const isValid = Object.keys(errors).length === 0;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setFormError(null);
  };
  const blur = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) { triggerShake(); return; }
    setLoading(true);
    setFormError(null);
    await new Promise(r => setTimeout(r, 650)); // mimic network

    const email = form.email.trim().toLowerCase();
    const users = readUsers();

    if (authMode === "signin") {
      const u = users[email];
      if (!u) { setLoading(false); setFormError("No account found with this email. Try creating one."); triggerShake(); return; }
      if (u.passwordHash !== hashPwd(form.password)) { setLoading(false); setFormError("Incorrect password. Please try again."); triggerShake(); return; }
      setLoading(false);
      onDone({ name: u.name, email: u.email, country: u.country });
      return;
    }

    // signup
    if (users[email]) { setLoading(false); setFormError("An account with this email already exists. Try signing in."); triggerShake(); return; }
    const newUser: SavedUser = { name: form.name.trim(), email, country: form.country, passwordHash: hashPwd(form.password) };
    users[email] = newUser;
    writeUsers(users);
    setLoading(false);
    onDone({ name: newUser.name, email: newUser.email, country: newUser.country });
  };

  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col px-6 pb-8 pt-12" style={{ background: "var(--gradient-bloom)" }}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm transition hover:bg-white">
            <ChevronLeft size={18} />
          </button>
          <div className="flex rounded-full bg-white/60 p-1 text-xs font-medium shadow-sm backdrop-blur">
            {(["signin", "signup"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setAuthMode(m); setFormError(null); }}
                className="rounded-full px-4 py-1.5 transition"
                style={{
                  background: authMode === m ? "var(--gradient-sage)" : "transparent",
                  color: authMode === m ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  boxShadow: authMode === m ? "var(--shadow-glow)" : undefined,
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
          <span className="w-9" />
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center animate-bloom-fade">
          <BloomLogo size={56} />
          <h1 className="text-2xl font-semibold tracking-tight">{authMode === "signin" ? "Welcome back 🌸" : "Create your space"}</h1>
          <p className="text-sm text-muted-foreground">{authMode === "signin" ? "Sign in to continue your journey" : "A safe corner, just for you"}</p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className={`mt-7 flex flex-col gap-3.5 animate-bloom-fade ${shake ? "animate-bloom-shake" : ""}`}
        >
          {authMode === "signup" && (
            <FormField
              id="name"
              label="Your name"
              icon={<User size={16} />}
              value={form.name}
              onChange={v => set("name", v)}
              onBlur={() => blur("name")}
              placeholder="e.g. Layla"
              autoComplete="name"
              error={touched.name ? errors.name : undefined}
              valid={!errors.name && form.name.length > 0}
            />
          )}

          <FormField
            id="email"
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            value={form.email}
            onChange={v => set("email", v.replace(/\s/g, ""))}
            onBlur={() => blur("email")}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            error={touched.email ? errors.email : undefined}
            valid={emailValid}
          />

          <FormField
            id="password"
            label="Password"
            type={showPwd ? "text" : "password"}
            icon={<Lock size={16} />}
            value={form.password}
            onChange={v => set("password", v)}
            onBlur={() => blur("password")}
            placeholder="At least 6 characters"
            autoComplete={authMode === "signin" ? "current-password" : "new-password"}
            error={touched.password ? errors.password : undefined}
            valid={pwdValid}
            trailing={
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {authMode === "signup" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Country 🌍</span>
              <select
                value={form.country}
                onChange={e => set("country", e.target.value)}
                className="field-input"
                style={{ paddingLeft: "1rem" }}
              >
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}

          {formError && (
            <div
              role="alert"
              className="animate-bloom-error flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-xs text-destructive"
              style={{ background: "color-mix(in oklab, var(--destructive) 8%, white)" }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            aria-busy={loading}
            className="btn-base btn-primary mt-3"
          >
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden />
                <span>Just a moment…</span>
              </>
            ) : authMode === "signin" ? "Sign in" : "Create my safe space 🌸"}
          </button>

          <p className="mt-1 text-center text-xs text-muted-foreground">
            {authMode === "signin" ? "New to Bloom?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setFormError(null); }}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {authMode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </MobileShell>
  );
}

function FormField({
  id, label, icon, error, valid, trailing, type = "text", onChange, onBlur, ...rest
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  valid?: boolean;
  trailing?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const showError = !!error;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${id}-err` : undefined}
          data-valid={valid && !showError ? "true" : undefined}
          data-invalid={showError ? "true" : undefined}
          className="field-input"
          {...rest}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {valid && !showError && <CheckCircle2 size={16} className="text-[color:var(--bloom-sage)]" />}
          {trailing}
        </span>
      </div>
      {showError && (
        <p id={`${id}-err`} role="alert" className="animate-bloom-error flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
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