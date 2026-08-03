"use client";

/**
 * Smile Trading Live — HERO SCENE  (1920×1080, OBS-ready)
 * ─────────────────────────────────────────────────────────────
 * The warm, friendly Smile desk — "good vibes under one Smile desk."
 *
 * Layout (frame-slot style, v1 03-live.html + 01-starting-soon.html inspired):
 *
 *   ┌─────────────────────────────────────────────────────── y=0
 *   │ TOP BAR — SmileLockup · live clock · NAIROBI DESK chip  │
 *   ├─────────────────────────────────────────────────────── y=72
 *   │                                  ┌──────────────────┐  │
 *   │  ┌────────────────────────────┐  │ LIVE CHAT        │  │
 *   │  │ EUR/USD — H4 (chart)       │  │                  │  │
 *   │  │                            │  │                  │  │
 *   │  │                            │  │                  │  │
 *   │  └────────────────────────────┘  │                  │  │
 *   │  ┌──────────┐  ┌──────────────┐  │                  │  │
 *   │  │ CAM—01   │  │ MARKET       │  │                  │  │
 *   │  │ (ON AIR) │  │ STRUCTURE    │  │                  │  │
 *   │  └──────────┘  └──────────────┘  └──────────────────┘  │
 *   ├─────────────────────────────────────────────────────── y=1020
 *   │ LOWER BAR — Ticker (clock + marquee)                   │
 *   ├─────────────────────────────────────────────────────── y=1078
 *   │ ████ 2px yellow stripe                                  │
 *   └─────────────────────────────────────────────────────── y=1080
 *
 * Mock data throughout — real feeds arrive in a later milestone.
 */

import { useRef } from "react";
import { SmileLockup } from "@/components/smile/SmileLockup";
import { SignalCard, Ticker } from "@/components/smile";
import type { SignalCardProps, TickerProps } from "@/components/smile";
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

