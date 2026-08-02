import os

FILES = {
    "core/smile-mark.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="48" fill="#FFC800" />
  <circle cx="31" cy="35" r="5.5" fill="#000000" />
  <circle cx="69" cy="35" r="5.5" fill="#000000" />
  <path
    d="M 20 48 A 30 30 0 0 0 80 48"
    fill="none"
    stroke="#000000"
    stroke-width="7.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>''',

    "core/brand.json": '''{
  "name": "Smile",
  "wordmark": "smile",
  "tokens": {
    "--yellow": "#FFC107",
    "--yellow-hot": "#F5A623",
    "--ink": "#0a0a0a",
    "--panel": "#141414",
    "--panel-2": "#1b1b1b",
    "--line": "#2a2a2a",
    "--muted": "#8c8c8c",
    "--paper": "#ffffff",
    "--up": "#0ECB81",
    "--down": "#F6465D",
    "--up-soft": "#5BE9B0",
    "--down-soft": "#FF8A98",
    "--sky": "#3FB6FF",
    "--live": "#F6465D"
  },
  "handles": {
    "@smileke": "@smileke",
    "smile.co.ke": "smile.co.ke",
    "#SmileSquad": "#SmileSquad",
    "Kenya's all-in-one finance hub": "Kenya's all-in-one finance hub"
  }
}''',

    "core/smile.css": ''':root {
  --yellow: #FFC107;
  --yellow-hot: #F5A623;
  --ink: #0a0a0a;
  --panel: #141414;
  --panel-2: #1b1b1b;
  --line: #2a2a2a;
  --muted: #8c8c8c;
  --paper: #ffffff;
  --up: #0ECB81;
  --down: #F6465D;
  --sky: #3FB6FF;
  --font-display: 'Manrope', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: transparent;
  color: var(--paper);
  font-family: var(--font-body);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
.stage {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(20,20,20,0.8) 0%, var(--ink) 100%);
  z-index: -2;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.chip.dark { background: var(--panel); border: 1px solid var(--line); color: var(--paper); }
.chip.ghost { background: rgba(255,193,7,0.1); border: 1px solid var(--yellow); color: var(--yellow); }
.chip.solid { background: var(--yellow); color: var(--ink); }
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-weight: 800;
}
.brand .dw { width: 48px; height: 48px; display: inline-block; }
.spark {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--yellow);
  box-shadow: 0 0 12px var(--yellow);
  animation: floatSpark 4s infinite ease-in-out var(--d, 0s);
}
@keyframes floatSpark {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
}''',

    "core/smile-mark.js": '''(function(){
  const EYES  = '<circle class="eye-l" cx="31" cy="35" r="5.5"/><circle class="eye-r" cx="69" cy="35" r="5.5"/>';
  const MOUTH = '<path class="mouth" d="M 20 48 A 30 30 0 0 0 80 48"/>';
  const INNER = '<circle cx="50" cy="50" r="48" fill="#FFC800"/><g class="eyes">' + EYES + '</g>' + MOUTH;
  const FACE  = '<g class="eyes">' + EYES + '</g>' + MOUTH;
  const css = `
  .smile-anim .eye-l,.smile-anim .eye-r{transform-box:fill-box;transform-origin:center;transition:transform .12s ease;fill:#000000}
  .smile-anim .mouth{transform-box:fill-box;transform-origin:50% 60%;transition:transform .18s ease;fill:none;stroke:#000000;stroke-width:7.5 !important;stroke-linecap:round;stroke-linejoin:round}
  .face-svg .mouth{transform:none !important}
  .face>svg.face-svg{position:absolute;inset:0;width:100%;height:100%}
  .smile-anim.is-blink .eye-l,.smile-anim.is-blink .eye-r{transform:scaleY(.08)}
  .smile-anim.wink .eye-r{transform:scaleY(.08)}
  .smile-anim.smirk .eye-r{transform:scaleY(.55) translateY(10%)} .smile-anim.smirk .mouth{transform:rotate(-7deg) translateX(6%)} .smile-anim.smirk .eye-l{transform:translateY(-6%)}
  .smile-anim.look .eye-l,.smile-anim.look .eye-r{transform:translateX(22%)}
  .smile-anim.nod{animation:sm-nod .8s ease} .smile-anim.spin{animation:sm-spin 1s cubic-bezier(.6,.05,.3,1)}
  .smile-anim.bounce{animation:sm-bounce 1s cubic-bezier(.3,1.5,.5,1)} .smile-anim.celebrate{animation:sm-cel .9s ease} .smile-anim.shake{animation:sm-shake .5s ease}
  @keyframes sm-nod{0%,100%{transform:translateY(0)}30%{transform:translateY(7%)}60%{transform:translateY(2%)}}
  @keyframes sm-spin{to{transform:rotate(360deg)}}
  @keyframes sm-bounce{0%,100%{transform:translateY(0)}25%{transform:translateY(-16%) scaleY(1.06)}55%{transform:translateY(0) scaleY(.94)}75%{transform:translateY(-6%)}}
  @keyframes sm-cel{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-9deg) scale(1.12)}45%{transform:rotate(8deg) scale(1.12)}70%{transform:rotate(-4deg)}}
  @keyframes sm-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6%)}40%{transform:translateX(6%)}60%{transform:translateX(-4%)}80%{transform:translateX(4%)}}`;

  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const reg=[];
  const moodOf=el=>el.getAttribute('data-mood')||(el.closest&&el.closest('[data-mood]')&&el.closest('[data-mood]').getAttribute('data-mood'))||'';

  function upgrade(el){
    if(!el||!el.isConnected)return;let a;
    if(el.matches('.face')){el.innerHTML='<svg class="face-svg smile-anim" viewBox="0 0 100 100">'+FACE+'</svg>';a=el.querySelector('svg');}
    else if(el.matches('svg.disc')){const ex=(el.getAttribute('class')||'').replace(/\\bdisc\\b/,'').replace('smile-anim','').trim();el.setAttribute('class','disc smile-anim '+ex);el.innerHTML=INNER;a=el;}
    else{el.innerHTML='<svg class="disc smile-anim" viewBox="0 0 100 100">'+INNER+'</svg>';a=el.querySelector('svg');}
    if(!a)return;const m=moodOf(el)||moodOf(a);if(m){a.classList.add(m);a.dataset.locked='1';}reg.push(a);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.brand .dw, svg.disc, .face').forEach(upgrade);
  });
  if(document.readyState !== 'loading') document.querySelectorAll('.brand .dw, svg.disc, .face').forEach(upgrade);

  function idle(){
    const free=reg.filter(a=>!a.dataset.locked&&!a.classList.contains('is-blink'));
    if(free.length){
      const a=free[Math.floor(Math.random()*free.length)];
      a.classList.add('is-blink');
      setTimeout(()=>a.classList.remove('is-blink'),150);
      if(Math.random()<.22)setTimeout(()=>{a.classList.add('look');setTimeout(()=>a.classList.remove('look'),480);},220);
    }
    setTimeout(idle,2600+Math.random()*3200);
  }
  setTimeout(idle,1500);

  window.smileMood=function(mood,ms,target){
    ms=ms||900;
    reg.forEach(a=>{if(a.dataset.locked||(target&&a!==target))return;a.classList.add(mood);setTimeout(()=>a.classList.remove(mood),ms);});
  };

  function applyBrand(b){
    if(!b)return;
    if(b.tokens){const r=document.documentElement.style;for(const k in b.tokens)r.setProperty(k,b.tokens[k]);}
    if(b.wordmark)document.querySelectorAll('.brand b').forEach(el=>{if(!el.dataset.brandLocked)el.textContent=b.wordmark;});
  }

  (function loadBrand(){
    if(window.BRAND){applyBrand(window.BRAND);return;}
    fetch('brand.json').then(r=>r.ok?r.json():null).then(applyBrand).catch(()=>{});
  })();
})();''',

    "core/live-feed.js": '''window.SMILE = window.SMILE || (function(){
  let activeSymbol = "BTC/USDT";
  const listeners = {};
  const tickers = {
    "BTC/USDT": { symbol: "BTC/USDT", binance: "BTCUSDT", price: null, change: 0, candles: [], spark: [] },
    "ETH/USDT": { symbol: "ETH/USDT", binance: "ETHUSDT", price: null, change: 0, candles: [], spark: [] },
    "SOL/USDT": { symbol: "SOL/USDT", binance: "SOLUSDT", price: null, change: 0, candles: [], spark: [] },
    "BNB/USDT": { symbol: "BNB/USDT", binance: "BNBUSDT", price: null, change: 0, candles: [], spark: [] },
    "XRP/USDT": { symbol: "XRP/USDT", binance: "XRPUSDT", price: null, change: 0, candles: [], spark: [] }
  };

  function emit(event, data) {
    if (listeners[event]) listeners[event].forEach(fn => fn(data));
  }

  function on(event, fn) {
    listeners[event] = listeners[event] || [];
    listeners[event].push(fn);
  }

  function setActive(sym) {
    if (tickers[sym]) activeSymbol = sym;
    emit('smile:active', activeSymbol);
    fetchKlines();
  }

  async function fetchTicker() {
    try {
      const syms = Object.values(tickers).map(t => `"${t.binance}"`).join(',');
      const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/24hr?symbols=[${syms}]`);
      const data = await res.json();
      data.forEach(item => {
        const match = Object.values(tickers).find(t => t.binance === item.symbol);
        if (match) {
          match.price = parseFloat(item.lastPrice);
          match.change = parseFloat(item.priceChangePercent);
          match.spark.push(match.price);
          if (match.spark.length > 50) match.spark.shift();
        }
      });
      broadcast();
    } catch (e) {
      const t = tickers[activeSymbol];
      if (t) {
        t.price = t.price || 95000.00;
        t.price += (Math.random() - 0.49) * 15;
        t.spark.push(t.price);
        if (t.spark.length > 50) t.spark.shift();
        broadcast();
      }
    }
  }

  async function fetchKlines() {
    const t = tickers[activeSymbol];
    if (!t) return;
    try {
      const res = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${t.binance}&interval=1m&limit=60`);
      const data = await res.json();
      t.candles = data.map(c => [parseInt(c[0]), parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4])]);
      broadcast();
    } catch (e) {
      t.candles = [];
    }
  }

  function broadcast() {
    const current = tickers[activeSymbol] || { symbol: activeSymbol, price: 0, change: 0, candles: [], spark: [] };
    emit('smile:chart', {
      sym: current.symbol,
      price: current.price,
      chg: current.change,
      candles: current.candles,
      spark: current.spark,
      ind: true
    });
  }

  function indicators(closes) {
    if (!closes || closes.length < 14) return { trend: 'RANGE', rsi: 50, cross: false };
    let gains = 0, losses = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    const avgGain = gains / 14, avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    const last = closes[closes.length - 1], prev = closes[closes.length - 2];
    const trend = last > prev ? 'BULL' : (last < prev ? 'BEAR' : 'RANGE');
    return { trend, rsi, cross: last > prev };
  }

  setInterval(fetchTicker, 3000);
  setInterval(fetchKlines, 10000);
  setTimeout(() => { fetchTicker(); fetchKlines(); }, 200);

  return { on, setActive, indicators, getActive: () => activeSymbol };
})();''',

    "core/mini-chart.html": '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMILE · live chart</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="smile.css">
  <style>
    html,body{width:460px;height:300px}
    .box{position:absolute;inset:0;background:var(--panel);border:1.5px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 18px 46px rgba(0,0,0,.5);display:flex;flex-direction:column}
    .head{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-bottom:1.5px solid var(--line)}
    .head .l{display:flex;align-items:center;gap:9px;font-family:var(--font-display);font-weight:800;font-size:20px}
    .head .l i{width:9px;height:9px;border-radius:50%;background:var(--up);box-shadow:0 0 10px var(--up);animation:pulse2 1.8s infinite}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
    .head .l small{color:var(--muted);font-size:15px;font-weight:600}
    .head .r{display:flex;align-items:center;font-variant-numeric:tabular-nums}
    .px{font-weight:800;font-size:22px}.chg{font-family:var(--font-display);font-weight:700;font-size:15px;margin-left:9px}
    .meta{display:flex;gap:8px;padding:6px 16px 0;font-family:var(--font-display);font-weight:700;font-size:13px}
    .meta span{padding:2px 9px;border-radius:7px;background:var(--panel-2);border:1px solid var(--line);color:var(--muted)}
    .meta .bull{color:var(--up);border-color:rgba(14,203,129,.4)}.meta .bear{color:var(--down);border-color:rgba(246,70,93,.4)}
    canvas{flex:1;width:100%}
    .foot{display:flex;justify-content:space-between;padding:6px 16px;font-size:12px;font-weight:600;color:var(--muted)}
  </style>
</head>
<body>
<div class="box">
  <div class="head">
    <div class="l"><i></i><span id="sym">BTC/USDT</span><small id="mode">· live</small></div>
    <div class="r"><span class="px" id="px">—</span><span class="chg" id="chg"></span></div>
  </div>
  <div class="meta" id="meta"></div>
  <canvas id="cv" width="920" height="360"></canvas>
  <div class="foot"><span id="src">DIRECT STREAM</span><span>smile.co.ke</span></div>
</div>
<script src="smile-mark.js"></script>
<script src="live-feed.js"></script>
<script>
  const q = new URLSearchParams(location.search);
  if (q.get('symbol')) SMILE.setActive(q.get('symbol'));
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d'), UP = '#0ECB81', DN = '#F6465D', Y = '#FFC107', SK = '#3FB6FF';
  function draw(d){
    document.getElementById('sym').textContent = d.sym;
    document.getElementById('px').textContent = d.price == null ? '—' : d.price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    const ch = document.getElementById('chg'); ch.textContent = (d.chg >= 0 ? '+' : '') + d.chg.toFixed(2) + '%'; ch.style.color = d.chg >= 0 ? UP : DN;
    const w = cv.width, h = cv.height, pad = 14; ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++){ const y = pad + (h - 2 * pad) * i / 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    if (d.candles && d.candles.length > 4){
      document.getElementById('mode').textContent = '· 1m candles';
      const hi = Math.max(...d.candles.map(c => c[2])), lo = Math.min(...d.candles.map(c => c[3]));
      const Yv = v => pad + (h - 2 * pad) * (1 - (v - lo) / ((hi - lo) || 1)); const cw = w / d.candles.length;
      d.candles.forEach((c, i) => { const o = c[1], cl = c[4], x = i * cw + cw / 2, col = cl >= o ? UP : DN;
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, Yv(c[2])); ctx.lineTo(x, Yv(c[3])); ctx.stroke();
        const bw = Math.max(3, cw * .55); ctx.fillStyle = col; ctx.fillRect(x - bw / 2, Math.min(Yv(o), Yv(cl)), bw, Math.max(2, Math.abs(Yv(o) - Yv(cl)))); });
      if (d.ind){
        const closes = d.candles.map(c => c[4]);
        const e9 = SMILE.indicators(closes);
        const m = document.getElementById('meta'); const t = e9.trend;
        m.innerHTML = `<span class="${t === 'BULL' ? 'bull' : t === 'BEAR' ? 'bear' : ''}">${t === 'BULL' ? '▲ BULL' : t === 'BEAR' ? '▼ BEAR' : '◆ RANGE'}</span><span>RSI ${e9.rsi ? e9.rsi.toFixed(0) : '—'}</span>`;
      }
    } else if (d.spark && d.spark.length > 1){
      document.getElementById('mode').textContent = '· live spot';
      document.getElementById('meta').innerHTML = '<span>real-time ticks</span>';
      const hi = Math.max(...d.spark), lo = Math.min(...d.spark); const Yv = v => pad + (h - 2 * pad) * (1 - (v - lo) / ((hi - lo) || 1));
      const grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, 'rgba(255,193,7,.25)'); grad.addColorStop(1, 'rgba(255,193,7,0)');
      ctx.beginPath(); d.spark.forEach((v, i) => { const x = i / (d.spark.length - 1) * w; i ? ctx.lineTo(x, Yv(v)) : ctx.moveTo(x, Yv(v)); });
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); d.spark.forEach((v, i) => { const x = i / (d.spark.length - 1) * w; i ? ctx.lineTo(x, Yv(v)) : ctx.moveTo(x, Yv(v)); });
      ctx.strokeStyle = Y; ctx.lineWidth = 2.5; ctx.stroke();
    }
  }
  SMILE.on('smile:chart', draw);
