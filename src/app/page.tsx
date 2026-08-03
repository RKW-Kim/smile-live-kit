"use client";

/**
 * Smile Live Kit — SMILE // CONTROL console (control panel at `/`)
 * ─────────────────────────────────────────────────────────────────
 * The ONLY screen a human touches during a stream.
 * Grandma-operable: pick a scene → see live preview → send URL to OBS.
 *
 * The aesthetic is a 1:1 match of the original v1 `control.html`:
 *   • Dark `#0a0f0d` canvas with green radial glow + scanlines + vignette
 *   • "SMILE//CONTROL" brand lockup in Chakra Petch (green `//`)
 *   • Hairline `--line` borders, `--panel-solid` cards, green corner brackets
 *   • Status pills, scene cards, scaled preview iframe, sticky footer
 *
 * The actual broadcast scenes are served VERBATIM from /public/scenes/
 * — the original v1 HTML/CSS/SVG/JS, untouched. This control panel only
 * links to them and embeds them in a scaled preview iframe.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";

/* ─── Scene catalog ─────────────────────────────────────────────── */
type SceneStatus = "live" | "ready" | "soon";

type Scene = {
  id: string;
  title: string;
  file: string;
  status: SceneStatus;
  tagline: string;
  w: number;
  h: number;
};

const SCENES: Scene[] = [
  {
    id: "starting-soon",
    title: "Starting Soon",
    file: "01-starting-soon.html",
    status: "ready",
    tagline: "Pre-market loading screen",
    w: 1920,
    h: 1080,
  },
  {
    id: "countdown",
    title: "Countdown",
    file: "02-countdown.html",
    status: "ready",
    tagline: "Opening bell countdown",
    w: 1920,
    h: 1080,
  },
  {
    id: "live",
    title: "Live",
    file: "03-live.html",
    status: "live",
    tagline: "Main broadcast overlay",
    w: 1920,
    h: 1080,
  },
  {
    id: "brb",
    title: "BRB",
    file: "04-brb.html",
    status: "ready",
    tagline: "Be right back card",
    w: 1920,
    h: 1080,
  },
  {
    id: "ending",
    title: "Ending",
    file: "05-ending.html",
    status: "ready",
    tagline: "Session closed outro",
    w: 1920,
    h: 1080,
  },
  {
    id: "alerts",
    title: "Alerts",
    file: "08-alerts.html",
    status: "ready",
    tagline: "Alert popup overlay",
    w: 1920,
    h: 1080,
  },
  {
    id: "ticker",
    title: "Market Ticker",
    file: "market-ticker.html",
    status: "ready",
    tagline: "Scrolling price ticker",
    w: 1920,
    h: 76,
  },
  {
    id: "chart",
    title: "Mini Chart",
    file: "mini-chart.html",
    status: "ready",
    tagline: "Live candlestick widget",
    w: 460,
    h: 300,
  },
  {
    id: "bg",
    title: "Ambient BG",
    file: "00-bg.html",
    status: "ready",
    tagline: "Background layer",
    w: 1920,
    h: 1080,
  },
  {
    id: "cam",
    title: "Camera Test",
    file: "test-cam.html",
    status: "soon",
    tagline: "Simulated camera feed",
    w: 1280,
    h: 720,
  },
  {
    id: "control",
    title: "Control Panel",
    file: "control.html",
    status: "ready",
    tagline: "The SMILE // CONTROL dashboard",
    w: 1240,
    h: 900,
  },
];

/* ─── Status pill metadata ──────────────────────────────────────── */
const STATUS_META: Record<
  SceneStatus,
  { label: string; className: string }
> = {
  live: { label: "LIVE", className: "on" },
  ready: { label: "READY", className: "" },
  soon: { label: "SOON", className: "warn" },
};

