/**
 * W21 Channel Identity Map
 * ─────────────────────────────────────────────────────────────
 * The single source of truth for channel → signature color.
 * Rule 2: Color is the differentiator. Rule 4: Gold is the parent.
 *
 * Every W21 component consumes this map. Add new verticals here,
 * and the rest of the system picks them up automatically.
 */

export type ChannelKey =
  | "parent"
  | "trading"
  | "news"
  | "politics"
  | "agriculture"
  | "innovation"
  | "impact"
  | "health"
  | "education"
  | "culture"
  | "sports"
  | "tech";

export interface ChannelConfig {
  /** Display name in the lockup — ALWAYS rendered in Grid White. */
  name: string;
  /** Hex signature color — drives the dot, pipe, and accent surfaces. */
  color: string;
  /** Human label for the palette (used in docs / tooltips). */
  label: string;
}

export const channels = {
  parent: { name: "WORLD 21", color: "#F5A623", label: "Unity Gold" },
  trading: { name: "TRADING", color: "#00F0FF", label: "Signal Cyan" },
  news: { name: "NEWS", color: "#FF8C00", label: "Press Amber" },
  politics: { name: "POLITICS", color: "#DC2626", label: "Sovereign Crimson" },
  agriculture: { name: "AGRICULTURE", color: "#22C55E", label: "Harvest Green" },
  innovation: { name: "INNOVATION", color: "#6366F1", label: "Electric Indigo" },
  impact: { name: "IMPACT", color: "#F0EDE5", label: "Warm White" },
  health: { name: "HEALTH", color: "#14B8A6", label: "Healing Teal" },
  education: { name: "EDUCATION", color: "#3B82F6", label: "Knowledge Blue" },
  culture: { name: "CULTURE", color: "#F97316", label: "Sunset Coral" },
  sports: { name: "SPORTS", color: "#84CC16", label: "Victory Lime" },
  tech: { name: "TECH", color: "#8B5CF6", label: "Plasma Violet" },
} as const satisfies Record<ChannelKey, ChannelConfig>;

export type ChannelMap = typeof channels;

/** System palette — the structural colors of every W21 composition. */
export const w21System = {
  terminal: "#0A0A0A",
  gridWhite: "#F5F5F5",
  zinc: "#27272A",
  alert: "#FF006E",
  bull: "#22C55E",
  bear: "#DC2626",
} as const;

/** Resolve a channel config by key — throws at compile time if missing. */
export function getChannel(key: ChannelKey): ChannelConfig {
  return channels[key];
}

/** Channel keys as an array — useful for selectors / scene lists. */
export const channelKeys = Object.keys(channels) as ChannelKey[];
