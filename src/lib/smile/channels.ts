/**
 * Smile Brand Theming System
 * ─────────────────────────────────────────────────────────────
 * The smile.co.ke design language — warm, friendly, yellow, with
 * a smiley-face mark that NEVER changes shape. The ONLY thing
 * that differs between channels is the CSS-variable token set:
 * accent yellow → cyan, amber, etc. The smiley stays smiling.
 *
 *  • `tokens`  → CSS variables to override on a wrapper element
 *                (e.g. `--yellow`, `--yellow-hot`). Affects chips,
 *                accents, ticks, on-air glows.
 *  • `handles` → text find-replace map applied to UI strings.
 *                Lets one channel swap "SmileSquad" → "TradeSquad"
 *                without touching component code.
 *  • `wordmark` → text shown beside the SmileMark in the lockup.
 *
 * The mark shape is shared core geometry — a different logo
 * SHAPE is a core PR. Never fork the SmileMark per channel.
 */

export type SmileBrandId =
  | "smile"
  | "w21trading"
  | "w21news"
  | "w21education"
  | "w21culture"
  | "w21sports";

export interface SmileBrand {
  /** Stable id — used as React key + style selector. */
  id: SmileBrandId;
  /** Human label — shown in selectors / tooltips. */
  name: string;
  /** Wordmark text rendered beside the SmileMark. Lowercase by convention. */
  wordmark: string;
  /** CSS variables to override on the channel wrapper. */
  tokens: Record<string, string>;
  /** Text find-replace map (case-sensitive, applied to UI strings). */
  handles: Record<string, string>;
  /** Short tagline — used on scene cards + scene header strip. */
  tagline: string;
  /** Accent color (computed convenience — same as tokens["--yellow"]). */
  accent: string;
}

const SMILE_BASE_TOKENS: Record<string, string> = {
  "--yellow": "#FFC107",
  "--yellow-hot": "#F5A623",
};

export const brands: Record<SmileBrandId, SmileBrand> = {
  smile: {
    id: "smile",
    name: "Smile (default)",
    wordmark: "smile",
    tokens: { ...SMILE_BASE_TOKENS },
    handles: {
      "@smileke": "@smileke",
      "#SmileSquad": "#SmileSquad",
      "good vibes under one Smile desk":
        "good vibes under one Smile desk",
    },
    tagline: "good vibes under one Smile desk",
    accent: "#FFC107",
  },
  w21trading: {
    id: "w21trading",
    name: "W21 Trading",
    wordmark: "W21│TRADING",
    tokens: {
      "--yellow": "#00E5D1",
      "--yellow-hot": "#11EBCB",
    },
    handles: {
      "@smileke": "@w21trading",
      "#SmileSquad": "#TradeSquad",
      "good vibes under one Smile desk":
        "signal-grade analysis from the W21 Trading desk",
    },
    tagline: "signal-grade analysis from the W21 Trading desk",
    accent: "#00E5D1",
  },
  w21news: {
    id: "w21news",
    name: "W21 News",
    wordmark: "W21│NEWS",
    tokens: {
      "--yellow": "#FFB020",
      "--yellow-hot": "#FF9500",
    },
    handles: {
      "@smileke": "@w21news",
      "#SmileSquad": "#NewsDesk",
      "good vibes under one Smile desk":
        "headline desk — fast, fair, sourced.",
    },
    tagline: "headline desk — fast, fair, sourced.",
    accent: "#FFB020",
  },
  w21education: {
    id: "w21education",
    name: "W21 Education",
    wordmark: "W21│LEARN",
    tokens: {
      "--yellow": "#22C55E",
      "--yellow-hot": "#16A34A",
    },
    handles: {
      "@smileke": "@w21learn",
      "#SmileSquad": "#LearnerCrew",
      "good vibes under one Smile desk":
        "structured curriculum, live office hours.",
    },
    tagline: "structured curriculum, live office hours.",
    accent: "#22C55E",
  },
  w21culture: {
    id: "w21culture",
    name: "W21 Culture",
    wordmark: "W21│CULTURE",
    tokens: {
      "--yellow": "#F97316",
      "--yellow-hot": "#EA580C",
    },
    handles: {
      "@smileke": "@w21culture",
      "#SmileSquad": "#CultureCrew",
      "good vibes under one Smile desk":
        "music, film, food — the culture desk.",
    },
    tagline: "music, film, food — the culture desk.",
    accent: "#F97316",
  },
  w21sports: {
    id: "w21sports",
    name: "W21 Sports",
    wordmark: "W21│SPORTS",
    tokens: {
      "--yellow": "#84CC16",
      "--yellow-hot": "#65A30D",
    },
    handles: {
      "@smileke": "@w21sports",
      "#SmileSquad": "#TouchlineFam",
      "good vibes under one Smile desk":
        "matchday desk — live reactions, tactics, results.",
    },
    tagline: "matchday desk — live reactions, tactics, results.",
    accent: "#84CC16",
  },
};

/** Resolve a brand by id — never throws (falls back to default `smile`). */
export function getBrand(id: SmileBrandId | string): SmileBrand {
  return (brands as Record<string, SmileBrand>)[id] ?? brands.smile;
}

/** Brand ids as an array — useful for selectors / scene lists. */
export const brandKeys = Object.keys(brands) as SmileBrandId[];

/**
 * Apply a brand's token overrides to a CSSProperties-like record.
 * Use it on a wrapper `<div style={applyBrand(brand)}>` so all
 * descendants see the right `--yellow` etc.
 */
export function applyBrandTokens(brand: SmileBrand): Record<string, string> {
  return { ...brand.tokens };
}

/**
 * Apply the handles map to a UI string. Replaces every `old` key
 * with its `new` value (case-sensitive, longest-match-first to
 * avoid prefix collisions).
 */
export function applyHandles(
  brand: SmileBrand,
  input: string,
): string {
  if (!input) return input;
  const entries = Object.entries(brand.handles).sort(
    (a, b) => b[0].length - a[0].length,
  );
  let out = input;
  for (const [from, to] of entries) {
    if (from === to) continue;
    out = out.split(from).join(to);
  }
  return out;
}
