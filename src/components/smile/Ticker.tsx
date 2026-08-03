"use client";

/**
 * Ticker — smile-style market ticker
 * ─────────────────────────────────────────────────────────────
 *  • Left:  clock section (live HH:MM:SS, green-tinted background)
 *  • Right: infinite-scroll marquee of symbol / price / change%
 *  • Green ▲ / Red ▼ arrows
 *  • Inter font, tabular-nums
 *  • CSS animation — seamless loop via duplicate list
 *
 * Self-contained: drop into any scene lower bar with a fixed height.
 */

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface TickerItem {
  symbol: string;
  price: number;
  changePct: number;
}

export interface TickerProps {
  items: TickerItem[];
  /** Optional clock string for the left section. If omitted, the
   *  clock section is hidden. */
  clock?: string;
  /** Optional label under the clock (e.g. "EAT", "LIVE"). */
  clockLabel?: string;
  height?: number;
  fontSize?: number;
  className?: string;
  separators?: boolean;
}

export function Ticker({
  items,
  clock,
  clockLabel = "EAT",
  height = 40,
  fontSize = 13,
  className,
  separators = true,
}: TickerProps) {
  const loop = [...items, ...items];

  const wrapStyle: CSSProperties = {
    height,
    fontFamily: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
    fontSize,
  };

  const fmt = (n: number) =>
    n >= 100
      ? n.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n.toFixed(4);

  return (
    <div
      className={cn(
        "smile-ticker relative flex items-stretch overflow-hidden",
        className,
      )}
      style={wrapStyle}
    >
      {/* Clock section */}
      {clock !== undefined && (
        <div
          className="smile-ticker__clock relative flex flex-col items-center justify-center px-4 shrink-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--live, #3ddc84) 14%, transparent) 0%, color-mix(in srgb, var(--live, #3ddc84) 8%, transparent) 100%)",
            borderRight: "1px solid var(--line, #2a2a2a)",
          }}
        >
          <span
            className="tabular-nums font-bold"
            style={{
              fontSize: Math.max(11, fontSize),
              color: "var(--live, #3ddc84)",
              lineHeight: 1,
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {clock}
          </span>
          <span
            className="uppercase tracking-widest"
            style={{
              fontSize: 8,
              color: "var(--muted, #8c8c8c)",
              letterSpacing: "0.12em",
              marginTop: 2,
            }}
          >
            {clockLabel}
          </span>
        </div>
      )}

      {/* Marquee */}
      <div className="smile-ticker__marquee relative flex-1 overflow-hidden">
        <div className="smile-ticker__track">
          {loop.map((item, idx) => {
            const up = item.changePct >= 0;
            const arrow = up ? "▲" : "▼";
            const dirColor = up
              ? "var(--up, #0ECB81)"
              : "var(--down, #F6465D)";
            return (
              <span
                key={`${item.symbol}-${idx}`}
                className="inline-flex items-center gap-2 px-4"
                style={{
                  borderRight: separators
                    ? "1px solid var(--line, #2a2a2a)"
                    : "none",
                  color: "var(--paper, #ffffff)",
                  whiteSpace: "nowrap",
                  height: "100%",
                }}
              >
                <span
                  className="font-bold tracking-tight"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {item.symbol}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    color: "var(--paper, #ffffff)",
                    opacity: 0.92,
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {fmt(item.price)}
                </span>
                <span
                  className="inline-flex items-center gap-1 tabular-nums font-semibold"
                  style={{
                    color: dirColor,
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  <span aria-hidden style={{ fontSize: fontSize - 2 }}>
                    {arrow}
                  </span>
                  <span>
                    {up ? "+" : ""}
                    {item.changePct.toFixed(2)}%
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Ticker;
