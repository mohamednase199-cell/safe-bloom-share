import type { ReactNode } from "react";

export function MobileShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen w-full flex items-stretch justify-center bg-[var(--bloom-cream)]">
      <div
        className={`relative w-full max-w-[440px] min-h-screen bg-[var(--bloom-cream)] ${className}`}
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function BloomLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full animate-bloom-float"
      style={{
        width: size,
        height: size,
        background: "var(--gradient-sage)",
        boxShadow: "var(--shadow-glow)",
      }}
    >
      <span style={{ fontSize: size * 0.55 }}>🌸</span>
    </div>
  );
}