"use client";

/**
 * Smile Live Kit — Broadcast Console (control panel at `/`)
 * ─────────────────────────────────────────────────────────────
 * The ONLY screen a human touches during a stream.
 * Grandma-operable: pick a scene → see live preview → go live.
 *
 *  ┌─ Header ─────────────────────────────────────────────┐
 *  │ [😊 smile]   SMILE // CONTROL · ON AIR · clock        │
 *  ├──────────────┬───────────────────────────────────────┤
 *  │ Scene list   │  Live preview (1920×1080 → scaled)    │
 *  │ (left)       │  + OBS URL bar + Copy + Fullscreen    │
 *  │              │                                       │
 *  ├──────────────┴───────────────────────────────────────┤
 *  │ Footer: [Go Live] [Stop] [Refresh] · clock · mark    │
 *  └───────────────────────────────────────────────────────┘
 *
 * Aesthetic: warm, friendly, dark green-tinted bg with subtle
 * radial glows + corner-bracket panels. Manrope for display,
 * Inter for body/numbers. Yellow accents, green live, red stop.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SmileLockup, SmileMark } from "@/components/smile";
import type { SmileBrandId } from "@/lib/smile/channels";
import { useClock } from "@/hooks/use-clock";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  RefreshCw,
  Play,
  Square,
  Copy,
  Check,
  Radio,
  Sparkles,
} from "lucide-react";

/* ─── Scene catalog ─────────────────────────────────────────── */
type SceneStatus = "live" | "ready" | "soon";

