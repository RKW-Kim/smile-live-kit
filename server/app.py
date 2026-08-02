"""Bridge server: statics + mock market + autotalk state broadcast."""

from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from server.config import BRIDGE_HOST, BRIDGE_PORT, CORE_DIR, MOCK_MARKET
from server import mock_market


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="smile-live-kit bridge", lifespan=lifespan)
app.mount("/core", StaticFiles(directory=str(CORE_DIR)), name="core")

# Connected overlay clients watching autotalk state
autotalk_clients: set[WebSocket] = set()


@app.get("/api/market/ticker")
async def market_ticker():
    if MOCK_MARKET:
        return JSONResponse(mock_market.tick())
    return JSONResponse({"error": "real provider not configured"}, status_code=501)


@app.websocket("/api/market/ws")
async def market_ws(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = mock_market.tick() if MOCK_MARKET else []
            await ws.send_json(data)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass


@app.websocket("/api/autotalk/state")
async def autotalk_state(ws: WebSocket):
    await ws.accept()
    autotalk_clients.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        autotalk_clients.discard(ws)


async def _broadcast(state: dict):
    dead = []
    for c in list(autotalk_clients):
        try:
            await c.send_json(state)
        except Exception:
            dead.append(c)
    for c in dead:
        autotalk_clients.discard(c)


@app.post("/api/autotalk/push")
async def autotalk_push(state: dict):
    await _broadcast(state)
    return {"ok": True, "clients": len(autotalk_clients)}


@app.get("/health")
async def health():
    return {"status": "ok", "mock_market": MOCK_MARKET, "autotalk_clients": len(autotalk_clients)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=BRIDGE_HOST, port=BRIDGE_PORT)
