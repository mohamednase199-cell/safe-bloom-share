import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Mic, MicOff, ShieldCheck, Volume2 } from "lucide-react";
import { voiceReply } from "@/lib/voice.functions";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Bloom Voice — رفيقك الصوتي" },
      {
        name: "description",
        content:
          "Speak with Bloom in Egyptian, Gulf, or Levantine Arabic. Privacy-first voice support — audio never leaves your device.",
      },
    ],
  }),
  component: VoicePage,
});

type Dialect = "egyptian" | "gulf" | "levantine";
type Energy = "low" | "neutral" | "high";

const DIALECTS: { id: Dialect; label: string; locale: string; sample: string }[] = [
  { id: "egyptian", label: "مصري", locale: "ar-EG", sample: "ازيك؟" },
  { id: "gulf", label: "خليجي", locale: "ar-SA", sample: "شلونك؟" },
  { id: "levantine", label: "شامي", locale: "ar-LB", sample: "كيفك؟" },
];

type Turn = { id: string; role: "user" | "ai"; text: string; energy?: Energy };

// Browser SpeechRecognition typing
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSR(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function VoicePage() {
  const [dialect, setDialect] = useState<Dialect>("egyptian");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [partial, setPartial] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [supported, setSupported] = useState(true);
  const [energy, setEnergy] = useState<Energy>("neutral");
  const [level, setLevel] = useState(0);

  const recRef = useRef<SR | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);

  const askServer = useServerFn(voiceReply);

  useEffect(() => {
    const SR = getSR();
    if (!SR) setSupported(false);
    return () => {
      cleanupAudio();
      try {
        recRef.current?.stop();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupAudio() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      void audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  async function startAudioMeter() {
    samplesRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    analyserRef.current = analyser;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (!analyserRef.current) return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setLevel(rms);
      samplesRef.current.push(rms);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function detectEnergy(): Energy {
    const s = samplesRef.current;
    if (s.length < 5) return "neutral";
    const avg = s.reduce((a, b) => a + b, 0) / s.length;
    const peak = Math.max(...s);
    if (peak > 0.35 || avg > 0.12) return "high";
    if (avg < 0.04) return "low";
    return "neutral";
  }

  async function start() {
    const SR = getSR();
    if (!SR) return;
    const locale = DIALECTS.find((d) => d.id === dialect)?.locale ?? "ar-EG";
    setPartial("");
    try {
      await startAudioMeter();
    } catch {
      // mic denied — continue without meter
    }
    const rec = new SR();
    rec.lang = locale;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results as unknown as ArrayLike<{ 0: { transcript: string } }>)
        .map((r) => r[0].transcript)
        .join(" ");
      setPartial(t);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const detected = detectEnergy();
      setEnergy(detected);
      cleanupAudio();
      const finalText = (recRef.current as unknown as { _last?: string })?._last || "";
      void handleFinal(finalText || partial, detected);
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function stop() {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
  }

  async function handleFinal(text: string, detectedEnergy: Energy) {
    const clean = text.trim();
    if (!clean) {
      setPartial("");
      return;
    }
    const userTurn: Turn = {
      id: crypto.randomUUID(),
      role: "user",
      text: clean,
      energy: detectedEnergy,
    };
    setTurns((t) => [...t, userTurn]);
    setPartial("");
    setThinking(true);
    try {
      const { reply } = await askServer({
        data: { transcript: clean, dialect, energy: detectedEnergy },
      });
      const aiTurn: Turn = { id: crypto.randomUUID(), role: "ai", text: reply };
      setTurns((t) => [...t, aiTurn]);
      speak(reply);
    } catch {
      setTurns((t) => [
        ...t,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: "حصل خلل بسيط 🌿 جرب تاني بعد شوية.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = DIALECTS.find((d) => d.id === dialect)?.locale ?? "ar-EG";
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  const energyLabel: Record<Energy, string> = {
    low: "هادي · soft",
    neutral: "متوازن · steady",
    high: "متوتر · intense",
  };

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col" dir="rtl">
        <header
          className="flex items-center gap-3 px-6 pt-12 pb-5"
          style={{ background: "var(--gradient-bloom)" }}
        >
          <Link
            to="/chat"
            className="rounded-full p-1.5 hover:bg-white/60"
            dir="ltr"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Bloom صوت 🌸</h1>
            <p className="text-xs text-muted-foreground">
              احكي بحرية · بلوم هيسمعك
            </p>
          </div>
          <span
            className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px]"
            dir="ltr"
          >
            <ShieldCheck size={12} /> No audio stored
          </span>
        </header>

        <div className="px-5 pt-4">
          <div className="flex gap-2">
            {DIALECTS.map((d) => {
              const active = dialect === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDialect(d.id)}
                  className="flex-1 rounded-2xl px-3 py-2 text-sm transition-all"
                  style={{
                    background: active ? "var(--gradient-sage)" : "white",
                    color: active ? "var(--primary-foreground)" : "var(--foreground)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  <div className="font-semibold">{d.label}</div>
                  <div className="text-[11px] opacity-80">{d.sample}</div>
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {turns.length === 0 && !partial && (
            <div className="rounded-3xl bg-white p-5 text-center shadow-[var(--shadow-soft)]">
              <p className="text-sm leading-relaxed">
                دوس على المايك واحكي اللي في قلبك 💙
                <br />
                <span className="text-xs text-muted-foreground">
                  بلوم بيفهم لهجتك ومش بيحفظ صوتك أبدًا.
                </span>
              </p>
            </div>
          )}
          {turns.map((t) => (
            <div
              key={t.id}
              className={`flex animate-bloom-fade ${
                t.role === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className="max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-soft)]"
                style={{
                  background:
                    t.role === "user" ? "var(--bloom-sage)" : "white",
                  color:
                    t.role === "user"
                      ? "var(--primary-foreground)"
                      : "var(--foreground)",
                }}
              >
                {t.text}
                {t.role === "ai" && (
                  <button
                    onClick={() => speak(t.text)}
                    className="mt-1 flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100"
                    dir="ltr"
                  >
                    <Volume2 size={11} /> replay
                  </button>
                )}
              </div>
            </div>
          ))}
          {partial && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-3xl bg-white/70 px-4 py-2.5 text-sm italic text-muted-foreground">
                {partial}…
              </div>
            </div>
          )}
          {thinking && (
            <div className="text-center text-xs text-muted-foreground">
              بلوم بيفكر… 🌸
            </div>
          )}
        </main>

        <div className="flex flex-col items-center gap-2 px-5 pb-4">
          {!supported ? (
            <p className="text-center text-xs text-muted-foreground">
              المتصفح ده مش بيدعم التعرف على الصوت. جرب Chrome 💙
            </p>
          ) : (
            <>
              <div
                className="text-[11px] text-muted-foreground"
                dir="ltr"
              >
                Tone: {energyLabel[energy]}
              </div>
              <button
                onClick={listening ? stop : start}
                disabled={thinking}
                className="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[var(--shadow-soft)] transition-transform active:scale-95 disabled:opacity-50"
                style={{
                  background: listening
                    ? "var(--bloom-lavender)"
                    : "var(--gradient-sage)",
                  transform: listening
                    ? `scale(${1 + Math.min(level * 1.5, 0.4)})`
                    : undefined,
                }}
                aria-label={listening ? "Stop" : "Start"}
              >
                {listening ? <MicOff size={28} /> : <Mic size={28} />}
                {listening && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
                )}
              </button>
              <p className="text-[11px] text-muted-foreground">
                {listening ? "بسمعك… دوس تاني للتوقف" : "دوس واحكي"}
              </p>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </MobileShell>
  );
}