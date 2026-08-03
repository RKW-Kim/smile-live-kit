# 11 — TRANSPORT REALTIME

## Socket.io for Console→Scene Control, WebSocket for Live Market Data

Smile Live Kit has two realtime paths:

1. **Console → Scene transport** — the console pushes state (active scene, ticker text, channel color, tally, schedule) to N scene routes simultaneously. Uses **Socket.io** (reconnection, rooms, ack, fallback to long-polling).
2. **Live market data** — Deriv's WebSocket pushes price ticks to the scene's ticker component. Uses **native WebSocket** (the browser's built-in `WebSocket` API — Deriv's socket is the source; we just bridge it).

This document specifies both paths.

---

## The Two Paths — Why Different Technologies

| Path | Tech | Why |
|------|------|-----|
| Console → Scene | Socket.io | Needs reconnection, rooms (per-scene event routing), ack (the console needs to know the scene received the state change), and fallback to long-polling (for restrictive networks). Socket.io provides all of this. |
| Market data | Native WebSocket | Deriv's API is a WebSocket server. We connect directly. No reconnection/room semantics needed — Deriv's protocol handles its own resubscription. Socket.io would add a wrapper with no benefit. |

---

## Path 1 — Console → Scene Transport (Socket.io)

### The server

The Socket.io server is attached to the Next.js app. The exact attachment depends on the deployment target:

#### Option A — Vercel (serverless)

Vercel serverless functions have a 10s (Hobby) / 60s (Pro) max duration. A long-lived Socket.io connection does NOT work on Vercel serverless — the connection dies when the function cold-starts.

**Mitigations (pick one):**
1. **Use Vercel's Edge Runtime with WebSocket support** (if/when Vercel ships WebSocket-on-Edge generally available). The Socket.io server runs on the Edge; connections persist.
2. **Host the Socket.io server on a separate persistent host** (Render, Railway, Fly.io, or the same VPS that runs FFmpeg for 24/7). The Next.js app's scene routes connect to the external Socket.io URL via `NEXT_PUBLIC_SOCKETIO_URL`.
3. **Skip Socket.io for console→scene transport** — use Server-Sent Events (SSE) for server→scene pushes + fetch POST for console→server. SSE works on Vercel serverless (each scene route holds an open SSE connection; the console POSTs state changes; the server fans out via SSE). This is the simplest Vercel-native path.

