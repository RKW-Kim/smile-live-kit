"use client";

/**
 * W21 Trading Live — Scene 07  (HERO SCENE)
 * ─────────────────────────────────────────────────────────────
 * Renders at EXACTLY 1920×1080 for OBS Browser Source consumption.
 *
 * Layout grid (absolute, pixel-perfect):
 *
 *   ┌─────────────────────────────────────────────────────── y=0
 *   │ TOP BAR  36px — mark · "LONDON SESSION — LIVE ANALYSIS" · elapsed   │
 *   ├─────────────────────────────────────────────────────── y=36
 *   │                                            ┌──────────┐
 *   │  ┌────────────────────────────────────┐    │ SIGNALS  │
 *   │  │ EUR/USD — H4   [chart frame]       │    │  panel   │
 *   │  │                                    │    │          │
 *   │  │                                    │    │          │
 *   │  └────────────────────────────────────┘    │          │
 *   │  ┌──────────┐  ┌──────────────────────┐    │          │
 *   │  │ CAM—01   │  │ SESSION / RISK       │    │          │
 *   │  │ webcam   │  │                      │    │          │
 *   │  └──────────┘  └──────────────────────┘    └──────────┘
 *   ├─────────────────────────────────────────────────────── y=1023
 *   │ LOWER BAR 55px — lockup · ticker · clock                            │
 *   ├─────────────────────────────────────────────────────── y=1078
 *   │ ████████████ 2px signal-cyan stripe                                  │
 *   └─────────────────────────────────────────────────────── y=1080
 *
 * Mock data is used throughout — real feeds arrive in a later milestone.
 */

import { useRef } from "react";
import { W21Lockup, W21Mark } from "@/components/w21";
import { SignalCard, Ticker } from "@/components/w21";
import type { SignalCardProps, TickerProps } from "@/components/w21";
import { useClock } from "@/hooks/use-clock";

// ─── Mock data ───────────────────────────────────────────────
const SIGNALS: SignalCardProps[] = [
  {
    pair: "EUR/USD",
    direction: "BUY",
    entry: 1.0864,
    stopLoss: 1.0832,
    takeProfit: 1.0921,
    confidence: 78,
    strategy: "Breakout",
  },
  {
    pair: "GBP/JPY",
    direction: "SELL",
    entry: 198.42,
    stopLoss: 199.05,
    takeProfit: 197.18,
    confidence: 64,
    strategy: "Reversion",
  },
  {
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2418.55,
    stopLoss: 2398.0,
    takeProfit: 2458.0,
    confidence: 82,
    strategy: "Trend",
  },
];

const TICKER_ITEMS: TickerProps["items"] = [
  { symbol: "EUR/USD", price: 1.0864, changePct: 0.32 },
  { symbol: "GBP/USD", price: 1.2718, changePct: -0.14 },
  { symbol: "USD/JPY", price: 157.21, changePct: 0.45 },
  { symbol: "GBP/JPY", price: 198.42, changePct: -0.28 },
  { symbol: "AUD/USD", price: 0.6612, changePct: 0.09 },
  { symbol: "USD/CAD", price: 1.3714, changePct: -0.21 },
  { symbol: "XAU/USD", price: 2418.55, changePct: 0.82 },
  { symbol: "BTC/USD", price: 64218.0, changePct: 1.46 },
  { symbol: "ETH/USD", price: 3412.5, changePct: -0.74 },
  { symbol: "WTI", price: 81.34, changePct: 0.55 },
  { symbol: "DXY", price: 104.82, changePct: -0.18 },
  { symbol: "SPX", price: 5525.6, changePct: 0.27 },
];