</script>
</body>
</html>''',

    "core/08-alerts.html": '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMILE · alerts</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="smile.css">
  <style>
    #zone{position:absolute;left:0;right:0;top:120px;display:flex;flex-direction:column;align-items:center;pointer-events:none}
    .alert{position:relative;display:flex;align-items:center;gap:22px;background:var(--panel);color:#fff;border:2px solid var(--yellow);border-radius:20px;padding:20px 36px 20px 20px;box-shadow:0 24px 60px rgba(0,0,0,.55);opacity:0;transform:translateY(-60px) scale(.8)}
    .alert.show{animation:ain .55s cubic-bezier(.2,1.4,.3,1) forwards}.alert.hide{animation:aout .45s ease forwards}
    @keyframes ain{to{transform:none;opacity:1}}@keyframes aout{to{transform:translateY(-40px) scale(.9);opacity:0}}
    .burst{position:absolute;inset:-46px;border-radius:50%;z-index:-1;filter:blur(1px);opacity:0;background:repeating-conic-gradient(rgba(255,193,7,.5) 0 9deg,transparent 9deg 18deg)}
    .alert.show .burst{animation:burst .8s ease-out forwards}@keyframes burst{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.3) rotate(40deg)}}
    .icon{width:84px;height:84px;border-radius:50%;background:var(--yellow);display:grid;place-items:center;flex-shrink:0}
    .icon svg{width:44px;height:44px;stroke:#0b0b0b;fill:none;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round}
    .k{font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:var(--yellow)}
    .title{font-family:var(--font-display);font-weight:800;font-size:32px;line-height:1.1;margin-top:2px}
    .sub{font-size:20px;color:var(--muted);margin-top:4px}
  </style>
</head>
<body>
  <div class="stage">
    <div id="zone">
      <div class="alert" id="alertBox">
        <div class="burst"></div>
        <div class="icon">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
        <div>
          <div class="k" id="alertCategory">MARKET ALERT</div>
          <div class="title" id="alertTitle">BTC Breaking Resistance</div>
          <div class="sub" id="alertSub">Surged past target levels on high volume</div>
        </div>
      </div>
    </div>
  </div>
  <script src="smile-mark.js"></script>
  <script>
    function triggerAlert(cat, title, sub) {
      const box = document.getElementById('alertBox');
      document.getElementById('alertCategory').textContent = cat || 'MARKET ALERT';
      document.getElementById('alertTitle').textContent = title || 'Alert Triggered';
      document.getElementById('alertSub').textContent = sub || '';
      box.classList.remove('hide');
      box.classList.add('show');
      if (window.smileMood) window.smileMood('bounce', 1200);
      setTimeout(() => {
        box.classList.remove('show');
        box.classList.add('hide');
      }, 5000);
    }
    const params = new URLSearchParams(location.search);
    if (params.get('trigger') === 'true') {
      setTimeout(() => triggerAlert(params.get('cat'), params.get('title'), params.get('sub')), 1000);
    }
  </script>
</body>
</html>''',

    "core/02-countdown.html": '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMILE · countdown</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="smile.css">
  <style>
    .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .ring{position:relative;width:560px;height:560px}.ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
    .ring circle{fill:none;stroke-width:14;stroke-linecap:round}.ring .tr{stroke:var(--panel-2)}
    .ring .pr{stroke:var(--yellow);stroke-dasharray:1609;transition:stroke-dashoffset 1s linear}
    .num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:290px}
    .num.pop{animation:pop .9s ease}
    @keyframes pop{0%{transform:scale(1.28);opacity:.15;color:var(--yellow)}60%{transform:scale(.96)}100%{transform:scale(1)}}
    .label{font-family:var(--font-display);font-weight:700;font-size:28px;letter-spacing:.4em;text-transform:uppercase;color:var(--muted);margin-top:30px}
    .flash{position:absolute;inset:0;background:var(--yellow);opacity:0;pointer-events:none}.flash.go{animation:fl .9s ease forwards}
    @keyframes fl{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
    .endlogo{position:absolute;inset:0;display:grid;place-items:center;opacity:0}.endlogo.go{animation:endp 1s ease forwards}
    .endlogo .brand{font-size:200px;background:var(--panel);padding:.18em .34em;border-radius:.18em;border:2px solid var(--line)}
    @keyframes endp{0%{opacity:0;transform:scale(.7)}35%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
  </style>
</head>
<body>
<div class="stage">
  <div class="bg"></div>
  <span class="spark" style="left:14%;top:18%;--d:.3s"></span>
  <span class="spark" style="left:82%;top:24%;--d:1.6s;background:var(--up)"></span>
  <span class="spark" style="left:76%;top:80%;--d:2.8s"></span>
  <div class="wrap">
    <div class="ring">
      <svg viewBox="0 0 560 560"><circle class="tr" cx="280" cy="280" r="256"/><circle class="pr" id="pr" cx="280" cy="280" r="256"/></svg>
      <div class="num" id="num">10</div>
    </div>
    <div class="label">opening bell in</div>
  </div>
  <div class="endlogo" id="end">
    <span class="brand" data-mood="bounce">
      <span class="dw">
        <svg class="disc" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#FFC800"/>
          <circle cx="31" cy="35" r="5.5" fill="#000000"/>
          <circle cx="69" cy="35" r="5.5" fill="#000000"/>
          <path d="M 20 48 A 30 30 0 0 0 80 48" fill="none" stroke="#000000" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span><b>smile</b>
    </span>
  </div>
  <div class="flash" id="flash"></div>
</div>
<script src="smile-mark.js"></script>
<script>
  const q=new URLSearchParams(location.search);const total=+(q.get('from')||10);let n=total,AC;
  const num=document.getElementById('num'),pr=document.getElementById('pr'),C=1609;
  function beep(f){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.18);o.start();o.stop(AC.currentTime+.2);}catch(e){}}
  (function tick(){if(n>0){num.textContent=n;num.classList.remove('pop');void num.offsetWidth;num.classList.add('pop');pr.style.strokeDashoffset=C*(1-n/total);beep(n<=3?988:660);n--;setTimeout(tick,1000);}else{beep(1319);document.getElementById('flash').classList.add('go');document.getElementById('end').classList.add('go');}})();
