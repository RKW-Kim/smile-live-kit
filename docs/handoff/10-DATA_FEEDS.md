# 10 — DATA FEEDS

## Market Data Layer — Deriv, Twelve Data, Budget-Gating, Ticker

The W21 Trading ticker needs live market data — synthetic indices (Deriv) and forex (Twelve Data). Both APIs have free tiers with daily call limits. A 24/7 stream would burn through them in hours if polled naively. This document specifies the data layer that gets live prices onto the screen without breaking the budget.

---

## The Data Sources

### 1. Deriv — Synthetic Indices (Primary for W21 Trading)

- **API:** Deriv WebSocket API at `wss://ws.derivws.com/websockets/v3?app_id=<APP_ID>`.
- **Auth:** API token (free, register at `deriv.app`). Server-side only — `DERIV_API_TOKEN` env var.
- **Symbols (the W21 Trading ticker set):**
  - `R_10` (V10), `R_25` (V25), `R_50` (V50), `R_75` (V75), `R_100` (V100)
  - `stpRNG` (Step Index)
  - `RDBEAR` (Bear Market Index), `RDBULL` (Bull Market Index)
  - `BOOM500` (Boom 500), `BOOM1000` (Boom 1000), `CRASH500` (Crash 500), `CRASH1000` (Crash 1000)
- **Subscription model:** `{ "ticks": "<symbol>", "subscribe": 1 }` — push-based. One open socket, subscribe to each symbol the active scene needs. The server pushes a tick every ~1-2 seconds per symbol.
- **Limits:** No hard daily limit on the free tier for tick subscriptions. Rate-limited per connection (max ~50 concurrent subscriptions per token).
- **Reconnect:** The client auto-reconnects with exponential backoff. On reconnect, re-subscribes to all active symbols.

### 2. Twelve Data — Forex (Secondary)

- **API:** Twelve Data REST API at `https://api.twelvedata.com/`.
- **Auth:** API key (free, register at `twelvedata.com`). Server-side only — `TWELVEDATA_API_KEY` env var.
- **Symbols (the W21 Trading forex set):**
  - `EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CHF`, `AUD/USD`, `USD/CAD`, `NZD/USD`
  - `USD/KES` (Kenyan shilling — local relevance), `EUR/KES`, `GBP/KES`
  - `XAU/USD` (gold), `XAG/USD` (silver)
- **Endpoints:**
  - `GET /price?symbol=<SYMBOL>&apikey=<KEY>` — latest price.
  - `GET /quote?symbol=<SYMBOL>&apikey=<KEY>` — latest price + OHLC + change.
- **Limits (free tier):** 800 API credits/day, 8 credits/min. A `/price` call costs 1 credit; a `/quote` call costs 1 credit. With caching (see below), the daily budget is well within limits for a 24/7 ticker showing 5-10 forex symbols.
- **WebSocket:** Twelve Data offers a WebSocket API (`wss://ws.twelvedata.com`) for real-time prices on paid tiers. The free tier is REST-only — we cache.

---

## The Budget-Gating Layer

The budget-gating layer sits between the data sources and the scene routes. It enforces the daily API budget + provides a simulated fallback.

### How it works

```
Scene route (Ticker component)
    ↓
useMarketData('V75')  ← React hook
    ↓
budgetGate.get('V75')
    ↓
  ┌───────────────────────────────────┐
  │  Cache hit (last fetch < 30s)?   │ → return cached price
  └───────────────────────────────────┘
            ↓ (cache miss)
  ┌───────────────────────────────────┐
  │  Daily budget remaining?         │ → fetch from source, cache, return
  └───────────────────────────────────┘
            ↓ (budget exhausted)
  ┌───────────────────────────────────┐
  │  Simulated fallback              │ → return simulated random-walk price
  │  (labeled "SIM" in UI)            │   with the last real price as the seed
  └───────────────────────────────────┘
```

### The budget tracker

```ts
// src/lib/data/budgetGate.ts
interface BudgetTracker {
  source: 'deriv' | 'twelvedata'
  dailyLimit: number          // 800 for Twelve Data free tier
  used: number                // resets at 00:00 UTC
  resetAt: Date               // next midnight UTC
  cache: Map<string, { price: number; fetchedAt: Date }>
  cacheTtlMs: number          // 30_000 for Twelve Data; 0 for Deriv (push-based)

  get(symbol: string): Promise<PriceSnapshot>
  // ...
}
```

