import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Bloom" }, { name: "description", content: "A private place to write your thoughts." }] }),
  component: Journal,
});

type Entry = { id: string; text: string; at: number };

function Journal() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("bloom.journal") || "[]"));
  }, []);

  const save = () => {
    if (!text.trim()) return;
    const next = [{ id: crypto.randomUUID(), text: text.trim(), at: Date.now() }, ...entries].slice(0, 50);
    setEntries(next);
    localStorage.setItem("bloom.journal", JSON.stringify(next));
    setText("");
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Journal 📓</h1>
            <p className="text-xs text-muted-foreground">Only you can see this.</p>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-6 pt-5">
          <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What's on your mind today?"
              rows={5}
              className="w-full resize-none rounded-2xl bg-white p-4 text-sm outline-none focus:ring-4 focus:ring-[var(--bloom-sage)]/15"
            />
            <button onClick={save} className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>
              Save entry
            </button>
          </div>

          <div className="space-y-3">
            {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">No entries yet — start with one gentle thought 🌱</p>}
            {entries.map(e => (
              <article key={e.id} className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] animate-bloom-fade">
                <p className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{e.text}</p>
              </article>
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}