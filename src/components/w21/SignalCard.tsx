"use client";

/**
 * SignalCard — a single trading signal callout.
 * ─────────────────────────────────────────────────────────────
 *  • BUY cards:  3px Harvest Green left border
 *  • SELL cards: 3px Sovereign Crimson left border
 *  • All numbers monospaced (Rule 5)
 *  • Zinc panel background
 *  • Compact, institutional — Bloomberg energy, not gaming-stream.
 */

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type SignalDirection = "BUY" | "SELL";

export interface SignalCardProps {
  pair: string;
  direction: SignalDirection;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  /** Optional confidence / probability (0–100). Renders as a thin bar. */
  confidence?: number;
  /** Optional strategy label, e.g. "Breakout", "Reversion". */
  strategy?: string;
  /** Compact mode for tight stacks. Default false. */
  compact?: boolean;
  className?: string;
}

export function SignalCard({
  pair,
  direction,
  entry,
  stopLoss,
  takeProfit,
  confidence,
  strategy,
  compact = false,
  className,
}: SignalCardProps) {
  const isBuy = direction === "BUY";
  const accent = isBuy ? "#22C55E" : "#DC2626";

  const rootStyle: CSSProperties = {
    borderLeft: `3px solid ${accent}`,
    background: "#1B1B1E",
  };

  const fmt = (n: number) =>
    n >= 100
      ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : n.toFixed(5);

  return (
    <div
      className={cn(
        "w21-signal-card relative overflow-hidden",
        compact ? "px-3 py-2" : "px-3.5 py-2.5",
        className,
      )}
      style={rootStyle}
    >
      {/* Header: pair + direction badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono font-bold tracking-tight text-grid-white"
            style={{ fontSize: compact ? 12 : 13 }}
          >
            {pair}
          </span>
          {strategy && (
            <span
              className="font-mono uppercase tracking-wider text-muted-foreground"
              style={{ fontSize: compact ? 8 : 9 }}
            >
              {strategy}
            </span>
          )}
        </div>
        <span
          className="font-mono font-bold uppercase tracking-widest"
          style={{
            color: accent,
            fontSize: compact ? 9 : 10,
            background: `${accent}1A`,
            border: `1px solid ${accent}55`,
            padding: "1px 6px",
            borderRadius: 2,
            letterSpacing: "0.12em",
          }}
        >
          {direction}
        </span>
      </div>

      {/* Levels */}
      <div
        className={cn(
          "mt-2 grid grid-cols-3 gap-2 font-mono",
        )}
        style={{ fontSize: compact ? 10 : 11 }}
      >
        <Level label="ENTRY" value={fmt(entry)} valueColor="#F5F5F5" />
        <Level
          label="SL"
          value={fmt(stopLoss)}
          valueColor="#DC2626"
        />
        <Level
          label="TP"
          value={fmt(takeProfit)}
          valueColor="#22C55E"
        />
      </div>

      {/* Optional confidence bar */}
      {typeof confidence === "number" && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="font-mono uppercase tracking-wider text-muted-foreground"
            style={{ fontSize: 8 }}
          >
            CONF
          </span>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#0A0A0A]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, confidence))}%`,
                background: accent,
                boxShadow: `0 0 6px ${accent}88`,
              }}
            />
          </div>
          <span
            className="font-mono tabular-nums"
            style={{ fontSize: 9, color: accent }}
          >
            {Math.round(confidence)}%
          </span>
        </div>
      )}
    </div>
  );
}

function Level({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-mono uppercase tracking-wider text-muted-foreground"
        style={{ fontSize: 8, letterSpacing: "0.1em" }}
      >
        {label}
      </span>
      <span
        className="font-mono tabular-nums"
        style={{ color: valueColor, fontWeight: 600 }}
      >
        {value}
      </span>
    </div>
  );
}

export default SignalCard;
