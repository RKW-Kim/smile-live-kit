# SMILE LOCAL BRIDGE - double-click run-bridge.bat - status: http://localhost:8787
# Single poller (no double-counting) + tiny static server so OBS loads pages over localhost
# (=> the scene JSON has NO disk paths => works from any clone/unzip location) + brand server.
# Indices gated to US market hours @1/min with a 790/day hard fuse (fits Twelve Data Basic 800/day).
# Secrets (the API key) are read from git-ignored secrets.env next to this file.
import json, time, threading, urllib.request, os, re, datetime, mimetypes, posixpath
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
try:
    from zoneinfo import ZoneInfo; NY = ZoneInfo("America/New_York"); HAVE_NY = True
except Exception:
    NY = None; HAVE_NY = False

PORT = 8787
HERE = os.path.dirname(os.path.abspath(__file__))

def load_env():
    e = {}
    p = os.path.join(HERE, "secrets.env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line: continue
            k, v = line.split("=", 1); e[k.strip()] = v.strip().strip('"').strip("'")
    return e
ENV = load_env()
BRAND_FILE = os.environ.get("BRAND_FILE", ENV.get("BRAND_FILE", os.path.join(HERE, "brand.json")))
ACTIVE_FILE = os.path.join(HERE, "active.json")
TWELVEDATA_KEY = os.environ.get("TWELVEDATA_KEY", ENV.get("TWELVEDATA_KEY", ""))
SMILE_QUOTE_URL = os.environ.get("SMILE_QUOTE_URL", ENV.get("SMILE_QUOTE_URL", ""))
SMILE_ACTIVE_URL = os.environ.get("SMILE_ACTIVE_URL", ENV.get("SMILE_ACTIVE_URL", ""))

SYMBOLS = [
    {"s":"BTC/USDT","prov":"bin","sym":"BTCUSDT","dec":2},{"s":"ETH/USDT","prov":"bin","sym":"ETHUSDT","dec":2},
    {"s":"BNB/USDT","prov":"bin","sym":"BNBUSDT","dec":2},{"s":"XRP/USDT","prov":"bin","sym":"XRPUSDT","dec":3},
    {"s":"SOL/USDT","prov":"bin","sym":"SOLUSDT","dec":2},{"s":"XAU/USD","prov":"met","sym":"gold","dec":1},
    {"s":"XAG/USD","prov":"met","sym":"silver","dec":2},{"s":"USD/KES","prov":"fx","sym":"kes","dec":2,"inv":False},
    {"s":"EUR/USD","prov":"fx","sym":"eur","dec":4,"inv":True},{"s":"GBP/USD","prov":"fx","sym":"gbp","dec":4,"inv":True},
    {"s":"S&P 500","prov":"td","sym":"SPX500","dec":1},{"s":"NAS 100","prov":"td","sym":"NAS100","dec":1},
    {"s":"CRASH500","prov":"smile","sym":"CRASH500","dec":2},
]
DATA = {s["s"]: {"symbol": s["s"], "price": None, "change": 0.0} for s in SYMBOLS}
META = {"updated": 0, "sources": {}}; LOCK = threading.Lock(); UA = {"User-Agent": "SmileStreamBridge/1.0"}
TD = {"count": 0, "day": None, "last": 0}

def get(url, t=8):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t) as r:
        return json.loads(r.read().decode("utf-8"))
def now_ny():
    return datetime.datetime.now(NY) if HAVE_NY else datetime.datetime.utcnow()
def is_us_open():
    n = now_ny()
    if HAVE_NY: return n.weekday() < 5 and 9*60+30 <= n.hour*60+n.minute < 16*60
    return n.weekday() < 5 and 13*60 <= n.hour*60+n.minute <= 21*60
def td_allowed():
    n = now_ny(); d = n.date()
    if TD["day"] != d: TD["day"] = d; TD["count"] = 0
    return is_us_open() and TD["count"] < 790 and time.time() - TD["last"] >= 60

