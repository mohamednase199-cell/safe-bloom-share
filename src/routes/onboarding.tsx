import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Bloom" }, { name: "description", content: "A quick tour of your new emotional companion." }] }),
  component: Onboarding,
});

const slides = [
  { emoji: "🌿", title: "Welcome to Bloom", body: "A calm corner of the internet, made for you to breathe, reflect, and grow." },
  { emoji: "💭", title: "Understand your emotions", body: "Gentle check-ins and a kind AI companion help you notice how you really feel." },
  { emoji: "💙", title: "You are safe here", body: "Your words are private. Share only what you choose — when you choose." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col px-7 pb-10 pt-16" style={{ background: "var(--gradient-bloom)" }}>
        <div key={i} className="flex flex-1 flex-col items-center justify-center gap-6 text-center animate-bloom-fade">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl shadow-[var(--shadow-soft)]">
            {s.emoji}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">{s.title}</h2>
          <p className="max-w-xs text-base leading-relaxed text-muted-foreground">{s.body}</p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <span key={idx} className="h-1.5 rounded-full transition-all" style={{ width: idx === i ? 28 : 8, background: idx === i ? "var(--bloom-sage)" : "color-mix(in oklab, var(--bloom-sage) 30%, transparent)" }} />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="text-sm text-muted-foreground">Skip</button>
          <button
            onClick={() => (last ? navigate({ to: "/home" }) : setI(i + 1))}
            className="rounded-2xl px-8 py-3.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-sage)", boxShadow: "var(--shadow-glow)" }}
          >
            {last ? "Start 🌸" : "Next"}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}