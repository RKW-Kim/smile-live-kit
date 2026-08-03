"use client";

/**
 * Smile Live Kit — Broadcast Console (control panel at `/`)
 * ─────────────────────────────────────────────────────────────
 * The ONLY screen a human touches during a stream.
 * Grandma-operable: pick a scene → see live preview → go live.
 *
 *  ┌─ Header ─────────────────────────────────────────────────┐
 *  │ [W21 | WORLD 21]   SMILE LIVE KIT — BROADCAST CONSOLE  DEV │
 *  ├──────────────┬───────────────────────────────────────────┤
 *  │ Scene list   │  Live preview (1920×1080 → scaled iframe)  │
 *  │ (left, ~30%) │  + Open Fullscreen + OBS URL hint          │
 *  │              │                                            │
 *  ├──────────────┴───────────────────────────────────────────┤
 *  │ Footer: [Go Live] [Stop] [Refresh] · clock · W21 mark     │
 *  └────────────────────────────────────────────────────────────┘
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { W21Lockup, W21Mark } from "@/components/w21";
import type { ChannelKey } from "@/lib/w21/channels";
import { useClock } from "@/hooks/use-clock";
import { cn } from "@/lib/utils";
import {
  Radio,
  ExternalLink,
  RefreshCw,
  Play,
  Square,
  Copy,
  Check,
  Clock3,
} from "lucide-react";

/* ─── Scene catalog ─────────────────────────────────────────── */
type SceneStatus = "live" | "ready" | "soon";

interface SceneEntry {
  id: string;
  title: string;
  channel: ChannelKey;
  /** Route to the actual scene page, if built. */
  route?: string;
  status: SceneStatus;
  /** Short tagline shown under the title in the card. */
  tagline: string;
}

const SCENES: SceneEntry[] = [
  {
    id: "starting-soon",
    title: "Starting Soon",
    channel: "parent",
    status: "soon",
    tagline: "Looping intro · countdown",
  },
  {
    id: "trading-live",
    title: "Trading Live",
    channel: "trading",
    route: "/scenes/trading-live",
    status: "live",
    tagline: "Main broadcast desk · 1920×1080",
  },
  {
    id: "break",
    title: "Break / BRB",
    channel: "news",
    status: "soon",
    tagline: "Intermission card · music bed",
  },
  {
    id: "news",
    title: "News",
    channel: "news",
    status: "soon",
    tagline: "Headline ticker · anchor frame",
  },
  {
    id: "interview",
    title: "Interview",
    channel: "impact",
    status: "soon",
    tagline: "Two-shot · lower-third name",
  },
  {
    id: "education",
    title: "Education",
    channel: "education",
    status: "soon",
    tagline: "Lesson deck · code window",
  },
  {
    id: "ending",
    title: "Ending",
    channel: "parent",
    status: "soon",
    tagline: "Outro card · social handles",
  },
];

