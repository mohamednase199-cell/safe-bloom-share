import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, School, Check } from "lucide-react";

export const Route = createFileRoute("/schools")({
  head: () => ({ meta: [{ title: "Bloom for Schools" }, { name: "description", content: "Bring Bloom's wellness to your school." }] }),
  component: Schools,
});

function Schools() {
  const [form, setForm] = useState({ school: "", name: "", email: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.school || !form.email) return;
    const list = JSON.parse(localStorage.getItem("bloom.schools") || "[]");
    list.push({ ...form, at: Date.now() });
    localStorage.setItem("bloom.schools", JSON.stringify(list));
    setSent(true);
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-24">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bloom for Schools 🏫</h1>
            <p className="text-xs text-muted-foreground">Wellness for every classroom</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <section className="rounded-3xl p-6 shadow-[var(--shadow-soft)]"
            style={{ background: "linear-gradient(135deg, var(--bloom-lavender), color-mix(in oklab, var(--bloom-sage) 60%, white))" }}>
            <School size={28} />
            <p className="mt-3 text-lg font-semibold leading-snug">Wellness programs for schools — coming soon 🌿</p>
            <p className="mt-2 text-sm opacity-80">Anonymous emotional check-ins, gentle insights for counselors, and tools that respect every student's privacy.</p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-semibold">Bring Bloom to your school</h2>
            <p className="text-xs text-muted-foreground">Leave your details and we'll reach out.</p>
            {sent ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl p-3 text-sm" style={{ background: "color-mix(in oklab, var(--bloom-sage) 20%, white)" }}>
                <Check size={16} /> Thanks! We'll be in touch 💙
              </div>
            ) : (
              <form onSubmit={submit} className="mt-3 space-y-3">
                <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}
                  placeholder="School name" className="w-full rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name" className="w-full rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email" placeholder="Email" className="w-full rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none" />
                <button type="submit" className="w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>
                  Request info
                </button>
              </form>
            )}
          </section>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}