/* ─── Clock helpers ─────────────────────────────────────────────── */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function fmtClock(d: Date | null): string {
  if (!d) return "--:--:--";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Page() {
  const clock = useClock(1000);
  const [activeId, setActiveId] = useState<string>("live");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const activeScene = useMemo<Scene>(
    () => SCENES.find((s) => s.id === activeId) ?? SCENES[2],
    [activeId],
  );

  /* Preview iframe auto-fit: ResizeObserver computes scale so the
     scene's native w×h fits inside the viewport container. */
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [scale, setScale] = useState<number>(0.5);

  useEffect(() => {
    const vp = viewportRef.current;
    const iframe = iframeRef.current;
    if (!vp || !iframe) return;

    const apply = () => {
      const cw = vp.clientWidth;
      const ch = vp.clientHeight;
      if (cw === 0 || ch === 0) return;
      const s = Math.min(cw / activeScene.w, ch / activeScene.h);
      const next = s > 0 ? s : 0.1;
      setScale(next);
      iframe.style.width = `${activeScene.w}px`;
      iframe.style.height = `${activeScene.h}px`;
      iframe.style.transform = `scale(${next})`;
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [activeScene]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  /* Derived URL — relative path the user pastes into OBS */
  const scenePath = useMemo(
    () => `/scenes/${activeScene.file}`,
    [activeScene.file],
  );
  const sceneUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? scenePath
        : `${window.location.origin}${scenePath}`,
    [scenePath],
  );

  /* Actions */
  const handleSceneSelect = useCallback((id: string) => {
    setActiveId(id);
    setIframeKey((k) => k + 1);
  }, []);

  const handleGoLive = useCallback(() => {
    setIsLive((prev) => {
      const next = !prev;
      setToast(next ? "ON AIR · LIVE" : "STANDBY");
      return next;
    });
  }, []);

  const handleStop = useCallback(() => {
    setIsLive(false);
    setToast("STOPPED");
  }, []);

  const handleRefresh = useCallback(() => {
    setIframeKey((k) => k + 1);
    setToast("SCENE REFRESHED");
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sceneUrl);
      setCopied(true);
      setToast("URL COPIED");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setToast("COPY FAILED — SELECT MANUALLY");
    }
  }, [sceneUrl]);

  const activeStatus = STATUS_META[activeScene.status];

  return (
    <div className="smile-console-bg flex flex-col">
      <div className="relative z-10 mx-auto w-full max-w-[1240px] flex-1 px-[22px] pb-[60px] pt-[22px]">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <header className="mb-5 flex flex-wrap items-end gap-[18px] border-b border-[var(--line)] pb-4">
          <div className="smile-brand">
            SMILE<em>{"//"}</em>CONTROL
            <small>live kit command centre · v1</small>
          </div>
          <div className="flex-1" />
          <span
            className={cn(
              "smile-pill",
              isLive ? "on" : "warn",
            )}
          >
            <span className="dot" />
            OBS <b className="ml-1 font-semibold">
              {isLive ? "BROADCASTING" : "STANDBY"}
            </b>
          </span>
          <span className="smile-pill on">
            <span className="dot" />
            CANVAS <b className="ml-1 font-semibold">1920×1080</b>
          </span>
          <div className="smile-clock" aria-label="Live clock">
            {fmtClock(clock)}
          </div>
        </header>

        {/* ─── Main grid: scenes (left) + preview (right) ─────────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Scenes list */}
          <section
            className="smile-panel col-span-12 md:col-span-5 lg:col-span-4"
            aria-label="Scene list"
          >
            <h2>Scenes · {SCENES.length}</h2>
            <div className="grid max-h-[68vh] grid-cols-1 gap-2 overflow-y-auto smile-scroll pr-1">
              {SCENES.map((scene) => {
                const meta = STATUS_META[scene.status];
                const active = scene.id === activeId;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    className={cn("smile-scene", active && "active")}
                    onClick={() => handleSceneSelect(scene.id)}
                    aria-pressed={active}
                  >
                    <div className="nm">
                      <SmileMarkMini />
                      <span className="flex-1">{scene.title}</span>
                      <span
                        className={cn("smile-pill !px-2 !py-1 !text-[9px]", meta.className)}
                      >
                        <span className="dot" />
                        {meta.label}
                      </span>
                    </div>
                    <div className="tag">{scene.tagline}</div>
                    <div className="mt-1 font-mono text-[9px] text-[var(--muted)]">
                      {scene.w}×{scene.h} · /scenes/{scene.file}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preview viewport */}
          <section
            className="col-span-12 flex flex-col gap-3 md:col-span-7 lg:col-span-8"
            aria-label="Live preview"
          >
            <div className="smile-panel !p-3">
              <div className="mb-2 flex items-center gap-3 px-1">
                <h2 className="!mb-0 !flex-row">
                  <span>Preview</span>
                </h2>
                <span className="smile-pill on">
                  <span className="dot" />
                  {activeScene.title.toUpperCase()}
                </span>
                <div className="flex-1" />
                <span className="font-mono text-[10px] text-[var(--muted)]">
                  {activeScene.w}×{activeScene.h} · {(scale * 100).toFixed(0)}%
                </span>
              </div>

              {/* 16:9 viewport (most scenes). The iframe is scaled to fit. */}
              <div
                ref={viewportRef}
                className="smile-viewport aspect-[16/9] w-full"
              >
                <div className="smile-iframe-wrap">
                  <iframe
                    ref={iframeRef}
                    key={iframeKey}
                    src={scenePath}
                    title={`Preview: ${activeScene.title}`}
                    className="smile-iframe"
                    loading="eager"
                    allow="autoplay; clipboard-write; microphone; camera"
                  />
                </div>
              </div>
            </div>

            {/* URL bar — OBS Browser Source URL */}
            <div className="smile-panel !p-3">
              <h2>OBS Browser Source URL</h2>
              <div className="smile-urlbar">
                <span className="text-[var(--live)]">▸</span>
                <code>{sceneUrl}</code>
                <button
                  type="button"
                  className="smile-btn"
                  onClick={handleCopy}
                  aria-label="Copy URL to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> COPY
                    </>
                  )}
                </button>
                <a
                  href={scenePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="smile-btn"
                  aria-label="Open scene in new tab"
                >
                  <ExternalLink className="h-3 w-3" /> OPEN FULLSCREEN
                </a>
              </div>
              <p className="mt-2 px-1 font-mono text-[10px] leading-relaxed text-[var(--muted)]">
                Paste this URL into an OBS Browser Source at{" "}
                {activeScene.w}×{activeScene.h} to broadcast this scene.
              </p>
            </div>
          </section>

          {/* ─── Quick actions panel ──────────────────────────────── */}
          <section
            className="smile-panel col-span-12 md:col-span-5 lg:col-span-4"
            aria-label="Quick actions"
          >
            <h2>Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href="/scenes/01-starting-soon.html"
                target="_blank"
                rel="noopener noreferrer"
                className="smile-btn"
              >
                STARTING SOON
              </a>
              <a
                href="/scenes/03-live.html"
                target="_blank"
                rel="noopener noreferrer"
                className="smile-btn"
              >
                LIVE
              </a>
              <a
                href="/scenes/04-brb.html"
                target="_blank"
                rel="noopener noreferrer"
                className="smile-btn"
              >
                BRB
              </a>
              <a
                href="/scenes/05-ending.html"
                target="_blank"
                rel="noopener noreferrer"
                className="smile-btn"
              >
                ENDING
              </a>
              <a
                href="/scenes/control.html"
                target="_blank"
                rel="noopener noreferrer"
                className="smile-btn amb"
              >
                CONTROL.HTML
              </a>
            </div>
          </section>

          {/* ─── Diagnostics panel ────────────────────────────────── */}
          <section
            className="smile-panel col-span-12 md:col-span-7 lg:col-span-8"
            aria-label="Diagnostics"
          >
            <h2>Diagnostics</h2>
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr>
                  {["source", "w", "h", "scale", "status"].map((th) => (
                    <th
                      key={th}
                      className="border-b border-[var(--line)] px-2 py-1.5 text-left font-display text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-[#0e1613]">
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[#e8f1ec]">
                    {activeScene.title}
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    {activeScene.w}
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    {activeScene.h}
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    {(scale * 100).toFixed(0)}%
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5">
                    <span className="text-[var(--live)]">
                      {isLive ? "BROADCASTING" : "PREVIEW"}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#0e1613]">
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[#e8f1ec]">
                    SmileMark Engine
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    100
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    100
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    100%
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5">
                    <span className="text-[var(--live)]">LOADED</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#0e1613]">
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[#e8f1ec]">
                    Live Feed (Binance)
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    —
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    —
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5 text-[var(--cyan)]">
                    —
                  </td>
                  <td className="border-b border-[#141d18] px-2 py-1.5">
                    <span className="text-[var(--amb)]">STANDBY</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {/* ─── Footer (sticky) ─────────────────────────────────────── */}
      <footer className="relative z-10 mt-auto border-t border-[var(--line)] bg-[var(--panel-solid)]">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-3 px-[22px] py-3">
          <button
            type="button"
            className={cn("smile-btn", isLive && "active")}
            onClick={handleGoLive}
            aria-pressed={isLive}
          >
            {isLive ? (
              <>
                <Radio className="h-3.5 w-3.5" /> ON AIR
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> GO LIVE
              </>
            )}
          </button>
          <button
            type="button"
            className={cn("smile-btn danger", isLive && "active")}
            onClick={handleStop}
            disabled={!isLive}
          >
            <Square className="h-3.5 w-3.5" /> STOP
          </button>
          <button
            type="button"
            className="smile-btn"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" /> REFRESH SCENE
          </button>

          <div className="flex-1" />

          <span className="font-mono text-[11px] text-[var(--muted)]">
            {fmtDate(clock)}
          </span>
          <div className="smile-clock !text-[18px]">{fmtClock(clock)}</div>
          <SmileMarkMini />
        </div>
      </footer>

      {/* ─── Toast ───────────────────────────────────────────────── */}
      {toast && <div className="smile-toast">{toast}</div>}
    </div>
  );
}

/* ─── SmileMark mini (static inline SVG, matches smile-mark.svg) ─── */
function SmileMarkMini() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="22"
      height="22"
      aria-hidden="true"
      className="inline-block shrink-0"
    >
      <circle cx="50" cy="50" r="48" fill="#FFC800" />
      <circle cx="31" cy="35" r="5.5" fill="#000000" />
      <circle cx="69" cy="35" r="5.5" fill="#000000" />
      <path
        d="M 20 48 A 30 30 0 0 0 80 48"
        fill="none"
        stroke="#000000"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