/* ─── Time helpers ──────────────────────────────────────────── */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function fmtClock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtDate(d: Date) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  return `${days[d.getDay()]} ${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function Home() {
  const [selectedId, setSelectedId] = useState<string>("trading-live");
  const now = useClock(1000);
  const [live, setLive] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  // Scale factor for the 1920×1080 iframe inside the preview wrapper.
  // We measure the wrapper at runtime via ResizeObserver for a perfect fit.
  const [scale, setScale] = useState(0.25);
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const measure = () =>
      Math.min(el.clientWidth / 1920, el.clientHeight / 1080);
    // Defer the first read so we never call setState synchronously in the
    // effect body — only inside the ResizeObserver / rAF callbacks.
    const apply = () => {
      const s = measure();
      setScale(s > 0 ? s : 0.25);
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const raf = requestAnimationFrame(apply);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const selected = useMemo(
    () => SCENES.find((s) => s.id === selectedId) ?? SCENES[0],
    [selectedId],
  );

  const obsUrl = selected.route
    ? `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}${selected.route}`
    : null;

  const clock = now ? fmtClock(now) : "--:--:--";
  const dateStr = now ? fmtDate(now) : "—";

  function copyObsUrl() {
    if (!obsUrl) return;
    navigator.clipboard?.writeText(obsUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F5F5F5]">
      {/* ════════════ HEADER ════════════ */}
      <header
        className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[#27272A]"
        style={{ background: "linear-gradient(180deg, #0F0F0F 0%, #0A0A0A 100%)" }}
      >
        <div className="flex items-center gap-5">
          <W21Lockup channel="parent" size={36} pulse />
          <Separator orientation="vertical" className="h-9 bg-[#27272A]!" />
          <div className="flex flex-col leading-tight">
            <h1
              className="font-mono font-bold uppercase tracking-[0.18em] text-[#F5F5F5]"
              style={{ fontSize: 13 }}
            >
              Smile Live Kit — Broadcast Console
            </h1>
            <span
              className="font-mono uppercase tracking-widest text-[#8B8B8E]"
              style={{ fontSize: 9 }}
            >
              W21 Broadcast Suite · v0.2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="font-mono uppercase tracking-widest gap-1.5 border-[#27272A] text-[#8B8B8E]"
            style={{ fontSize: 9 }}
          >
            <span
              className={cn(
                "inline-block rounded-full",
                live ? "w21-led" : "",
              )}
              style={{
                width: 6,
                height: 6,
                background: live ? "#22C55E" : "#F5A623",
                color: live ? "#22C55E" : "#F5A623",
              }}
            />
            {live ? "ON AIR" : "STANDBY"}
          </Badge>
          <Badge
            variant="outline"
            className="font-mono uppercase tracking-widest border-[#27272A] text-[#F5A623]"
            style={{ fontSize: 9 }}
          >
            DEV
          </Badge>
          <Badge
            variant="outline"
            className="font-mono uppercase tracking-widest border-[#27272A] text-[#8B8B8E]"
            style={{ fontSize: 9 }}
          >
            {dateStr}
          </Badge>
        </div>
      </header>

      {/* ════════════ MAIN AREA ════════════ */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 p-4 min-h-0">
        {/* ── LEFT: Scene list ── */}
        <section
          className="flex flex-col rounded-md border border-[#27272A] overflow-hidden"
          style={{ background: "#0F0F0F" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272A]">
            <span
              className="font-mono font-bold uppercase tracking-widest text-[#F5F5F5]"
              style={{ fontSize: 11 }}
            >
              Scenes
            </span>
            <span
              className="font-mono uppercase tracking-widest text-[#8B8B8E]"
              style={{ fontSize: 9 }}
            >
              {SCENES.length} total
            </span>
          </div>
          <ScrollArea className="flex-1 w21-scroll">
            <div className="flex flex-col gap-1.5 p-2.5">
              {SCENES.map((scene) => (
                <SceneButton
                  key={scene.id}
                  scene={scene}
                  selected={scene.id === selectedId}
                  onSelect={() => setSelectedId(scene.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* ── RIGHT: Preview + URL hint ── */}
        <section className="flex flex-col gap-3 min-h-0">
          {/* Preview frame */}
          <div
            className="flex-1 relative rounded-md border border-[#27272A] overflow-hidden min-h-0"
            style={{ background: "#000" }}
          >
            {/* Header strip above the preview */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-[#0A0A0A] to-transparent">
              <div className="flex items-center gap-3">
                <W21Mark channel={selected.channel} size={18} />
                <span
                  className="font-mono font-bold uppercase tracking-widest text-[#F5F5F5]"
                  style={{ fontSize: 10 }}
                >
                  {selected.title}
                </span>
                <span
                  className="font-mono uppercase tracking-widest text-[#8B8B8E]"
                  style={{ fontSize: 9 }}
                >
                  · 1920 × 1080
                </span>
              </div>
              {selected.route ? (
                <Badge
                  variant="outline"
                  className="font-mono uppercase tracking-widest border-[#22C55E]/40 text-[#22C55E] gap-1.5"
                  style={{ fontSize: 9 }}
                >
                  <span className="w21-led inline-block rounded-full" style={{ width: 5, height: 5, background: "#22C55E", color: "#22C55E" }} />
                  LIVE PREVIEW
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="font-mono uppercase tracking-widest border-[#27272A] text-[#8B8B8E]"
                  style={{ fontSize: 9 }}
                >
                  COMING SOON
                </Badge>
              )}
            </div>

            {/* The preview viewport — aspect locked to 16:9 */}
            <div
              ref={previewWrapRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ top: 36 }}
            >
              {selected.route ? (
                <div
                  className="relative"
                  style={{
                    width: 1920 * scale,
                    height: 1080 * scale,
                  }}
                >
                  <iframe
                    key={`${selected.route}-${refreshKey}`}
                    src={selected.route}
                    title={`${selected.title} preview`}
                    className="absolute top-0 left-0 origin-top-left border-0"
                    style={{
                      width: 1920,
                      height: 1080,
                      transform: `scale(${scale})`,
                      background: "#0A0A0A",
                    }}
                    allow="autoplay; clipboard-write"
                  />
                </div>
              ) : (
                <ComingSoon scene={selected} />
              )}
            </div>

            {/* Bottom info bar */}
            <div className="absolute left-0 right-0 bottom-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-t from-[#0A0A0A] to-transparent">
              <span
                className="font-mono uppercase tracking-widest text-[#8B8B8E]"
                style={{ fontSize: 9 }}
              >
                Scale {(scale * 100).toFixed(0)}%
              </span>
              <span
                className="font-mono tabular-nums text-[#F5F5F5]/80"
                style={{ fontSize: 10 }}
              >
                {clock}
              </span>
            </div>
          </div>

          {/* URL + actions row */}
          <div
            className="flex items-center gap-2 rounded-md border border-[#27272A] px-3 py-2.5"
            style={{ background: "#0F0F0F" }}
          >
            <span
              className="font-mono uppercase tracking-widest text-[#8B8B8E] shrink-0"
              style={{ fontSize: 9 }}
            >
              OBS URL
            </span>
            <Separator orientation="vertical" className="h-5 bg-[#27272A]!" />
            <code
              className="flex-1 font-mono text-[#F5F5F5]/90 truncate"
              style={{ fontSize: 11 }}
            >
              {obsUrl ?? "— no route — select a built scene —"}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyObsUrl}
              disabled={!obsUrl}
              className="font-mono uppercase tracking-widest h-7 gap-1.5 border-[#27272A] text-[#F5F5F5] hover:bg-[#1B1B1E] hover:text-[#F5F5F5]"
              style={{ fontSize: 9 }}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              disabled={!selected.route}
              className="font-mono uppercase tracking-widest h-7 gap-1.5 border-[#27272A] text-[#F5F5F5] hover:bg-[#1B1B1E] hover:text-[#F5F5F5]"
              style={{ fontSize: 9 }}
            >
              <a
                href={selected.route ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3" />
                Open Fullscreen
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* ════════════ FOOTER (sticky bottom) ════════════ */}
      <footer
        className="mt-auto flex items-center justify-between gap-4 px-5 py-3 border-t border-[#27272A]"
        style={{ background: "#0F0F0F" }}
      >
        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setLive((v) => !v)}
            className={cn(
              "font-mono uppercase tracking-widest h-9 gap-2 border",
              live
                ? "bg-[#DC2626] hover:bg-[#DC2626]/85 text-white border-[#DC2626]"
                : "bg-[#22C55E] hover:bg-[#22C55E]/85 text-[#0A0A0A] border-[#22C55E]",
            )}
            style={{ fontSize: 10 }}
          >
            {live ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
            {live ? "Stop" : "Go Live"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!live}
            onClick={() => setLive(false)}
            className="font-mono uppercase tracking-widest h-9 gap-2 border-[#27272A] text-[#F5F5F5] hover:bg-[#1B1B1E] hover:text-[#F5F5F5]"
            style={{ fontSize: 10 }}
          >
            <Square className="size-3.5" />
            Stop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="font-mono uppercase tracking-widest h-9 gap-2 border-[#27272A] text-[#F5F5F5] hover:bg-[#1B1B1E] hover:text-[#F5F5F5]"
            style={{ fontSize: 10 }}
          >
            <RefreshCw className="size-3.5" />
            Refresh Scene
          </Button>
        </div>

        {/* Clock + mark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="size-3.5 text-[#00F0FF]" />
            <span
              className="font-mono uppercase tracking-widest text-[#8B8B8E]"
              style={{ fontSize: 9 }}
            >
              ON AIR
            </span>
            <span
              className="w21-led inline-block rounded-full"
              style={{
                width: 6,
                height: 6,
                background: live ? "#22C55E" : "#8B8B8E",
                color: live ? "#22C55E" : "#8B8B8E",
              }}
            />
          </div>
          <Separator orientation="vertical" className="h-6 bg-[#27272A]!" />
          <div className="flex items-center gap-2">
            <Clock3 className="size-3.5 text-[#00F0FF]" />
            <span
              className="font-mono font-bold tabular-nums text-[#00F0FF]"
              style={{ fontSize: 14 }}
            >
              {clock}
            </span>
            <span
              className="font-mono uppercase tracking-widest text-[#8B8B8E]"
              style={{ fontSize: 9 }}
            >
              EAT
            </span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-[#27272A]!" />
          <W21Mark channel="parent" size={22} />
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════ */

function SceneButton({
  scene,
  selected,
  onSelect,
}: {
  scene: SceneEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = scene.channel;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/40",
        selected
          ? "border-[#F5A623]/60 bg-[#1B1B1E]"
          : "border-[#27272A] bg-[#0A0A0A]/40 hover:border-[#3F3F46] hover:bg-[#161616]",
      )}
    >
      {/* Channel accent left stripe */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 rounded-l-md"
        style={{
          width: 3,
          background: `var(--ch-${accent})`,
          opacity: selected ? 1 : 0.45,
        }}
      />
      <W21Mark channel={scene.channel} size={28} pulse={selected} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-bold tracking-wide text-[#F5F5F5] truncate"
            style={{ fontSize: 12 }}
          >
            {scene.title}
          </span>
          <StatusPill status={scene.status} />
        </div>
        <span
          className="font-mono text-[#8B8B8E] truncate block mt-0.5"
          style={{ fontSize: 9 }}
        >
          {scene.tagline}
        </span>
      </div>
    </button>
  );
}

function StatusPill({ status }: { status: SceneStatus }) {
  const map = {
    live: { label: "LIVE", color: "#22C55E" },
    ready: { label: "READY", color: "#00F0FF" },
    soon: { label: "SOON", color: "#8B8B8E" },
  } as const;
  const { label, color } = map[status];
  return (
    <span
      className="font-mono uppercase tracking-widest shrink-0"
      style={{
        fontSize: 8,
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        padding: "1px 5px",
        borderRadius: 2,
        letterSpacing: "0.1em",
      }}
    >
      {label}
    </span>
  );
}

function ComingSoon({ scene }: { scene: SceneEntry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="relative">
        <W21Mark channel={scene.channel} size={64} />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span
          className="font-mono font-bold uppercase tracking-[0.2em] text-[#F5F5F5]"
          style={{ fontSize: 14 }}
        >
          {scene.title}
        </span>
        <span
          className="font-mono uppercase tracking-widest text-[#8B8B8E]"
          style={{ fontSize: 10 }}
        >
          Scene route not yet built
        </span>
      </div>
      <p
        className="font-mono text-[#8B8B8E] max-w-md leading-relaxed"
        style={{ fontSize: 11 }}
      >
        This scene is on the build roadmap. The composition spec, channel
        accent, and lockup are already wired — only the 1920×1080 route is
        pending. Use the W21 design tokens & <code className="text-[#F5F5F5]">@/components/w21/*</code> kit to scaffold it.
      </p>
      <div
        className="mt-2 flex items-center gap-2 font-mono uppercase tracking-widest"
        style={{ fontSize: 9, color: "var(--ch-" + scene.channel + ")" }}
      >
        <span className="w21-blink">●</span>
        <span>Coming soon</span>
      </div>
    </div>
  );
}