The v2 foundation codes against the Socket.io API (so the scene routes + console don't care about the deployment target). The deployment target is decided in [`13-GITHUB_MIGRATION_GUIDE.md`](13-GITHUB_MIGRATION_GUIDE.md) §"Socket.io on Vercel". If SSE becomes the chosen path, the Socket.io client in `src/lib/transport/socketClient.ts` is swapped for an SSE client — the React components don't change.

#### Option B — Self-hosted VPS

The Next.js app runs as a long-lived process (`bun run start` with a custom server). The Socket.io server attaches to the same HTTP server. Connections persist. This is the pattern for the 24/7 W21 Trading VPS deployment.

```ts
// src/lib/transport/socketServer.ts (custom server bootstrap)
import { createServer } from 'http'
import { Server } from 'socket.io'
import next from 'next'

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))
  const io = new Server(server, { path: '/api/socketio', cors: { origin: '*' } })

  io.on('connection', (socket) => {
    // ... event handlers (see "The events" below)
  })

  server.listen(3000)
})
```

The custom server replaces the default Next.js server. The `package.json` `start` script becomes `bun run server.ts` (or `node server.js` after a build).

### The client

```ts
// src/lib/transport/socketClient.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKETIO_URL ?? ''  // same origin by default
    socket = io(url, { path: '/api/socketio', transports: ['websocket', 'polling'] })
  }
  return socket
}
```

The client is a singleton. The `TransportProvider` React context wraps it + exposes typed event emitters/listeners via hooks.

### The events

Events are typed in `src/lib/transport/events.ts`:

```ts
// src/lib/transport/events.ts
import type { ChannelKey } from '@/lib/w21/channels'

// ─── State essence ────────────────────────────────────────────────
// Critical state — at-least-once delivery. Scene route must apply.
export interface StateActiveScene {
  activeScene: string  // preset ID
  mode: 'preview' | 'program'
}
export interface StateActiveChannel {
  channel: ChannelKey
}
export interface StateTally {
  sceneId: string
  tally: 'program' | 'preview' | 'cued' | 'idle'
}
export interface StateSchedule {
  schedule: ScheduleBlock[]
  autoPilot: boolean
  currentBlock?: string
}

// ─── Ticker essence ───────────────────────────────────────────────
// At-most-once — latest wins. Old updates dropped.
export interface TickerUpdate {
  text: string
  symbols: string[]
}

// ─── Data essence ─────────────────────────────────────────────────
// At-most-once — latest price wins.
export interface DataTick {
  symbol: string
  price: number
  delta: number
  deltaPercent: number
  source: 'deriv' | 'twelvedata' | 'simulated'
  timestamp: number
}

// ─── Presence essence ─────────────────────────────────────────────
// Best-effort.
export interface PresenceJoin {
  operatorId: string
  role: 'producer' | 'talent' | 'viewer'
  name: string
}
export interface PresenceLeave {
  operatorId: string
}

// ─── Chat essence (future) ────────────────────────────────────────
// Best-effort.
export interface ChatMessage {
  platform: 'youtube' | 'twitch'
  author: string
  text: string
  timestamp: number
}

// ─── The typed event map ──────────────────────────────────────────
export interface ServerToClientEvents {
  'state:activeScene': (payload: StateActiveScene) => void
  'state:activeChannel': (payload: StateActiveChannel) => void
  'state:tally': (payload: StateTally) => void
  'state:schedule': (payload: StateSchedule) => void
  'ticker:update': (payload: TickerUpdate) => void
  'data:tick': (payload: DataTick) => void
  'presence:join': (payload: PresenceJoin) => void
  'presence:leave': (payload: PresenceLeave) => void
  'chat:message': (payload: ChatMessage) => void
}

export interface ClientToServerEvents {
  'state:setActiveScene': (payload: StateActiveScene) => void
  'state:setActiveChannel': (payload: StateActiveChannel) => void
  'state:setTally': (payload: StateTally) => void
  'state:setSchedule': (payload: StateSchedule) => void
  'ticker:send': (payload: TickerUpdate) => void
  'presence:join': (payload: PresenceJoin) => void
}
```

### Essence separation (ST 2110 philosophy)

Following the ST 2110 broadcast standard (essence = an independent stream of a single essence type — video, audio, control, telemetry), Smile Live Kit separates its Socket.io events by essence. A flood of `data:tick` events can never block a `state:activeScene` event because they are different event names with different handler queues.

| Essence | Events | Reliability | Priority |
|---------|--------|-------------|----------|
| `state` | `state:activeScene`, `state:activeChannel`, `state:tally`, `state:schedule` | At-least-once (critical state must arrive) | High |
| `ticker` | `ticker:update` | At-most-once (latest wins; old updates dropped) | Medium |
| `data` | `data:tick` | At-most-once (latest price wins) | Low (high volume) |
| `presence` | `presence:join`, `presence:leave` | Best-effort | Low |
| `chat` (future) | `chat:message` | Best-effort | Low |

### Rooms

Each scene route, on mount, joins a Socket.io room keyed by the route:
- `/scenes/trading-live` → joins room `scene:trading-live`.
- `/overlays/ticker` → joins room `overlay:ticker`.

The server fans out events to the right rooms:
- `state:activeScene` → broadcast to all `scene:*` rooms (every scene needs to know if it just became active).
- `state:activeChannel` → broadcast to all `scene:*` AND `overlay:*` rooms (everyone recolors).
- `ticker:update` → broadcast to `scene:*` AND `overlay:ticker` rooms.
- `data:tick` → broadcast to `scene:*` AND `overlay:ticker` rooms (only the scenes/overlays that care about prices).
- `presence:*` → broadcast to the console room `console:main`.

### The TransportProvider

```tsx
// src/components/transport/TransportProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSocket } from '@/lib/transport/socketClient'
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/transport/events'
import { Socket } from 'socket.io-client'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface TransportContextValue {
  socket: TypedSocket | null
  connected: boolean
}

const TransportContext = createContext<TransportContextValue>({ socket: null, connected: false })

export function TransportProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const s = getSocket() as TypedSocket
    setSocket(s)
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <TransportContext.Provider value={{ socket, connected }}>
      {children}
    </TransportContext.Provider>
  )
}

export function useTransport() {
  return useContext(TransportContext)
}
```

### The TransportReconnectBanner

When `connected` is false, a banner appears at the top of the console:

```
⚠ Console disconnected. Reconnecting…
```

The banner is amber (Press Amber `#FF8C00`) — the same color as the "connecting" stream status. It auto-dismisses when `connected` returns to true.

Scene routes also show a small "disconnected" indicator (a red dot in the top-right next to the Live badge) when their Socket.io connection drops. The scene continues rendering with its last-known state (the ticker keeps scrolling with the last prices; the W21 mark stays in the last channel color) until the connection restores.

---

## Path 2 — Live Market Data (Native WebSocket)

### The Deriv client

```ts
// src/lib/data/deriv.ts
type TickHandler = (tick: { symbol: string; price: number; epoch: number }) => void

export class DerivClient {
  private socket: WebSocket | null = null
  private subscriptions = new Map<string, Set<TickHandler>>()
  private reconnectAttempts = 0

  constructor(private appId: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${this.appId}`)
      this.socket.onopen = () => {
        this.reconnectAttempts = 0
        this.resubscribeAll()
        resolve()
      }
      this.socket.onmessage = (e) => this.handleMessage(e)
      this.socket.onclose = () => this.handleClose()
      this.socket.onerror = reject
    })
  }

  subscribe(symbol: string, handler: TickHandler) {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set())
      this.send({ ticks: symbol, subscribe: 1 })
    }
    this.subscriptions.get(symbol)!.add(handler)
  }

  unsubscribe(symbol: string, handler: TickHandler) {
    this.subscriptions.get(symbol)?.delete(handler)
    if (this.subscriptions.get(symbol)?.size === 0) {
      this.subscriptions.delete(symbol)
      this.send({ forget_all: 'ticks' })  // simplification — real impl tracks subscription IDs
    }
  }

  private handleMessage(e: MessageEvent) {
    const msg = JSON.parse(e.data)
    if (msg.tick) {
      const handlers = this.subscriptions.get(msg.tick.symbol)
      handlers?.forEach((h) => h({ symbol: msg.tick.symbol, price: msg.tick.quote, epoch: msg.tick.epoch }))
    }
  }

  private handleClose() {
    // Exponential backoff reconnect
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts++, 30_000)
    setTimeout(() => this.connect().catch(() => {}), delay)
  }

  private resubscribeAll() {
    for (const symbol of this.subscriptions.keys()) {
      this.send({ ticks: symbol, subscribe: 1 })
    }
  }

  private send(payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload))
    }
  }
}
```

### The useMarketData hook

```ts
// src/hooks/use-market-data.ts
'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface PriceSnapshot {
  price: number
  delta: number
  deltaPercent: number
  source: 'deriv' | 'twelvedata' | 'simulated'
  timestamp: number
}

