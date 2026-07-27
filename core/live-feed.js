/* SMILE LIVE FEED - real data + indicators + symbol bus + context + budget-safe.
   The local bridge (run-bridge.bat) is the single poller when running.
   Keyless & unlimited: binance crypto, metals.live gold/silver, fawazahmed0 FX.
   Indices (Twelve Data) budget-gated to US market hours @1/min -> fits 800/day, 8/min.
   Dev socket (SMILE.api.ws) overrides everything with authoritative Smile data + active chart. */
(function(){
  const SMILE=window.SMILE={api:{rest:'',ws:'',twelvedataKey:'',bridge:'http://localhost:8787'},feed:[],active:null,positions:[],
    indicators:indicators,setActive:setActive,on:on,ctxFrom:ctxFrom};
  const ev=(n,d)=>window.dispatchEvent(new CustomEvent(n,{detail:d}));
  function on(n,fn){window.addEventListener(n,e=>fn(e.detail));}
  const FEED=SMILE.feed=[
    {s:'BTC/USDT',sym:'BTCUSDT',prov:'binance',dec:2},{s:'ETH/USDT',sym:'ETHUSDT',prov:'binance',dec:2},
    {s:'BNB/USDT',sym:'BNBUSDT',prov:'binance',dec:2},{s:'XRP/USDT',sym:'XRPUSDT',prov:'binance',dec:3},
    {s:'SOL/USDT',sym:'SOLUSDT',prov:'binance',dec:2},{s:'XAU/USD',sym:'gold',prov:'metals',dec:1},
    {s:'XAG/USD',sym:'silver',prov:'metals',dec:2},{s:'USD/KES',sym:'kes',prov:'fx',dec:2},
    {s:'EUR/USD',sym:'eur',prov:'fx',dec:4,inv:true},{s:'GBP/USD',sym:'gbp',prov:'fx',dec:4,inv:true},
    {s:'S&P 500',sym:'SPX500',prov:'td',dec:1},{s:'NAS 100',sym:'NAS100',prov:'td',dec:1},
    {s:'CRASH500',sym:'CRASH500',prov:'smile',dec:2}
  ].map(f=>Object.assign(f,{price:null,chg:0,hist:[],candles:[]}));
  const by=s=>FEED.find(f=>f.s===s||f.sym===s);
  const BIN=['https://data-api.binance.vision','https://api.binance.com'];let bi=0;let bridgeUp=false;
  const pushH=(f,p)=>{f.hist.push(p);if(f.hist.length>240)f.hist.shift();};
  function ctxFrom(s){s=(s||'').toUpperCase();
    if(/CRASH|BOOM|STEP|RANGE|VOLATILITY|CFD/.test(s))return{t:'MT5 · Synthetics'};
    if(/BTC|ETH|BNB|XRP|SOL|DOGE|ADA|USDT/.test(s))return{t:'SPOT · Crypto'};
    if(/XAU|XAG|GOLD|SILVER/.test(s))return{t:'MT5 · Metals'};
    if(/EUR|GBP|USD|JPY|KES|FOREX/.test(s))return{t:'Forex · Futures'};
    if(/SPX|NAS|US30|UK100|INDEX|500|100/.test(s))return{t:'Indices · Futures'};
    return{t:'smile · Trade'};}
  function isUSOpen(){try{const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);const m=(+o.hour)*60+(+o.minute);return o.weekday!=='Sat'&&o.weekday!=='Sun'&&m>=570&&m<960;}catch(e){return false;}}
  async function quotes(){
    const cs=FEED.filter(f=>f.prov==='binance');
    try{const r=await fetch(BIN[bi]+'/api/v3/ticker/24hr?symbols='+encodeURIComponent('['+cs.map(f=>'"'+f.sym+'"').join(',')+']'));
      if(!r.ok)throw 0;(await r.json()).forEach(d=>{const f=by(d.symbol);if(f){const p=+d.lastPrice;f.price=p;f.chg=+d.priceChangePercent;pushH(f,p);}});}catch(e){bi=(bi+1)%BIN.length;}
    try{const a=await(await fetch('https://api.metals.live/v1/spot')).json();const m=Array.isArray(a)?Object.assign({},...a):a;
      FEED.filter(f=>f.prov==='metals').forEach(f=>{const p=+m[f.sym];if(p){f.chg=f._lp?+((p-f._lp)/f._lp*100).toFixed(3):f.chg;f._lp=p;f.price=p;pushH(f,p);}});}catch(e){}
    try{const u=(await(await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json')).json()).usd||{};
      FEED.filter(f=>f.prov==='fx').forEach(f=>{const r=+u[f.sym];if(r){const p=f.inv?1/r:r;f.price=p;pushH(f,p);}});}catch(e){}
    if(!bridgeUp&&SMILE.api.twelvedataKey&&isUSOpen()&&Date.now()-quotes._td>60000){quotes._td=Date.now();
      for(const f of FEED.filter(f=>f.prov==='td')){try{const p=+(await(await fetch('https://api.twelvedata.com/price?symbol='+f.sym+'&apikey='+SMILE.api.twelvedataKey)).json()).price;if(p){f.price=p;pushH(f,p);}}catch(e){}}}
    if(SMILE.api.rest)try{(await(await fetch(SMILE.api.rest+'/quotes')).json()).forEach(d=>{const f=by(d.symbol)||by(d.s);if(f){f.price=+d.price;if(d.change!=null)f.chg=+d.change;pushH(f,f.price);}});}catch(e){}
    ev('smile:quotes',FEED);
  }
  quotes._td=0;
  async function pollBridge(){if(!SMILE.api.bridge)return;
    try{const r=await fetch(SMILE.api.bridge+'/quotes.json',{cache:'no-store'});if(r.ok){bridgeUp=true;(await r.json()).forEach(d=>{const f=by(d.symbol)||by(d.s);if(f){f.price=+d.price;if(d.change!=null)f.chg=+d.change;pushH(f,f.price);}});ev('smile:quotes',FEED);}else bridgeUp=false;}catch(e){bridgeUp=false;}
    try{const r=await fetch(SMILE.api.bridge+'/active',{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.symbol&&j.symbol!==SMILE.active)setActive(j.symbol);}}catch(e){}}
  let lastB=0;
  async function chart(){const f=by(SMILE.active);if(!f)return;
    if(f.prov==='binance'){try{const r=await fetch(BIN[bi]+'/api/v3/klines?symbol='+f.sym+'&interval=1m&limit=80');if(r.ok)f.candles=(await r.json()).map(c=>[c[0],+c[1],+c[2],+c[3],+c[4]]);}catch(e){}}
    else if(f.prov==='td'&&!bridgeUp&&SMILE.api.twelvedataKey&&isUSOpen()){try{const v=(await(await fetch('https://api.twelvedata.com/time_series?symbol='+f.sym+'&interval=1min&outputsize=80&apikey='+SMILE.api.twelvedataKey)).json()).values||[];f.candles=v.reverse().map(c=>[Date.parse(c.datetime),+c.open,+c.high,+c.low,+c.close]);}catch(e){}}
    else if(f.prov==='smile'){try{const r=await fetch((SMILE.api.bridge||'')+'/klines?symbol='+encodeURIComponent(f.sym)+'&interval=1m',{cache:'no-store'});if(r.ok){const k=await r.json();if(k&&k.length)f.candles=k;}}catch(e){}}
    else if(f.prov==='metals'){const now=Math.floor(Date.now()/60000);const p=f.hist[f.hist.length-1];
      if(now!==lastB&&p){lastB=now;f.candles.push([now*60000,p,p,p,p]);if(f.candles.length>120)f.candles.shift();}
      else if(f.candles.length&&p){const c=f.candles[f.candles.length-1];c[2]=Math.max(c[2],p);c[3]=Math.min(c[3],p);c[4]=p;}}
    const ind=f.candles.length>21?indicators(f.candles.map(c=>c[4])):null;
    ev('smile:chart',{sym:f.s,candles:f.candles,spark:f.hist,ind:ind,price:f.price,chg:f.chg});}
  function indicators(v){const ema=(a,p)=>{const k=2/(p+1);let e=a[0];const o=[e];for(let i=1;i<a.length;i++){e=a[i]*k+e*(1-k);o.push(e);}return o;};
    const e9=ema(v,9),e21=ema(v,21),n=v.length-1;let rsi=null;
    if(v.length>15){let g=0,l=0;for(let i=1;i<=14;i++){const d=v[i]-v[i-1];d>=0?g+=d:l-=d;}g/=14;l/=14;let rs=l===0?100:g/l;
      for(let i=15;i<v.length;i++){const d=v[i]-v[i-1];g=(g*13+(d>0?d:0))/14;l=(l*13+(d<0?-d:0))/14;rs=l===0?100:g/l;}rsi=100-100/(1+rs);}
    const last=v[n],bull=last>e21[n]&&e9[n]>e21[n],bear=last<e21[n]&&e9[n]<e21[n],slope=e21[n]-e21[Math.max(0,n-5)];
    return{ema9:e9[n],ema21:e21[n],rsi:rsi,trend:bull?'BULL':bear?'BEAR':'RANGE',cross:e9[n]>e21[n],mom:Math.abs(slope)/last*10000,last:last};}
  function setActive(s){const f=by(s);if(!f)return;SMILE.active=f.s;ev('smile:active',f.s);chart();}
  function socket(){if(!SMILE.api.ws)return;let ws;(function open(){try{ws=new WebSocket(SMILE.api.ws);}catch(e){return;}
    ws.onmessage=m=>{let d;try{d=JSON.parse(m.data);}catch(e){return;}
      if(d.type==='quote'){const f=by(d.symbol);if(f){f.price=+d.price;if(d.change!=null)f.chg=+d.change;pushH(f,f.price);ev('smile:quotes',FEED);if(f.s===SMILE.active)chart();}}
      else if(d.type==='active'){setActive(d.symbol);}
      else if(d.type==='klines'){const f=by(d.symbol);if(f){f.candles=d.klines;if(f.s===SMILE.active)chart();}}
      else if(d.type==='positions'){SMILE.positions=d.positions||[];ev('smile:positions',SMILE.positions);}};
    ws.onclose=()=>setTimeout(open,4000);})();}
  const q=new URLSearchParams(location.search);
  quotes().then(()=>{setActive(q.get('symbol')||(FEED.find(f=>f.price)||FEED[0]).s);pollBridge();});
  setInterval(quotes,6000);setInterval(chart,8000);setInterval(pollBridge,5000);socket();
})();