// ─── Time helpers ────────────────────────────────────────────
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function fmtClock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TradingLiveScene() {
  const now = useClock(1000);
  const startTimeRef = useRef<number>(Date.now());

  const elapsedSec = now
    ? Math.floor((now.getTime() - startTimeRef.current) / 1000)
    : 0;
  const clock = now ? fmtClock(now) : "--:--:--";
  const elapsed = fmtElapsed(elapsedSec);
  const tsEAT = now ? `${fmtClock(now)} EAT` : "--:--:-- EAT";

  return (
    <div
      className="w21-scene-root w21-scanlines w21-noise"
      style={{ position: "relative" }}
    >
      {/* ── Background layers ─────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #151515 1px, transparent 1px)",
          backgroundSize: "calc(100% / 12) 100%",
          opacity: 0.05,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #151515 1px, transparent 1px)",
          backgroundSize: "100% 80px",
          opacity: 0.05,
        }}
      />
      {/* Cross-hair + markers at major intersections (7%) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,245,245,0.07) 1px, transparent 1.5px)",
          backgroundSize: "160px 160px",
        }}
      />

      {/* ══════════════ TOP BAR (y=0, h=36) ══════════════ */}
      <header
        className="absolute left-0 right-0 flex items-center justify-between px-6"
        style={{ top: 0, height: 36 }}
      >
        {/* Left: small W21Mark */}
        <div className="flex items-center gap-3">
          <W21Mark channel="trading" size={22} />
          <span
            className="font-mono uppercase tracking-[0.18em] text-grid-white/55"
            style={{ fontSize: 10 }}
          >
            W21 · TRADING DESK
          </span>
        </div>

        {/* Center: session title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span
            className="font-mono font-bold uppercase tracking-[0.28em] text-grid-white"
            style={{ fontSize: 12 }}
          >
            London Session — Live Analysis
          </span>
        </div>

        {/* Right: elapsed time + pulsing dot */}
        <div className="flex items-center gap-2.5">
          <span
            className="w21-led inline-block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "#00F0FF",
              color: "#00F0FF",
            }}
            aria-hidden
          />
          <span
            className="font-mono uppercase tracking-wider text-grid-white/55"
            style={{ fontSize: 9 }}
          >
            ELAPSED
          </span>
          <span
            className="font-mono font-bold tabular-nums"
            style={{ fontSize: 12, color: "#00F0FF" }}
          >
            {elapsed}
          </span>
        </div>
      </header>

      {/* ══════════════ MAIN AREA ══════════════ */}
      {/* Geometry constants (top-level for legibility) */}
      {/* Chart:        x=24,  y=56,  w=1640, h=640                */}
      {/* Signal panel: x=1684, y=56,  w=212,  h=924 (full main ht) */}
      {/* Webcam:       x=24,  y=716, w=420,  h=240                */}
      {/* Risk/Session: x=460, y=716, w=1204, h=240                */}

      {/* ── CHART AREA ────────────────────────────────────── */}
      <section
        className="absolute"
        style={{
          left: 24,
          top: 56,
          width: 1640,
          height: 640,
          border: "1px solid #27272A",
          background: "rgba(10,10,10,0.6)",
        }}
        aria-label="EUR/USD H4 chart frame"
      >
        {/* Gold L-corner brackets */}
        <CornerBrackets color="#F5A623" thickness={2} len={28} inset={0} />

        {/* Chart header bar */}
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-between px-4"
          style={{ height: 30, borderBottom: "1px solid #27272A" }}
        >
          <div className="flex items-baseline gap-3">
            <span
              className="font-mono font-bold tracking-wider text-grid-white"
              style={{ fontSize: 13 }}
            >
              EUR/USD
            </span>
            <span
              className="font-mono uppercase tracking-widest text-grid-white/55"
              style={{ fontSize: 10 }}
            >
              — H4
            </span>
            <span
              className="font-mono uppercase tracking-widest"
              style={{ fontSize: 9, color: "#22C55E" }}
            >
              ▲ LIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="font-mono uppercase tracking-wider text-grid-white/55"
              style={{ fontSize: 9 }}
            >
              BID
            </span>
            <span
              className="font-mono font-bold tabular-nums text-grid-white"
              style={{ fontSize: 12 }}
            >
              1.0864
            </span>
            <span
              className="font-mono uppercase tracking-wider text-grid-white/55"
              style={{ fontSize: 9 }}
            >
              ASK
            </span>
            <span
              className="font-mono font-bold tabular-nums text-grid-white"
              style={{ fontSize: 12 }}
            >
              1.0866
            </span>
            <span
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: 12, color: "#00F0FF" }}
            >
              {tsEAT}
            </span>
          </div>
        </div>

        {/* Chart body — left clear for OBS chart source, render subtle placeholder candles */}
        <div className="absolute inset-0" style={{ top: 30 }}>
          <PlaceholderCandles />
        </div>

        {/* Bottom scale ruler */}
        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4"
          style={{
            height: 22,
            borderTop: "1px solid #27272A",
            background: "rgba(10,10,10,0.4)",
          }}
        >
          <span
            className="font-mono tabular-nums text-grid-white/40"
            style={{ fontSize: 9 }}
          >
            1.0800
          </span>
          <span
            className="font-mono tabular-nums text-grid-white/40"
            style={{ fontSize: 9 }}
          >
            1.0840
          </span>
          <span
            className="font-mono tabular-nums text-grid-white/40"
            style={{ fontSize: 9 }}
          >
            1.0880
          </span>
          <span
            className="font-mono tabular-nums text-grid-white/40"
            style={{ fontSize: 9 }}
          >
            1.0920
          </span>
          <span
            className="font-mono tabular-nums text-grid-white/40"
            style={{ fontSize: 9 }}
          >
            1.0960
          </span>
        </div>
      </section>

      {/* ── SIGNAL PANEL (right side, full main height) ──── */}
      <aside
        className="absolute flex flex-col"
        style={{
          left: 1684,
          top: 56,
          width: 212,
          height: 924,
          background: "#27272A",
          border: "1px solid #1F1F22",
        }}
        aria-label="Signals panel"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-3"
          style={{
            height: 30,
            borderBottom: "1px solid #1F1F22",
            background: "#1B1B1E",
          }}
        >
          <span
            className="font-mono font-bold uppercase tracking-widest"
            style={{ fontSize: 10, color: "#00F0FF" }}
          >
            Signals
          </span>
          <span
            className="font-mono font-bold tabular-nums"
            style={{ fontSize: 10, color: "#F5A623" }}
          >
            (3)
          </span>
        </div>

        {/* Stacked signal cards */}
        <div className="flex flex-col gap-2 p-2">
          {SIGNALS.map((s) => (
            <SignalCard key={s.pair} {...s} compact />
          ))}
        </div>

        {/* Live activity log */}
        <div
          className="mt-auto flex flex-col gap-1 px-3 py-3"
          style={{ borderTop: "1px solid #1F1F22" }}
        >
          <span
            className="font-mono uppercase tracking-widest text-grid-white/55"
            style={{ fontSize: 9 }}
          >
            Activity
          </span>
          {[
            { t: "14:31:58", m: "EUR/USD ↑ entry tag", c: "#22C55E" },
            { t: "14:30:12", m: "GBP/JPY signal fired", c: "#00F0FF" },
            { t: "14:28:04", m: "XAU/USD TP1 hit", c: "#F5A623" },
            { t: "14:25:33", m: "USD/JPY reversion", c: "#DC2626" },
          ].map((row) => (
            <div
              key={row.t}
              className="flex items-center gap-2 font-mono"
              style={{ fontSize: 9 }}
            >
              <span className="tabular-nums text-grid-white/40">{row.t}</span>
              <span
                className="inline-block rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: row.c,
                  flexShrink: 0,
                }}
              />
              <span className="truncate text-grid-white/80">{row.m}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── WEBCAM ZONE (lower-left, 420×240) ────────────── */}
      <section
        className="absolute"
        style={{
          left: 24,
          top: 716,
          width: 420,
          height: 240,
          border: "1px solid #00F0FF",
          background: "rgba(0,240,255,0.025)",
        }}
        aria-label="Camera feed zone"
      >
        <CornerBrackets color="#00F0FF" thickness={2} len={22} inset={0} />
        {/* CAM—01 label */}
        <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
          <span
            className="w21-led inline-block rounded-full"
            style={{ width: 5, height: 5, background: "#00F0FF", color: "#00F0FF" }}
            aria-hidden
          />
          <span
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: 9, color: "#00F0FF" }}
          >
            CAM—01
          </span>
        </div>
        {/* REC indicator */}
        <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
          <span
            className="w21-blink inline-block rounded-full"
            style={{ width: 5, height: 5, background: "#DC2626" }}
            aria-hidden
          />
          <span
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: 9, color: "#DC2626" }}
          >
            REC
          </span>
        </div>
        {/* Inner placeholder crosshair (camera target) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            aria-hidden
            className="relative"
            style={{ width: 36, height: 36, opacity: 0.4 }}
          >
            <div
              className="absolute left-1/2 top-0 bottom-0"
              style={{ width: 1, background: "#00F0FF", transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-1/2 left-0 right-0"
              style={{ height: 1, background: "#00F0FF", transform: "translateY(-50%)" }}
            />
            <div
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 8,
                height: 8,
                border: "1px solid #00F0FF",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
        {/* Bottom info strip */}
        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-3"
          style={{ height: 20, borderTop: "1px solid #00F0FF33" }}
        >
          <span
            className="font-mono uppercase tracking-widest text-grid-white/55"
            style={{ fontSize: 8 }}
          >
            1080p · 60fps
          </span>
          <span
            className="font-mono tabular-nums text-grid-white/55"
            style={{ fontSize: 8 }}
          >
            {clock}
          </span>
        </div>
      </section>

      {/* ── SESSION / RISK PANEL (lower-middle, fills webcam-right space) */}
      <section
        className="absolute"
        style={{
          left: 460,
          top: 716,
          width: 1204,
          height: 240,
          border: "1px solid #27272A",
          background: "rgba(20,20,22,0.4)",
        }}
        aria-label="Session and risk metrics"
      >
        <CornerBrackets color="#F5A623" thickness={2} len={20} inset={0} />
        <div className="flex h-full">
          {/* Daily P&L block */}
          <MetricBlock
            label="SESSION P&L"
            value="+2,481.55"
            unit="USD"
            color="#22C55E"
            sub="R: 3.1 · Win 64%"
            width={240}
          />
          <Divider />
          <MetricBlock
            label="OPEN RISK"
            value="1.8"
            unit="%"
            color="#F5A623"
            sub="Max 3.0% · Cap 2.5%"
            width={200}
          />
          <Divider />
          <MetricBlock
            label="DAILY RANGE"
            value="1.0832–1.0891"
            unit=""
            color="#F5F5F5"
            sub="ATR H4 · 42 pips"
            width={260}
          />
          <Divider />
          {/* Watchlist */}
          <div className="flex-1 flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <span
                className="font-mono uppercase tracking-widest text-grid-white/55"
                style={{ fontSize: 9 }}
              >
                Watchlist
              </span>
              <span
                className="font-mono uppercase tracking-widest"
                style={{ fontSize: 9, color: "#00F0FF" }}
              >
                6 pairs
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1.5">
              {[
                { p: "EUR/USD", v: "1.0864", d: 0.32 },
                { p: "GBP/USD", v: "1.2718", d: -0.14 },
                { p: "USD/JPY", v: "157.21", d: 0.45 },
                { p: "XAU/USD", v: "2418.55", d: 0.82 },
                { p: "BTC/USD", v: "64,218", d: 1.46 },
                { p: "WTI", v: "81.34", d: 0.55 },
              ].map((row) => {
                const up = row.d >= 0;
                return (
                  <div key={row.p} className="flex items-center justify-between gap-2 font-mono">
                    <span className="text-grid-white/85" style={{ fontSize: 10 }}>
                      {row.p}
                    </span>
                    <span
                      className="tabular-nums text-grid-white"
                      style={{ fontSize: 10 }}
                    >
                      {row.v}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: 9, color: up ? "#22C55E" : "#DC2626" }}
                    >
                      {up ? "+" : ""}
                      {row.d.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ LOWER BAR (y=1023, h=55) ══════════════ */}
      <footer
        className="absolute left-0 right-0 flex items-center"
        style={{
          top: 1023,
          height: 55,
          background: "#27272A",
          borderTop: "1px solid #1F1F22",
        }}
      >
        {/* Left: W21Lockup (trading) */}
        <div className="flex items-center pl-5 pr-4" style={{ minWidth: 320 }}>
          <W21Lockup channel="trading" size={32} pulse />
        </div>

        {/* Pipe divider */}
        <div
          aria-hidden
          style={{ width: 1, height: 32, background: "#00F0FF55" }}
        />

        {/* Center: scrolling ticker (fills remaining space) */}
        <div className="flex-1 flex items-center px-4">
          <Ticker items={TICKER_ITEMS} height={32} fontSize={12} />
        </div>

        {/* Pipe divider */}
        <div
          aria-hidden
          style={{ width: 1, height: 32, background: "#00F0FF55" }}
        />

        {/* Right: live clock */}
        <div className="flex items-center gap-3 px-5">
          <span
            className="w21-led inline-block rounded-full"
            style={{ width: 6, height: 6, background: "#00F0FF", color: "#00F0FF" }}
            aria-hidden
          />
          <span
            className="font-mono uppercase tracking-widest text-grid-white/55"
            style={{ fontSize: 9 }}
          >
            EAT
          </span>
          <span
            className="font-mono font-bold tabular-nums"
            style={{ fontSize: 16, color: "#00F0FF" }}
          >
            {clock}
          </span>
        </div>
      </footer>

      {/* ══════════════ BOTTOM EDGE STRIPE (y=1078, h=2) ══════════════ */}
      <div
        aria-hidden
        className="absolute left-0 right-0"
        style={{
          top: 1078,
          height: 2,
          background: "#00F0FF",
          boxShadow: "0 0 10px #00F0FF88",
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Sub-components — local to the scene
   ════════════════════════════════════════════════════════════ */

function CornerBrackets({
  color,
  thickness = 2,
  len = 24,
  inset = 0,
}: {
  color: string;
  thickness?: number;
  len?: number;
  inset?: number;
}) {
  const cornerStyle = {
    position: "absolute" as const,
    width: len,
    height: len,
    borderColor: color,
    borderStyle: "solid" as const,
    pointerEvents: "none" as const,
  };
  return (
    <>
      <div
        aria-hidden
        style={{
          ...cornerStyle,
          top: inset,
          left: inset,
          borderTopWidth: thickness,
          borderLeftWidth: thickness,
          borderBottomWidth: 0,
          borderRightWidth: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          ...cornerStyle,
          top: inset,
          right: inset,
          borderTopWidth: thickness,
          borderRightWidth: thickness,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          ...cornerStyle,
          bottom: inset,
          left: inset,
          borderBottomWidth: thickness,
          borderLeftWidth: thickness,
          borderTopWidth: 0,
          borderRightWidth: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          ...cornerStyle,
          bottom: inset,
          right: inset,
          borderBottomWidth: thickness,
          borderRightWidth: thickness,
          borderTopWidth: 0,
          borderLeftWidth: 0,
        }}
      />
    </>
  );
}

function MetricBlock({
  label,
  value,
  unit,
  color,
  sub,
  width,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  sub: string;
  width: number;
}) {
  return (
    <div
      className="flex flex-col justify-center px-4 py-3"
      style={{ width }}
    >
      <span
        className="font-mono uppercase tracking-widest text-grid-white/55"
        style={{ fontSize: 9, letterSpacing: "0.12em" }}
      >
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="font-mono font-bold tabular-nums"
          style={{ fontSize: 20, color, lineHeight: 1 }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-mono uppercase"
            style={{ fontSize: 10, color: "#8B8B8E" }}
          >
            {unit}
          </span>
        )}
      </div>
      <span
        className="mt-1.5 font-mono uppercase tracking-wider text-grid-white/55"
        style={{ fontSize: 9 }}
      >
        {sub}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{ width: 1, background: "#27272A", alignSelf: "stretch" }}
    />
  );
}

/**
 * PlaceholderCandles — a subtle, static candlestick pattern rendered
 * in the chart frame so the scene looks alive even before OBS injects
 * a real chart source. Colors respect W21 bull/bear semantics.
 */
function PlaceholderCandles() {
  // Deterministic pseudo-random candle series (no hydration drift).
  const candles = [
    { o: 30, h: 28, l: 50, c: 38, up: true },
    { o: 38, h: 33, l: 56, c: 44, up: true },
    { o: 44, h: 40, l: 62, c: 50, up: true },
    { o: 50, h: 46, l: 70, c: 60, up: true },
    { o: 60, h: 54, l: 78, c: 68, up: true },
    { o: 68, h: 62, l: 88, c: 78, up: true },
    { o: 78, h: 70, l: 100, c: 90, up: true },
    { o: 90, h: 84, l: 112, c: 96, up: true },
    { o: 96, h: 92, l: 120, c: 88, up: false },
    { o: 88, h: 84, l: 116, c: 78, up: false },
    { o: 78, h: 70, l: 104, c: 84, up: true },
    { o: 84, h: 78, l: 110, c: 92, up: true },
    { o: 92, h: 86, l: 120, c: 100, up: true },
    { o: 100, h: 94, l: 130, c: 108, up: true },
    { o: 108, h: 102, l: 138, c: 116, up: true },
    { o: 116, h: 108, l: 148, c: 110, up: false },
    { o: 110, h: 104, l: 140, c: 118, up: true },
    { o: 118, h: 112, l: 150, c: 126, up: true },
    { o: 126, h: 118, l: 158, c: 132, up: true },
    { o: 132, h: 126, l: 168, c: 140, up: true },
    { o: 140, h: 132, l: 178, c: 134, up: false },
    { o: 134, h: 128, l: 168, c: 142, up: true },
    { o: 142, h: 136, l: 178, c: 150, up: true },
    { o: 150, h: 144, l: 188, c: 158, up: true },
    { o: 158, h: 152, l: 198, c: 166, up: true },
    { o: 166, h: 158, l: 208, c: 160, up: false },
    { o: 160, h: 154, l: 200, c: 168, up: true },
    { o: 168, h: 162, l: 212, c: 176, up: true },
    { o: 176, h: 168, l: 220, c: 184, up: true },
    { o: 184, h: 176, l: 228, c: 192, up: true },
    { o: 192, h: 184, l: 236, c: 186, up: false },
    { o: 186, h: 180, l: 232, c: 194, up: true },
    { o: 194, h: 186, l: 240, c: 202, up: true },
    { o: 202, h: 194, l: 248, c: 210, up: true },
    { o: 210, h: 200, l: 256, c: 216, up: true },
  ];

  const chartH = 610 - 30 - 22; // available height inside chart body
  const chartW = 1640;
  const gap = 8;
  const candleW = (chartW - gap * (candles.length + 1)) / candles.length;
  const maxV = 280;
  const yScale = (v: number) => chartH - (v / maxV) * chartH + 30;

  return (
    <div className="absolute inset-0" aria-hidden>
      {/* Horizontal price gridlines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <div
          key={p}
          aria-hidden
          className="absolute left-0 right-0"
          style={{
            top: `${p * 100}%`,
            height: 1,
            background: "rgba(245,245,245,0.04)",
          }}
        />
      ))}
      {/* Candles */}
      {candles.map((c, i) => {
        const x = gap + i * (candleW + gap);
        const color = c.up ? "#22C55E" : "#DC2626";
        const bodyTop = yScale(Math.max(c.o, c.c));
        const bodyH = Math.max(2, Math.abs(c.o - c.c) * 1.2);
        const wickTop = yScale(c.h);
        const wickBottom = yScale(c.l);
        return (
          <div key={i}>
            {/* Wick */}
            <div
              className="absolute"
              style={{
                left: x + candleW / 2 - 0.5,
                top: wickTop,
                width: 1,
                height: wickBottom - wickTop,
                background: color,
                opacity: 0.7,
              }}
            />
            {/* Body */}
            <div
              className="absolute"
              style={{
                left: x,
                top: bodyTop,
                width: candleW,
                height: bodyH,
                background: c.up ? `${color}33` : `${color}55`,
                border: `1px solid ${color}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
