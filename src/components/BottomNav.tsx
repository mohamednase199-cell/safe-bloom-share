import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, MessageCircle, BarChart3, Heart } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/mood", label: "Mood", icon: BarChart3 },
  { to: "/bridge", label: "Bridge", icon: Heart },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-20 mt-6 border-t border-border/60 bg-[var(--bloom-cream)]/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] transition-colors"
                style={{
                  color: active ? "var(--bloom-sage)" : "var(--muted-foreground)",
                  background: active ? "color-mix(in oklab, var(--bloom-sage) 12%, transparent)" : "transparent",
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}