</script>
</body>
</html>''',

    "core/05-ending.html": '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMILE · session closed</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="smile.css">
  <style>
    .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;text-align:center}
    h1{font-family:var(--font-display);font-weight:800;font-size:146px;letter-spacing:-.03em;line-height:.95}h1 .y{color:var(--yellow)}
    .discbig{width:150px;height:150px;margin-top:-6px}
    .sub{font-size:27px;font-weight:500;color:var(--muted);max-width:780px;line-height:1.4}
    .socials{display:flex;gap:16px;margin-top:8px}.next{font-size:25px;margin-top:6px}
    .cf{position:absolute;top:-40px;width:13px;height:23px;border-radius:4px;animation:fall linear infinite}
    @keyframes fall{to{transform:translateY(1180px) rotate(560deg)}}
  </style>
</head>
<body>
<div class="stage">
  <div class="bg"></div><div id="confetti"></div>
  <div class="wrap">
    <span class="chip ghost">✓ MARKET CLOSED</span>
    <h1>session <span class="y">closed</span>.</h1>
    <svg class="discbig disc" data-mood="spin" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#FFC800"/>
      <circle cx="31" cy="35" r="5.5" fill="#000000"/>
      <circle cx="69" cy="35" r="5.5" fill="#000000"/>
      <path d="M 20 48 A 30 30 0 0 0 80 48" fill="none" stroke="#000000" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <p class="sub">Asante for trading with us today — books balanced, smile intact. Same desk next time.</p>
    <div class="socials"><span class="chip dark">▶ YouTube · /smileke</span><span class="chip dark">◉ Twitch · /smileke</span><span class="chip dark">♪ TikTok · @smileke</span></div>
    <span class="chip solid next">NEXT SESSION · FRIDAY 8PM EAT</span>
  </div>
</div>
<script src="smile-mark.js"></script>
<script>
  const cols=['#FFC107','#0ECB81','#F6465D','#FFFFFF','#3FB6FF'],box=document.getElementById('confetti');
  for(let i=0;i<36;i++){const s=document.createElement('span');s.className='cf';s.style.left=Math.random()*100+'%';s.style.background=cols[i%cols.length];s.style.animationDuration=(3.5+Math.random()*3)+'s';s.style.animationDelay=(Math.random()*4)+'s';s.style.width=(9+Math.random()*9)+'px';box.appendChild(s);}
</script>
</body>
</html>''',

    "core/00-bg.html": '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMILE · ambient bg</title>
  <link rel="stylesheet" href="smile.css">
</head>
<body>
<div class="stage">
  <div class="bg"></div>
  <span class="spark" style="left:12%;top:30%;--d:0s"></span>
  <span class="spark" style="left:48%;top:18%;--d:1.6s;background:var(--up)"></span>
  <span class="spark" style="left:80%;top:64%;--d:2.8s"></span>
  <span class="spark" style="left:30%;top:78%;--d:3.6s;background:var(--sky)"></span>
</div>
</body>
</html>'''
}

# Delete obsolete scripts if they exist
OBSOLETE = ["push.bat", "push.py", "core/run-watch.bat", "core/watch-smile.js", "core/bridge.py"]
for f in OBSOLETE:
    if os.path.exists(f):
        os.remove(f)
        print(f"Removed obsolete script: {f}")

# Write updated files
for rel_path, content in FILES.items():
    folder = os.path.dirname(rel_path)
    if folder and not os.path.exists(folder):
        os.makedirs(folder)
    with open(rel_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated: {rel_path}")

print("\nAll smile-live-kit files updated successfully without localhost dependencies!")