### Deriv vs Twelve Data: different budget-gating strategies

- **Deriv (WebSocket, push-based):** no REST budget to track. The budget-gating layer is a thin wrapper that manages the WebSocket subscription lifecycle. The "daily limit" concept doesn't apply — Deriv's free tier is generous for tick subscriptions.
- **Twelve Data (REST, poll-based):** the budget-gating layer is critical. Each REST call costs a credit. The cache TTL (default 30s) prevents redundant calls. The simulated fallback kicks in when the daily budget is exhausted.

### The simulated fallback

When the budget is exhausted, the data layer returns a simulated price:

```ts
function simulatePrice(lastRealPrice: number, volatility: number): number {
  // Random walk: newPrice = lastRealPrice * (1 + N(0, volatility))
  const drift = (Math.random() - 0.5) * 2 * volatility
  return lastRealPrice * (1 + drift)
}
```

The simulation uses the last real price as the seed and a per-symbol volatility (V100 is more volatile than V10; EUR/USD is less volatile than XAU/USD). The simulated price is clearly labeled "SIM" in the UI — the ticker shows `▶ V75 1,234.56 SIM` so the viewer knows the price is not live. This is a transparency measure (per `verticals/w21-trading/STRATEGIC_BRIEF.md` §"Pre-recorded authenticity").

### The "data status" indicator

The console's StreamHealthPanel (or a dedicated DataStatus panel) shows:
- **Deriv:** `Connected` / `Reconnecting…` / `Disconnected`.
- **Twelve Data:** `800/800 credits` / `432/800 credits` / `0/800 credits — SIM`.
- **Simulated fallback:** `OFF` / `ON (V75, V100)` (lists which symbols are in SIM).

---

## The Ticker Component

The ticker is a horizontal strip at the bottom of the scene (or a standalone overlay route). It shows live prices + custom text from the console.

### Anatomy (left → right)

1. **Leading edge** — a 4px-wide vertical bar in the channel color.
2. **Symbol chip** — `▶ V75` rendered with the channel color as the background at 20% opacity. The `▶` is a small triangle glyph.
3. **Price** — mono, 24px, Grid White, `tabular-nums`.
4. **Delta** — mono, 18px, bull-green or bear-red. `+2.34%` / `-0.18%`. With a small up/down arrow.
5. **Separator** — a 16px gap, then a 1px hairline Grid White divider at 20%, then a 16px gap.
6. Repeat 2-5 for each symbol.
7. **Custom text** — after the symbols, the console's ticker text scrolls. Same mono typography.

### Animation

- The ticker scrolls right-to-left at 60px/sec. Framer Motion `useAnimationFrame` drives the transform.
- On hover (in the console preview only — not on the OBS-rendered scene), the ticker pauses.
- When new data arrives (Socket.io `data` event), the corresponding symbol's price updates with a 200ms ease-out flash: the price text transitions Grid White → channel color → Grid White.

### The data flow

```
Console (TickerEditor)
    ↓ Socket.io "ticker" event
    ↓ { text: "...", symbols: [...] }
    ↓
Scene route (Ticker component)
    ↓ Reads ticker config from Socket.io state
    ↓ Subscribes to each symbol via useMarketData hook
    ↓
useMarketData hook
    ↓ Subscribes to Deriv WebSocket (for synthetics)
    ↓ Polls Twelve Data via /api/data/twelvedata (for forex, cached)
    ↓
Ticker renders: symbol chips + prices + custom text
```

### The symbol chip

When the operator types `▶ V75` in the TickerEditor, the editor recognizes the pattern (regex `▶\s*(\w+)`) and renders it as a chip. The chip's price updates in real time. If the operator types plain text (no `▶`), it's rendered as static text.

The chip's data source is determined by the symbol:
- Synthetic-indices symbols (V10-V100, Step Index, Boom/Crash) → Deriv.
- Forex symbols (EUR/USD, USD/KES, etc.) → Twelve Data.
- Unknown symbols → rendered as static text (no live price).

---

## The Price Readout Component

The PriceReadout is a large-format price display for the scene's hero symbol (e.g., the V75 price in the center of the trading-live scene).

### Anatomy