interface SceneEntry {
  id: string;
  title: string;
  brand: SmileBrandId;
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
    brand: "smile",
    status: "soon",
    tagline: "Looping intro · countdown",
  },
  {
    id: "trading-live",
    title: "Trading Live",
    brand: "w21trading",
    route: "/scenes/trading-live",
    status: "live",
    tagline: "Main broadcast desk · 1920×1080",
  },
  {
    id: "break",
    title: "Break / BRB",
    brand: "smile",
    status: "soon",
    tagline: "Intermission card · music bed",
  },
  {
    id: "news",
    title: "News",
    brand: "w21news",
    status: "soon",
    tagline: "Headline ticker · anchor frame",
  },
  {
    id: "interview",
    title: "Interview",
    brand: "w21culture",
    status: "soon",
    tagline: "Two-shot · lower-third name",
  },
  {
    id: "education",
    title: "Education",
    brand: "w21education",
    status: "soon",
    tagline: "Lesson deck · code window",
  },
  {
    id: "ending",
    title: "Ending",
    brand: "smile",
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
  // Measured at runtime via ResizeObserver for a perfect fit.
  const [scale, setScale] = useState(0.25);
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const measure = () =>
      Math.min(el.clientWidth / 1920, el.clientHeight / 1080);
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
    <div
      className="min-h-screen flex flex-col text-[var(--paper)] relative"
      style={{
        background:
          "radial-gradient(circle at 18% 12%, rgba(14,203,129,0.08) 0%, transparent 40%), radial-gradient(circle at 88% 92%, rgba(255,193,7,0.06) 0%, transparent 42%), var(--ink)",
      }}
    >
      {/* Subtle scanline texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* ════════════ HEADER ════════════ */}
      <header
        className="relative z-10 flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[var(--line)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.95) 100%)",
        }}
      >
        <div className="flex items-center gap-5">
          <SmileLockup brand="smile" size={36} pulse />
          <Separator orientation="vertical" className="h-9 bg-[var(--line)]!" />
          <div className="flex flex-col leading-tight">
            <h1
              className="font-display font-extrabold tracking-tight"
              style={{ fontSize: 16 }}
            >
              <span style={{ color: "var(--paper)" }}>SMILE</span>
              <span style={{ color: "var(--live)" }}>{" // "}</span>
              <span style={{ color: "var(--paper)" }}>CONTROL</span>
            </h1>
            <span
              className="uppercase tracking-widest text-[var(--muted)]"
              style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
            >
              live kit command centre · v1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="uppercase tracking-widest gap-1.5 border-[var(--line)]"
            style={{
              fontSize: 10,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              padding: "4px 10px",
              color: live ? "var(--live)" : "var(--yellow)",
              borderColor: live
                ? "color-mix(in srgb, var(--live) 45%, transparent)"
                : "color-mix(in srgb, var(--yellow) 35%, transparent)",
              background: live
                ? "color-mix(in srgb, var(--live) 10%, transparent)"
                : "color-mix(in srgb, var(--yellow) 10%, transparent)",
            }}
          >
            <span
              className={cn(
                "inline-block rounded-full",
                live ? "smile-led" : "",
              )}
              style={{
                width: 6,
                height: 6,
                background: live ? "var(--live)" : "var(--yellow)",
              }}
            />
            {live ? "ON AIR" : "STANDBY"}
          </Badge>
          <Badge
            variant="outline"
            className="uppercase tracking-widest border-[var(--line)] text-[var(--muted)]"
            style={{
              fontSize: 10,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              padding: "4px 10px",
            }}
          >
            {dateStr}
          </Badge>
        </div>
      </header>

      {/* ════════════ MAIN AREA ════════════ */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 p-4 min-h-0">
        {/* ── LEFT: Scene list ── */}
        <section className="flex flex-col rounded-lg border border-[var(--line)] overflow-hidden smile-panel--bracket">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[var(--yellow)]" />
              <span
                className="font-display font-bold uppercase tracking-widest text-[var(--paper)]"
                style={{ fontSize: 12 }}
              >
                Scenes
              </span>
            </div>
            <span
              className="uppercase tracking-widest text-[var(--muted)]"
              style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
            >
              {SCENES.length} total
            </span>
          </div>
          <ScrollArea className="flex-1 smile-scroll">
            <div className="flex flex-col gap-2 p-2.5">
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
            className="flex-1 relative rounded-lg border border-[var(--line)] overflow-hidden min-h-0 smile-panel--bracket"
            style={{ background: "#000" }}
          >
            {/* Header strip above the preview */}
            <div
              className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-2.5"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <SmileMark size={22} pulse />
                <span
                  className="font-display font-extrabold tracking-tight text-[var(--paper)]"
                  style={{ fontSize: 13 }}
                >
                  {selected.title}
                </span>
                <span
                  className="uppercase tracking-widest text-[var(--muted)]"
                  style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
                >
                  · 1920 × 1080
                </span>
              </div>
              {selected.route ? (
                <Badge
                  variant="outline"
                  className="uppercase tracking-widest gap-1.5"
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    padding: "3px 9px",
                    color: "var(--live)",
                    borderColor:
                      "color-mix(in srgb, var(--live) 40%, transparent)",
                    background:
                      "color-mix(in srgb, var(--live) 8%, transparent)",
                  }}
                >
                  <span
                    className="smile-led inline-block rounded-full"
                    style={{
                      width: 5,
                      height: 5,
                      background: "var(--live)",
                    }}
                  />
                  LIVE PREVIEW
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="uppercase tracking-widest border-[var(--line)] text-[var(--muted)]"
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    padding: "3px 9px",
                  }}
                >
                  COMING SOON
                </Badge>
              )}
            </div>

            {/* The preview viewport — aspect locked to 16:9 */}
            <div
              ref={previewWrapRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ top: 44, bottom: 28 }}
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
                      background: "var(--ink)",
                    }}
                    allow="autoplay; clipboard-write"
                  />
                </div>
              ) : (
                <ComingSoon scene={selected} />
              )}
            </div>

            {/* Bottom info bar */}
            <div
              className="absolute left-0 right-0 bottom-0 z-10 flex items-center justify-between px-4 py-1.5"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)",
              }}
            >
              <span
                className="uppercase tracking-widest text-[var(--muted)]"
                style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
              >
                Scale {(scale * 100).toFixed(0)}%
              </span>
              <span
                className="tabular-nums text-[var(--paper)]"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-body)",
                  opacity: 0.85,
                }}
              >
                {clock}
              </span>
            </div>
          </div>

          {/* URL + actions row */}
          <div
            className="flex items-center gap-2.5 rounded-lg border border-[var(--line)] px-3.5 py-2.5"
            style={{ background: "var(--panel)" }}
          >
            <span
              className="uppercase tracking-widest text-[var(--muted)] shrink-0"
              style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              OBS URL
            </span>
            <Separator orientation="vertical" className="h-5 bg-[var(--line)]!" />
            <code
              className="flex-1 truncate tabular-nums"
              style={{
                fontSize: 11,
                fontFamily: "var(--font-body)",
                color: "var(--paper)",
                opacity: 0.92,
              }}
            >
              {obsUrl ?? "— no route — select a built scene —"}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyObsUrl}
              disabled={!obsUrl}
              className="uppercase tracking-widest h-7 gap-1.5 border-[var(--line)] text-[var(--paper)] hover:bg-[var(--panel-2)] hover:text-[var(--paper)] hover:border-[var(--yellow)]"
              style={{
                fontSize: 10,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              disabled={!selected.route}
              className="uppercase tracking-widest h-7 gap-1.5 border-[var(--line)] text-[var(--paper)] hover:bg-[var(--panel-2)] hover:text-[var(--paper)] hover:border-[var(--yellow)]"
              style={{
                fontSize: 10,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}
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
        className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-t border-[var(--line)]"
        style={{ background: "var(--panel)" }}
      >
        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setLive((v) => !v)}
            className={cn(
              "uppercase tracking-widest h-9 gap-2 border font-display font-bold",
            )}
            style={{
              fontSize: 11,
              background: live ? "var(--down)" : "var(--up)",
              color: live ? "#fff" : "var(--ink)",
              borderColor: live ? "var(--down)" : "var(--up)",
            }}
          >
            {live ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
            {live ? "Stop" : "Go Live"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!live}
            onClick={() => setLive(false)}
            className="uppercase tracking-widest h-9 gap-2 border-[var(--line)] text-[var(--paper)] hover:bg-[var(--panel-2)] hover:text-[var(--paper)] font-display font-bold"
            style={{ fontSize: 11 }}
          >
            <Square className="size-3.5" />
            Stop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="uppercase tracking-widest h-9 gap-2 border-[var(--line)] text-[var(--paper)] hover:bg-[var(--panel-2)] hover:text-[var(--paper)] font-display font-bold"
            style={{ fontSize: 11 }}
          >
            <RefreshCw className="size-3.5" />
            Refresh Scene
          </Button>
        </div>

        {/* Clock + mark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="size-3.5 text-[var(--live)]" />
            <span
              className="uppercase tracking-widest text-[var(--muted)]"
              style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
            >
              ON AIR
            </span>
            <span
              className={cn(
                "inline-block rounded-full",
                live ? "smile-led" : "",
              )}
              style={{
                width: 6,
                height: 6,
                background: live ? "var(--live)" : "var(--muted)",
              }}
            />
          </div>
          <Separator orientation="vertical" className="h-6 bg-[var(--line)]!" />
          <div className="flex items-center gap-2">
            <span
              className="font-display font-extrabold tabular-nums"
              style={{
                fontSize: 16,
                color: "var(--yellow)",
                fontFeatureSettings: '"tnum" 1, "zero" 1',
              }}
            >
              {clock}
            </span>
            <span
              className="uppercase tracking-widest text-[var(--muted)]"
              style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
            >
              EAT
            </span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-[var(--line)]!" />
          <SmileMark size={24} pulse />
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
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--yellow)_40%,transparent)]",
        selected
          ? "border-[color-mix(in_srgb,var(--live)_55%,transparent)] bg-[var(--panel-2)]"
          : "border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_40%,transparent)] hover:border-[color-mix(in_srgb,var(--yellow)_40%,transparent)] hover:bg-[var(--panel)]",
      )}
      style={
        selected
          ? {
              boxShadow:
                "0 0 0 1px color-mix(in srgb, var(--live) 25%, transparent), 0 0 18px color-mix(in srgb, var(--live) 20%, transparent)",
            }
          : undefined
      }
    >
      <SmileMark
        size={28}
        mood={selected ? "bounce" : "idle"}
        pulse={selected}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-display font-bold tracking-tight text-[var(--paper)] truncate"
            style={{ fontSize: 13 }}
          >
            {scene.title}
          </span>
          <StatusPill status={scene.status} />
        </div>
        <span
          className="text-[var(--muted)] truncate block mt-0.5"
          style={{ fontSize: 10, fontFamily: "var(--font-body)" }}
        >
          {scene.tagline}
        </span>
      </div>
    </button>
  );
}

function StatusPill({ status }: { status: SceneStatus }) {
  const map = {
    live: { label: "LIVE", color: "var(--live)" },
    ready: { label: "READY", color: "var(--sky)" },
    soon: { label: "SOON", color: "var(--muted)" },
  } as const;
  const { label, color } = map[status];
  return (
    <span
      className="uppercase tracking-widest shrink-0"
      style={{
        fontSize: 9,
        color,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        padding: "1px 7px",
        borderRadius: 999,
        letterSpacing: "0.1em",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
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
        <SmileMark size={72} pulse mood="look" />
        <div
          className="orbit"
          aria-hidden
          style={{
            width: 120,
            height: 120,
            top: -24,
            left: -24,
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span
          className="font-display font-extrabold uppercase tracking-tight text-[var(--paper)]"
          style={{ fontSize: 16 }}
        >
          {scene.title}
        </span>
        <span
          className="uppercase tracking-widest text-[var(--muted)]"
          style={{ fontSize: 11, fontFamily: "var(--font-body)" }}
        >
          Scene route not yet built
        </span>
      </div>
      <p
        className="text-[var(--muted)] max-w-md leading-relaxed"
        style={{ fontSize: 12, fontFamily: "var(--font-body)" }}
      >
        This scene is on the build roadmap. The composition spec, brand
        accent, and lockup are already wired — only the 1920×1080 route
        is pending. Use the Smile design tokens &{" "}
        <code style={{ color: "var(--yellow)" }}>
          @/components/smile/*
        </code>{" "}
        kit to scaffold it.
      </p>
      <div
        className="mt-2 flex items-center gap-2 uppercase tracking-widest"
        style={{
          fontSize: 10,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "var(--yellow)",
        }}
      >
        <span className="smile-blink" aria-hidden>
          ●
        </span>
        <span>Coming soon</span>
      </div>
    </div>
  );
}