export function useMarketData(symbol: string): PriceSnapshot | null {
  const isDeriv = symbol.match(/^(R_\d+|stpRNG|RDBEAR|RDBULL|BOOM\d+|CRASH\d+)$/)
  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null)

  // Initial fetch (one-shot REST)
  const { data: initial } = useQuery({
    queryKey: ['market-data', symbol],
    queryFn: async () => {
      const source = isDeriv ? 'deriv' : 'twelvedata'
      const res = await fetch(`/api/data/${source}?symbol=${encodeURIComponent(symbol)}`)
      if (!res.ok) throw new Error(`Failed to fetch ${symbol}`)
      return res.json() as Promise<PriceSnapshot>
    },
    staleTime: 30_000,
  })

  useEffect(() => {
    if (initial) setSnapshot(initial)
  }, [initial])

  // Live updates: Socket.io data:tick events for this symbol
  useEffect(() => {
    const { socket } = getTransport()
    if (!socket) return
    const handler = (tick: DataTick) => {
      if (tick.symbol === symbol) {
        setSnapshot({
          price: tick.price,
          delta: tick.delta,
          deltaPercent: tick.deltaPercent,
          source: tick.source,
          timestamp: tick.timestamp,
        })
      }
    }
    socket.on('data:tick', handler)
    return () => { socket.off('data:tick', handler) }
  }, [symbol])

  return snapshot
}
```

The hook:
1. Does an initial REST fetch (one-shot, cached by TanStack Query for 30s).
2. Subscribes to `data:tick` Socket.io events for the symbol.
3. Updates the snapshot when a new tick arrives.

The server's data layer (see [`10-DATA_FEEDS.md`](10-DATA_FEEDS.md)) bridges Deriv's WebSocket → Socket.io `data:tick` events. The scene route's Ticker component uses `useMarketData` per symbol.

### Why not connect the browser directly to Deriv?

The browser COULD connect directly to Deriv's WebSocket (`wss://ws.derivws.com/...`). But:
1. The Deriv API token would be exposed to the browser (security risk).
2. Multiple scene routes + the console would each open their own Deriv socket (wasteful — Deriv rate-limits per connection).
3. The budget-gating layer + simulated fallback couldn't run server-side.

