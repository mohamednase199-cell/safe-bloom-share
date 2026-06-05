import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Mic, Send } from "lucide-react";
import { chatReply } from "@/lib/bloom-ai.functions";
import { addMemory, getMemory, getLang } from "@/lib/bloom-helpers";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Bloom Chat" }, { name: "description", content: "A kind AI companion to talk through how you feel." }] }),
  component: Chat,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

function Chat() {
  const ask = useServerFn(chatReply);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "intro", role: "ai", text: "Hi 🌸 I'm Bloom. This is a safe space. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const t = input.trim();
    if (!t || busy) return;
    const user: Msg = { id: crypto.randomUUID(), role: "user", text: t };
    setMessages(m => [...m, user]);
    setInput("");
    setBusy(true);
    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
      const res = await ask({ data: { message: t, memory: getMemory(), lang: getLang(), history } });
      if (res.memoryNote) addMemory(res.memoryNote);
      setMessages(m => [...m, { id: crypto.randomUUID(), role: "ai", text: res.reply }]);
    } catch (e) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: "ai", text: "آسف، حصلت مشكلة. جرّب تاني بعد شوية 💙" }]);
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 px-6 pt-12 pb-4" style={{ background: "var(--gradient-bloom)" }}>
          <Link to="/home" className="rounded-full p-1.5 hover:bg-white/60"><ChevronLeft size={20} /></Link>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background: "var(--gradient-sage)" }}>🌸</span>
            <div>
              <h1 className="text-lg font-semibold">Bloom Companion</h1>
              <p className="text-xs text-muted-foreground">Always kind · Never judges</p>
            </div>
          </div>
          <Link
            to="/voice"
            className="ml-auto flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium hover:bg-white"
          >
            <Mic size={14} /> Voice · صوت
          </Link>
        </header>

        <main className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map(m => (
            <div key={m.id} className={`flex animate-bloom-fade ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-soft)]"
                style={{
                  background: m.role === "user" ? "var(--bloom-sage)" : "white",
                  color: m.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
                  borderBottomRightRadius: m.role === "user" ? 6 : undefined,
                  borderBottomLeftRadius: m.role === "ai" ? 6 : undefined,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </main>

        <div className="px-4 pb-2 pt-2">
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") void send(); }}
              placeholder={busy ? "Bloom is thinking…" : "Share what you're feeling…"}
              disabled={busy}
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button onClick={() => void send()} disabled={busy} className="flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-60" style={{ background: "var(--gradient-sage)" }}>
              <Send size={16} />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </MobileShell>
  );
}