export default function TradingLiveScene() {
  const now = useClock(1000);
  const startTimeRef = useRef<number>(Date.now());

  const elapsedSec = now
    ? Math.floor((now.getTime() - startTimeRef.current) / 1000)
    : 0;
  const clock = now ? fmtClock(now) : "--:--:--";
  void elapsedSec; // reserved for a future elapsed readout

  return (
    <div
      className="smile-scene-root"
      style={{
        background:
          "radial-gradient(circle at 50% 38%, rgba(28,28,28,0.85) 0%, var(--ink) 70%)",
      }}
    >
      {/* ── Floating sparks — personality ──────────────────────── */}
      <span
        className="spark"
        style={{ top: 180, left: 320, "--d": "0s" } as React.CSSProperties}
        aria-hidden
      />
      <span
        className="spark green"
        style={{ top: 460, left: 1480, "--d": "1.4s" } as React.CSSProperties}
        aria-hidden
      />
      <span
        className="spark red"
        style={{ top: 720, left: 880, "--d": "2.6s" } as React.CSSProperties}
        aria-hidden
      />
      <span
        className="spark sky"
        style={{ top: 260, left: 1180, "--d": "0.8s" } as React.CSSProperties}
        aria-hidden
      />

      {/* ── Decorative orbit ring (top-right, behind content) ──── */}
      <div
        className="orbit"
        aria-hidden
        style={{
          width: 360,
          height: 360,
          top: -120,
          right: -120,
          opacity: 0.4,
        }}
      />

      {/* ══════════════ TOP BAR (y=0, h=72) ══════════════ */}
      <header
        className="absolute left-0 right-0 flex items-center justify-between px-8"
        style={{ top: 0, height: 72 }}
      >
        <div className="flex items-center gap-5">
          <SmileLockup brand="smile" size={42} pulse mood="idle" />
          <span
            className="hidden"
            style={{ display: "none" }}
            aria-hidden
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span
            className="chip ghost"
            style={{ padding: "8px 16px", fontSize: 12 }}
          >
            <span
              className="smile-led inline-block rounded-full"
              style={{
                width: 7,
                height: 7,
                background: "var(--live)",
                color: "var(--live)",
              }}
              aria-hidden
            />
            LIVE
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "0.02em",
              color: "var(--paper)",
            }}
          >
            London Session — Live Analysis
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="chip dark"
            style={{ padding: "8px 14px", fontSize: 11 }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--yellow)",
                display: "inline-block",
              }}
            />
            NAIROBI DESK
          </span>
          <span
            className="chip dark"
            style={{
              padding: "8px 14px",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.05em",
              fontFamily: "var(--font-body)",
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {clock} EAT
          </span>
        </div>
      </header>

      {/* ══════════════ ALERT BOX (top-center, slide-in) ══════════════ */}
      <div
        className="absolute left-1/2 -translate-x-1/2 smile-slide-in"
        style={{ top: 88, zIndex: 5 }}
      >
        <div
          className="chip solid"
          style={{ padding: "10px 20px", fontSize: 13 }}
        >
          <span aria-hidden style={{ fontSize: 14 }}>⚡</span>
          SIGNAL · EUR/USD · BUY @ 1.0864 · TP 1.0921
        </div>
      </div>

      {/* ══════════════ MAIN GRID (frame slots) ══════════════ */}
      {/* Geometry constants:
          Chart:        x=48,  y=128, w=1180, h=560
          Chat:         x=1252,y=128, w=620,  h=860
          Cam:          x=48,  y=712, w=420,  h=276  (ON AIR — active)
          Structure:    x=488, y=712, w=740,  h=276  */}

      {/* ── CHART FRAME ─────────────────────────────────────── */}
      <section
        className="smile-frame"
        style={{
          left: 48,
          top: 128,
          width: 1180,
          height: 560,
        }}
        aria-label="EUR/USD H4 chart frame"
      >
        <FrameHeader
          label="EUR/USD — H4"
          live
          right={
            <div className="flex items-center gap-6">
              <BidAsk label="BID" value="1.0864" />
              <BidAsk label="ASK" value="1.0866" />
              <span
                className="tabular-nums font-bold"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--yellow)",
                }}
              >
                {clock} EAT
              </span>
            </div>
          }
        />
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ top: 40 }}
        >
          <PlaceholderCandles />
        </div>
        {/* faint price scale ruler on the right */}
        <div
          className="absolute top-0 bottom-0 right-0 flex flex-col justify-between py-2 pr-2 text-right"
          style={{ width: 80, borderLeft: "1px solid var(--line)" }}
          aria-hidden
        >
          {[1.0920, 1.0890, 1.0864, 1.0840, 1.0810].map((p) => (
            <span
              key={p}
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {p.toFixed(4)}
            </span>
          ))}
        </div>
      </section>

      {/* ── CHAT FRAME ──────────────────────────────────────── */}
      <section
        className="smile-frame"
        style={{
          left: 1252,
          top: 128,
          width: 620,
          height: 860,
        }}
        aria-label="Live chat frame"
      >
        <FrameHeader label="LIVE CHAT" right={<Tag>#SmileSquad</Tag>} />
        <div
          className="absolute left-0 right-0 bottom-0 px-4 py-3 smile-scroll overflow-y-auto"
          style={{ top: 40 }}
        >
          <ChatLines />
        </div>
      </section>

      {/* ── CAM FRAME (ON AIR — active) ─────────────────────── */}
      <section
        className="smile-frame smile-frame--active"
        style={{
          left: 48,
          top: 712,
          width: 420,
          height: 276,
        }}
        aria-label="Webcam frame — CAM-01 ON AIR"
      >
        <FrameHeader
          label="CAM—01"
          active
          right={
            <span
              className="chip"
              style={{
                background: "var(--live)",
                color: "var(--ink)",
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              ON AIR
            </span>
          }
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ top: 36, bottom: 28 }}
        >
          <div
            className="flex flex-col items-center gap-2"
            style={{ opacity: 0.5 }}
          >
            <span
              style={{
                fontSize: 48,
                lineHeight: 1,
                color: "var(--live)",
              }}
              aria-hidden
            >
              ●
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Camera source — OBS Layer
            </span>
          </div>
        </div>
        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-3"
          style={{
            height: 28,
            borderTop: "1px solid var(--line)",
            background: "rgba(10,10,10,0.5)",
          }}
        >
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--paper)",
              opacity: 0.8,
            }}
          >
            1080p · 60fps
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              color: "var(--down)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span className="smile-blink" aria-hidden>●</span> REC
          </span>
        </div>
      </section>

      {/* ── MARKET STRUCTURE FRAME ──────────────────────────── */}
      <section
        className="smile-frame"
        style={{
          left: 488,
          top: 712,
          width: 740,
          height: 276,
        }}
        aria-label="Market structure frame"
      >
        <FrameHeader
          label="MARKET STRUCTURE"
          right={<Tag>BIAS · BULLISH</Tag>}
        />
        <div
          className="absolute left-0 right-0 bottom-0 px-3 py-2.5"
          style={{ top: 36 }}
        >
          <div className="grid grid-cols-3 gap-2.5">
            {SIGNALS.map((s) => (
              <SignalCard key={s.pair} {...s} compact />
            ))}
          </div>
          <div
            className="mt-2.5 flex items-center justify-between"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            <span className="uppercase" style={{ letterSpacing: "0.08em" }}>
              Session P&amp;L
            </span>
            <span
              className="tabular-nums font-bold"
              style={{ color: "var(--up)" }}
            >
              +2,481.55
            </span>
            <span className="uppercase" style={{ letterSpacing: "0.08em" }}>
              Open Risk
            </span>
            <span
              className="tabular-nums font-bold"
              style={{ color: "var(--yellow)" }}
            >
              1.8%
            </span>
            <span className="uppercase" style={{ letterSpacing: "0.08em" }}>
              Daily Range
            </span>
            <span
              className="tabular-nums font-bold"
              style={{ color: "var(--paper)" }}
            >
              1.0800 — 1.0921
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════ LOWER BAR — Ticker (y=1020, h=60) ══════════════ */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 1020,
          height: 60,
          borderTop: "1px solid var(--line)",
          background: "var(--panel)",
        }}
      >
        <Ticker
          items={TICKER_ITEMS}
          height={60}
          fontSize={14}
          clock={clock}
          clockLabel="EAT"
        />
      </div>

      {/* ══════════════ BOTTOM EDGE — 2px yellow stripe ══════════════ */}
      <div className="smile-stripe" aria-hidden />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════ */

