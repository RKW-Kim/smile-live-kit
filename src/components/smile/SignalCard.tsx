"use client";

/**
 * SignalCard — smile-styled trading signal callout
 * ─────────────────────────────────────────────────────────────
 *  • BUY  → 3px left border in --up (bullish green)
 *  • SELL → 3px left border in --down (bearish red)
 *  • Panel bg --panel, hairline border --line
 *  • Inter for labels, tabular-nums for prices
 *  • Confidence bar + optional strategy tag
 *
 * Same data shape as the previous W21 SignalCard so scenes that
 * consume it don't need rewriting.
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
  confidence?: number;
  strategy?: string;
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
  const accent = isBuy
    ? "var(--up, #0ECB81)"
    : "var(--down, #F6465D)";

  const rootStyle: CSSProperties = {
    borderLeft: `3px solid ${accent}`,
    background: "var(--panel, #141414)",
    border: "1px solid var(--line, #2a2a2a)",
    borderLeftWidth: 3,
    borderLeftColor: accent,
    borderRadius: 8,
  };

  const fmt = (n: number) =>
    n >= 100
      ? n.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n.toFixed(5);

  return (
    <div
      className={cn(
        "smile-signal-card relative overflow-hidden",
        compact ? "px-3 py-2" : "px-3.5 py-2.5",
        className,
      )}
      style={rootStyle}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span
            className="truncate"
            style={{
              fontFamily:
                "var(--font-body), ui-sans-serif, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: compact ? 13 : 14,
              color: "var(--paper, #ffffff)",
              letterSpacing: "-0.01em",
            }}
          >
            {pair}
          </span>
          {strategy && (
            <span
              className="uppercase shrink-0"
              style={{
                fontFamily:
                  "var(--font-body), ui-sans-serif, system-ui, sans-serif",
                fontSize: compact ? 9 : 10,
                color: "var(--muted, #8c8c8c)",
                letterSpacing: "0.06em",
              }}
            >
              {strategy}
            </span>
          )}
        </div>
        <span
          className="font-bold uppercase shrink-0"
          style={{
            color: accent,
            fontSize: compact ? 10 : 11,
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accent} 45%, transparent)`,
            padding: "2px 8px",
            borderRadius: 999,
            letterSpacing: "0.08em",
            fontFamily:
              "var(--font-display), ui-sans-serif, system-ui, sans-serif",
          }}
        >
          {direction}
        </span>
      </div>

      <div
        className="mt-2 grid grid-cols-3 gap-2"
        style={{
          fontFamily:
            "var(--font-body), ui-sans-serif, system-ui, sans-serif",
          fontSize: compact ? 11 : 12,
        }}
      >
        <Level
          label="ENTRY"
          value={fmt(entry)}
          valueColor="var(--paper, #ffffff)"
        />
        <Level
          label="SL"
          value={fmt(stopLoss)}
          valueColor="var(--down, #F6465D)"
        />
        <Level
          label="TP"
          value={fmt(takeProfit)}
          valueColor="var(--up, #0ECB81)"
        />
      </div>

      {typeof confidence === "number" && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="uppercase"
            style={{
              fontFamily:
                "var(--font-body), ui-sans-serif, system-ui, sans-serif",
              fontSize: 9,
              color: "var(--muted, #8c8c8c)",
              letterSpacing: "0.1em",
            }}
          >
            CONF
          </span>
          <div
            className="h-[3px] flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--ink, #0a0a0a)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, confidence))}%`,
                background: accent,
                boxShadow: `0 0 6px color-mix(in srgb, ${accent} 60%, transparent)`,
              }}
            />
          </div>
          <span
            className="tabular-nums font-bold"
            style={{
              fontSize: 10,
              color: accent,
              fontFamily:
                "var(--font-body), ui-sans-serif, system-ui, sans-serif",
            }}
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
        className="uppercase"
        style={{
          fontSize: 9,
          color: "var(--muted, #8c8c8c)",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <span
        className="tabular-nums font-semibold"
        style={{
          color: valueColor,
          fontFeatureSettings: '"tnum" 1, "zero" 1',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default SignalCard;
