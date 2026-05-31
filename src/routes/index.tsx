import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bloom — Grow together, safely" },
      { name: "description", content: "Bloom is a calming mental health companion for teens, with private journaling, mood tracking, and a safe family bridge." },
      { property: "og:title", content: "Bloom" },
      { property: "og:description", content: "A safe, gentle space for adolescent mental wellbeing." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <MobileShell className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-8 text-center" style={{ background: "var(--gradient-bloom)", position: "absolute", inset: 0, justifyContent: "center", display: "flex" }}>
        <div className="animate-bloom-grow">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-sage)", boxShadow: "var(--shadow-glow)" }}
          >
            <span className="text-6xl">🌸</span>
          </div>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Bloom</h1>
        <p className="max-w-xs text-lg leading-relaxed text-muted-foreground" dir="rtl">
          ازدهر مع بعض… بثقة وأمان
        </p>
        <div className="mt-4 flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--bloom-sage)] animate-bloom-float" style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