function FrameHeader({
  label,
  right,
  live,
  active,
}: {
  label: string;
  right?: React.ReactNode;
  live?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className="absolute left-0 right-0 top-0 flex items-center justify-between px-4"
      style={{
        height: 36,
        borderBottom: "1px solid var(--line)",
        background: "rgba(10,10,10,0.45)",
      }}
    >
      <div className="flex items-center gap-2.5">
        {active && (
          <span
            className="smile-led inline-block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "var(--live)",
              color: "var(--live)",
            }}
            aria-hidden
          />
        )}
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 13,
            color: active ? "var(--live)" : "var(--paper)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {live && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 10,
              color: "var(--up)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ▲ LIVE
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

function BidAsk({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className="uppercase"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <span
        className="tabular-nums font-bold"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--paper)",
        }}
      >
        {value}
      </span>
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="chip dark"
      style={{ padding: "3px 10px", fontSize: 10 }}
    >
      {children}
    </span>
  );
}

function PlaceholderCandles() {
  // Deterministic seed-ish series — green/red bars across the chart body
  const candles = Array.from({ length: 36 }, (_, i) => {
    const up = (i * 7 + 3) % 5 < 3;
    const h = 36 + ((i * 13) % 70);
    const y = 60 + ((i * 17) % 40);
    return { up, h, y };
  });
  return (
    <div
      className="relative h-full w-full"
      style={{ padding: "12px 16px" }}
      aria-hidden
    >
      <div className="flex items-end gap-[6px] h-full">
        {candles.map((c, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center"
            style={{ height: "100%", justifyContent: "flex-end" }}
          >
            <div
              style={{
                width: "70%",
                height: c.h,
                background: c.up
                  ? "color-mix(in srgb, var(--up) 70%, transparent)"
                  : "color-mix(in srgb, var(--down) 70%, transparent)",
                border: `1px solid ${c.up ? "var(--up)" : "var(--down)"}`,
                borderRadius: 2,
                marginBottom: c.y,
                opacity: 0.65,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatLines() {
  const lines = [
    { user: "@smileke", text: "Good morning #SmileSquad ☀️", color: "var(--yellow)" },
    { user: "@trader_ke", text: "EUR/USD looking strong above 1.086", color: "var(--sky)" },
    { user: "@nairobi_fx", text: "Long bias holding — nice structure 🔥", color: "var(--up)" },
    { user: "@muthoni", text: "First target 1.0921?", color: "var(--paper)" },
    { user: "@smileke", text: "Yes — and SL just below 1.0832.", color: "var(--yellow)" },
    { user: "@kcb_fan", text: "Smile desk is 🔛 today 🚀", color: "var(--up-soft)" },
    { user: "@_jay", text: "Gold signal hit TP overnight 💰", color: "var(--up)" },
    { user: "@wanjiku", text: "What's the read on GBP/JPY?", color: "var(--paper)" },
    { user: "@smileke", text: "Reversion play — see the card on the right.", color: "var(--yellow)" },
    { user: "@trader_ke", text: "Educational content after the session 📚", color: "var(--sky)" },
    { user: "@nairobi_fx", text: "W21 Trading channel going brrr 📈", color: "var(--up)" },
    { user: "@muthoni", text: "Replay will be on smile.co.ke later", color: "var(--paper)" },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((l, i) => (
        <div
          key={i}
          className="flex items-baseline gap-2"
          style={{ fontFamily: "var(--font-body)", fontSize: 13 }}
        >
          <span
            className="font-bold shrink-0"
            style={{ color: l.color }}
          >
            {l.user}
          </span>
          <span style={{ color: "var(--paper)", opacity: 0.92 }}>
            {l.text}
          </span>
        </div>
      ))}
    </div>
  );
}