```
┌────────────────────────────────┐
│ V75                            │  ← symbol, mono, 36px, Grid White
│                                │
│ 1,234.56                       │  ← price, mono, 96px, Grid White, tabular-nums
│                                │
│ ▲ +28.91  +2.39%               │  ← delta, mono, 24px, bull-green
│                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← sparkline (last 60 ticks), channel color
└────────────────────────────────┘
```

The sparkline is a 60-tick rolling window rendered as an SVG path (no chart library — keep it lightweight). The line color is the channel color. The fill (below the line) is the channel color at 10% opacity.

---

## The API Routes

### `GET /api/data/deriv?symbol=V75`

Returns the current price snapshot for a Deriv symbol. Server-side proxies to the Deriv WebSocket (or returns the cached last tick). Used for one-shot hydration on scene mount.

```json
{
  "symbol": "V75",
  "price": 1234.56,
  "delta": 28.91,
  "deltaPercent": 2.39,
  "fetchedAt": "2026-08-03T12:34:56.789Z",
  "source": "deriv"
}
```

### `GET /api/data/twelvedata?symbol=EUR/USD`

Returns the current price snapshot for a Twelve Data symbol. Server-side checks the cache → fetches if stale → respects the daily budget → falls back to simulated if budget exhausted.

```json
{
  "symbol": "EUR/USD",
  "price": 1.0854,
  "delta": 0.0023,
  "deltaPercent": 0.21,
  "fetchedAt": "2026-08-03T12:34:56.789Z",
  "source": "twelvedata",
  "simulated": false
}
```

When simulated:
```json
{
  "symbol": "EUR/USD",
  "price": 1.0856,
  "delta": 0.0025,
  "deltaPercent": 0.23,
  "fetchedAt": "2026-08-03T12:34:56.789Z",
  "source": "twelvedata",
  "simulated": true
}
```

### `GET /api/data/status`

Returns the data-layer status for the console's DataStatus panel:

```json
{
  "deriv": { "connected": true, "subscriptions": 5 },
  "twelvedata": { "creditsUsed": 432, "creditsLimit": 800, "resetAt": "2026-08-04T00:00:00.000Z" },
  "simulated": ["EUR/USD"]  // symbols currently in simulated fallback
}
```

---

## Storage (Prisma)

### The PriceSnapshot model (for the trade journal + the sparkline's historical window)

```prisma
model PriceSnapshot {
  id        String   @id @default(cuid())
  symbol    String   // "V75", "EUR/USD", etc.
  price     Float
  delta     Float?
  source    String   // "deriv" | "twelvedata" | "simulated"
  timestamp DateTime @default(now())

  @@index([symbol, timestamp])
}
```

Snapshots are written every ~30 seconds (per symbol) for the active scene's hero symbol. Used for the sparkline's 60-tick window + for the trade journal's historical chart. Old snapshots (>30 days) are pruned by a scheduled job.

---

## Security

- API tokens (`DERIV_API_TOKEN`, `TWELVEDATA_API_KEY`) are server-side only. Never prefixed with `NEXT_PUBLIC_`. Never sent to the browser.
- The browser calls `/api/data/<source>?symbol=<X>`; the API route holds the token + proxies.
- Rate-limit the API routes (per-IP) to prevent abuse: 60 req/min for `/api/data/*`.
- The simulated fallback is server-side too — the browser cannot tell the difference between a real price and a simulated one except via the `simulated: true` field in the response.

---

## Out of Scope

- **Historical price data (1-minute / 1-hour / 1-day candles):** Twelve Data supports this on paid tiers; Deriv supports it via the `candles_history` API. Out of scope for v2 — the sparkline uses the rolling 60-tick window, not historical candles.
- **Order placement / trade execution:** Smile Live Kit is read-only for market data. It does NOT place trades. (The W21 Trading channel is educational; viewers use their own Deriv/MT5 accounts.)
- **Multiple Deriv accounts:** One Deriv API token per deployment. Multi-account aggregation is out of scope.
- **Real-time forex via WebSocket:** Twelve Data's WebSocket is paid-tier. The free-tier REST + 30s cache is sufficient for a ticker that scrolls at 60px/sec.

---

*Next: [`11-TRANSPORT_REALTIME.md`](11-TRANSPORT_REALTIME.md) for the Socket.io transport spec.*