def poll():
    while True:
        src = {}
        try:
            syms = ",".join('"' + s["sym"] + '"' for s in SYMBOLS if s["prov"] == "bin")
            m = {d["symbol"]: d for d in get("https://data-api.binance.vision/api/v3/ticker/24hr?symbols=[" + syms + "]")}
            for s in SYMBOLS:
                if s["prov"] == "bin" and s["sym"] in m:
                    with LOCK:
                        DATA[s["s"]]["price"] = round(float(m[s["sym"]]["lastPrice"]), s["dec"])
                        DATA[s["s"]]["change"] = round(float(m[s["sym"]]["priceChangePercent"]), 2)
            src["binance"] = "ok"
        except Exception: src["binance"] = "err"
        try:
            a = get("https://api.metals.live/v1/spot"); m = a[0] if isinstance(a, list) else a
            for s in SYMBOLS:
                if s["prov"] == "met" and s["sym"] in m:
                    with LOCK: DATA[s["s"]]["price"] = round(float(m[s["sym"]]), s["dec"])
            src["metals"] = "ok"
        except Exception: src["metals"] = "err"
        try:
            u = get("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json").get("usd", {})
            for s in SYMBOLS:
                if s["prov"] == "fx" and s["sym"] in u:
                    rate = float(u[s["sym"]]); p = (1.0/rate) if s.get("inv") else rate
                    with LOCK: DATA[s["s"]]["price"] = round(p, s["dec"])
            src["fx"] = "ok"
        except Exception: src["fx"] = "err"
        if TWELVEDATA_KEY and td_allowed():
            try:
                for s in SYMBOLS:
                    if s["prov"] == "td":
                        p = float(get("https://api.twelvedata.com/price?symbol=%s&apikey=%s" % (s["sym"], TWELVEDATA_KEY))["price"])
                        with LOCK: DATA[s["s"]]["price"] = round(p, s["dec"]); TD["count"] += 1
                TD["last"] = time.time(); src["twelvedata"] = "ok (%d/790 today)" % TD["count"]
            except Exception: src["twelvedata"] = "err"
        else:
            src["twelvedata"] = "idle (market closed / fuse)" if TWELVEDATA_KEY else "no key"
        if SMILE_QUOTE_URL:
            try:
                for d in get(SMILE_QUOTE_URL):
                    sym = d.get("symbol") or d.get("s")
                    if sym in DATA:
                        with LOCK:
                            DATA[sym]["price"] = round(float(d["price"]), 2)
                            if d.get("change") is not None: DATA[sym]["change"] = round(float(d["change"]), 2)
                src["smile"] = "ok"
            except Exception: src["smile"] = "err"
        with LOCK: META["updated"] = time.time(); META["sources"] = src
        time.sleep(4)

def read_active():
    if os.path.exists(ACTIVE_FILE):
        try:
            with open(ACTIVE_FILE, encoding="utf-8") as f: return json.load(f)
        except Exception: pass
    if SMILE_ACTIVE_URL:
        try: return get(SMILE_ACTIVE_URL)
        except Exception: pass
    return {"symbol": None}
def read_brand():
    if os.path.exists(BRAND_FILE):
        try:
            with open(BRAND_FILE, encoding="utf-8") as f: return json.load(f)
        except Exception: pass
    return {}

class H(BaseHTTPRequestHandler):
    def _json(self, obj, code=200):
        b = json.dumps(obj).encode("utf-8")
        self.send_response(code); self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Cache-Control", "no-store")
        self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self):
        self.send_response(204); self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*"); self.end_headers()
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/quotes.json":
            with LOCK: self._json(list(DATA.values()))
        elif path == "/active": self._json(read_active())
        elif path == "/brand.json": self._json(read_brand())
        elif path.startswith("/klines"):
            q = dict(re.findall(r"([a-zA-Z]+)=([^&]+)", self.path)); sym = q.get("symbol", "")
            mb = {s["s"]: s["sym"] for s in SYMBOLS if s["prov"] == "bin"}; out = []
            if sym in mb:
                try: out = [[int(c[0]), float(c[1]), float(c[2]), float(c[3]), float(c[4])] for c in
                            get("https://data-api.binance.vision/api/v3/klines?symbol=%s&interval=1m&limit=80" % mb[sym])]
                except Exception: out = []
            self._json(out)
        elif path == "/":
            with LOCK:
                rows = "".join("<tr><td>%s</td><td>%s</td><td>%s</td></tr>" % (v["symbol"], v["price"] if v["price"] is not None else "-", v["change"]) for v in DATA.values())
                srcs = "<br>".join("%s: %s" % (k, v) for k, v in META["sources"].items())
            html = ("<meta charset=utf-8><body style='font-family:sans-serif;background:#0a0a0a;color:#eee;padding:24px'>"
                    "<h2 style='color:#FFC107'>Smile Bridge - live</h2><p>updated %ss ago - brand=%s - key=%s</p>"
                    "<table border=1 cellpadding=6 style='border-color:#333;border-collapse:collapse'><tr><th>symbol</th><th>price</th><th>chg%%</th></tr>%s</table>"
                    "<p>%s</p><p>active = %s</p></body>") % (
                    int(time.time()-META["updated"]) if META["updated"] else "never",
                    os.path.basename(BRAND_FILE), "yes" if TWELVEDATA_KEY else "no", rows, srcs, read_active().get("symbol"))
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*"); self.end_headers(); self.wfile.write(html.encode("utf-8"))
        else:  # static file from THIS folder (portable: pages + css + js served over localhost)
            rel = posixpath.normpath(path.lstrip("/"))
            if rel.startswith("..") or os.path.isabs(rel):
                self.send_error(403); return
            fp = os.path.join(HERE, rel)
            if not os.path.isfile(fp):
                self.send_error(404); return
            ctype = mimetypes.guess_type(fp)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype == "application/javascript": ctype += "; charset=utf-8"
            with open(fp, "rb") as f: data = f.read()
            self.send_response(200); self.send_header("Content-Type", ctype)
            self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Cache-Control", "no-store")
            self.end_headers(); self.wfile.write(data)
    def log_message(self, *a): pass

if __name__ == "__main__":
    threading.Thread(target=poll, daemon=True).start()
    print("Smile bridge -> http://localhost:%d  (brand=%s, key=%s)  Ctrl+C to stop" % (
        PORT, os.path.basename(BRAND_FILE), "yes" if TWELVEDATA_KEY else "no"))
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
