"use client";

/**
 * Ticker — infinite-scrolling price ticker.
 * ─────────────────────────────────────────────────────────────
 *  • Monospaced numerics (Rule 5)
 *  • Green ▲ / Red ▼ arrows for up / down
 *  • CSS animation (`.w21-ticker-track` from globals.css)
 *  • Seamlessly loops by rendering the data list twice
 *
 * Designed to live in the lower bar of a scene, but it is fully
 * self-contained — drop it anywhere with a fixed height.
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
  /** Ticker height. Default 28px (fits the lower-bar). */
  height?: number;
  /** Font size in px. Default 13. */
  fontSize?: number;
  className?: string;
  /** Render a faint separator between items. Default true. */
  separators?: boolean;
}

export function Ticker({
  items,
  height = 28,
  fontSize = 13,
  className,
  separators = true,
}: TickerProps) {
  // Duplicate the list so the marquee can translate -50% seamlessly.
  const loop = [...items, ...items];

  const wrapStyle: CSSProperties = {
    height,
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
    fontSize,
  };

  const fmt = (n: number) =>
    n >= 100
      ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : n.toFixed(4);

  return (
    <div
      className={cn(
        "w21-ticker-wrap relative flex items-center overflow-hidden bg-transparent",
        className,
      )}
      style={wrapStyle}
    >
      <div className="w21-ticker-track">
        {loop.map((item, idx) => {
          const up = item.changePct >= 0;
          const arrow = up ? "▲" : "▼";
          const dirColor = up ? "#22C55E" : "#DC2626";
          return (
            <span
              key={`${item.symbol}-${idx}`}
              className="inline-flex items-center gap-2 px-4"
              style={{
                borderRight: separators ? "1px solid #27272A" : "none",
                color: "#F5F5F5",
                whiteSpace: "nowrap",
              }}
            >
              <span className="font-bold tracking-wider">{item.symbol}</span>
              <span className="tabular-nums text-grid-white/90">
                {fmt(item.price)}
              </span>
              <span
                className="inline-flex items-center gap-1 tabular-nums"
                style={{ color: dirColor }}
              >
                <span aria-hidden>{arrow}</span>
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
  );
}

export default Ticker;