So the server bridges Deriv → Socket.io. The browser sees only Socket.io `data:tick` events. One Deriv socket, many scene subscribers.

---

## Reconnection + Resilience

| Path | Reconnect strategy | State recovery |
|------|--------------------|----------------|
| Console ↔ Server (Socket.io) | Socket.io auto-reconnect with exponential backoff. | On reconnect, the client emits `state:sync` (custom event); the server responds with the full current state (active scene, channel, tally, schedule, ticker). |
| Scene ↔ Server (Socket.io) | Same. | On reconnect, the scene emits `state:sync`; the server responds with the current state. The scene re-applies. |
| Server ↔ Deriv (WebSocket) | Custom exponential backoff (see `DerivClient.handleClose`). | On reconnect, `resubscribeAll()` re-subscribes to all active symbols. |

The "state sync on reconnect" pattern is critical — it means a scene that briefly loses its Socket.io connection (e.g., OBS refreshes the Browser Source) does NOT stay stuck on stale state. It re-syncs.

---

## Performance

- The `data:tick` event is high-volume (potentially 50+ events/sec across all symbols). The Socket.io server batches ticks per symbol — only the latest tick per symbol is sent per 100ms window. The browser's `useMarketData` hook sets state at most every 100ms (throttled) to avoid React re-render storms.
- The `ticker:update` event is low-volume (operator types a few times per minute). No batching.
- The `state:*` events are low-volume (a few per minute during a live show). No batching.
- The Socket.io server logs connection counts + event counts to the console's DataStatus panel for monitoring.

---

## Security

- The Socket.io server validates every incoming event against the typed event map (Zod schemas at the boundary). Malformed events are dropped + logged.
- The console's `state:set*` events are accepted from any connected client (no auth in v2 — the console is open in dev; auth is added when the kit is exposed publicly).
- The scene routes' `state:sync` requests are read-only (they ask for state; they cannot set state).
- The OBS WebSocket bridge (when configured) holds the OBS password server-side; the browser never sees it.

---

## Out of Scope

- **Multi-operator presence** (multiple consoles editing the same scene graph simultaneously) — future. The v2 transport is single-console, multi-scene.
- **Chat ingest** (YouTube/Twitch chat → overlays) — future. The `chat:message` event is defined but no ingester is built.
- **WebRTC for live video** — out of scope. OBS handles video. Smile Live Kit scenes are DOM/CSS, not video.
- **Server-side rendering of scenes for VOD export** — future. The kit renders live; baking a scene into a VOD is an OBS / FFmpeg job.

---

*Next: [`12-KNOWN_ISSUES.md`](12-KNOWN_ISSUES.md) for bugs, gotchas, and SSR pitfalls.*
