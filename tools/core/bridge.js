import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { OBSWebSocket } from 'obs-websocket-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, 'secrets.env') })
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 8787
const OBS_URL = process.env.OBS_WS_URL || 'ws://localhost:4455'
const OBS_PASS = process.env.OBS_WS_PASSWORD || ''

let brand = JSON.parse(fs.readFileSync(path.join(__dirname, 'brand.json'), 'utf8'))
let clients = new Set()
const CACHE = new Map()
let lastTwelveCall = 0

// Watch brand for hot reload
fs.watch(path.join(__dirname, 'brand.json'), () => {
  try {
    brand = JSON.parse(fs.readFileSync(path.join(__dirname, 'brand.json'), 'utf8'))
    broadcast({ type: 'brand', data: brand })
    console.log('[brand] hot reloaded')
  } catch {}
})

// OBS
const obs = new OBSWebSocket()
let obsConnected = false
async function connectOBS() {
  try {
    if (!OBS_PASS) { console.log('[obs] no password set, skipping'); return }
    await obs.connect(OBS_URL, OBS_PASS)
    obsConnected = true
    console.log('[obs] connected to', OBS_URL)
  } catch (e) {
    console.log('[obs] waiting for OBS (enable websocket):', e.message)
    setTimeout(connectOBS, 5000)
  }
}
connectOBS()

function isMarketOpen() {
  const now = new Date()
  const utc = now.getUTCHours() + now.getUTCMinutes()/60
  const day = now.getUTCDay()
  if (day===0||day===6) return false
  return utc >= 14.5 && utc < 21
}

async function getPrices() {
  const now = Date.now()
  if (now - lastTwelveCall < 60000 && CACHE.has('prices')) return CACHE.get('prices')
  // Outside market, return cached to save budget
  if (!isMarketOpen() && CACHE.has('prices')) return CACHE.get('prices')
  // TODO: real TwelveData fetch here budget-gated
  const mock = {
    ts: new Date().toISOString(),
    marketOpen: isMarketOpen(),
    symbols: [
      { symbol: 'AAPL', price: 214.33 + Math.random(), change: 0.42, dir: 'up' },
      { symbol: 'MSFT', price: 512.11 + Math.random(), change: -1.2, dir: 'down' },
      { symbol: 'SCOM', price: 14.2 + Math.random()*0.2, change: 2.3, dir: 'up' },
      { symbol: 'XAU/USD', price: 2388.4, change: 0.8, dir: 'up' },
    ]
  }
  CACHE.set('prices', mock); lastTwelveCall = now; return mock
}

function broadcast(obj){ const msg=JSON.stringify(obj); for(const ws of clients){ try{ws.send(msg)}catch{} } }

async function getSceneItemId(sceneName, sourceName){
  const { sceneItems } = await obs.call('GetSceneItemList', { sceneName })
  const item = sceneItems.find(i => i.sourceName === sourceName)
  return item?.sceneItemId
}

async function applyLayout(sceneName, layoutName){
  // layoutName like CHART, INTERVIEW
  const layout = brand.layouts?.scenes?.[layoutName]
  if(!layout || !obsConnected) return { ok: false, reason: 'no layout or obs not connected' }
  const results = []
  for(const [sourceKey, cfg] of Object.entries(layout)){
    // sourceKey = camera, chart etc — maps to source name WEBCAM-1, chart, etc.
    const sourceMap = { camera: 'WEBCAM-1', chart: 'chart', ticker: 'ticker' }
    const sourceName = sourceMap[sourceKey] || sourceKey
    try {
      const id = await getSceneItemId(sceneName, sourceName)
      if(!id) continue
      await obs.call('SetSceneItemTransform', {
        sceneName,
        sceneItemId: id,
        sceneItemTransform: {
          positionX: cfg.x,
          positionY: cfg.y,
          scaleX: cfg.width ? cfg.width / 1920 : 1, // simplified, better to use bounds
          scaleY: cfg.height ? cfg.height / 1080 : 1,
          width: cfg.width,
          height: cfg.height
        }
      })
      // Use Move Transition will animate this change automatically if you set Move as transition
      results.push({ source: sourceName, ok: true })
    } catch(e){ results.push({ source: sourceName, error: e.message }) }
  }
  return { ok: true, results }
}

const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'}
const server = http.createServer(async (req,res)=>{
  const url = new URL(req.url, `http://localhost:${PORT}`)
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')

  if(req.method==='OPTIONS'){ res.writeHead(200); return res.end() }

  if(url.pathname==='/api/health'){ res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify({ ok:true, marketOpen:isMarketOpen(), obsConnected, brand: brand.meta?.channel })) }
  if(url.pathname==='/api/brand'){ res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify(brand)) }
  if(url.pathname==='/api/prices'){ const d=await getPrices(); res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify(d)) }
  if(url.pathname==='/api/stream'){
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'})
    const send=async()=>{ const p=await getPrices(); res.write(`event: price\n`); res.write(`data: ${JSON.stringify(p)}\n\n`) }
    send(); const iv=setInterval(send, isMarketOpen()?60000:300000); req.on('close',()=>clearInterval(iv)); return
  }
  if(url.pathname==='/api/obs/scene' && req.method==='POST'){
    let b=''; req.on('data',c=>b+=c); req.on('end',async()=>{
      try{ const { scene } = JSON.parse(b); if(obsConnected) await obs.call('SetCurrentProgramScene',{sceneName: scene}); res.writeHead(200).end(JSON.stringify({ok:true})) }
      catch(e){ res.writeHead(500).end(JSON.stringify({error:e.message})) }
    }); return
  }
  if(url.pathname==='/api/layout/apply' && req.method==='POST'){
    let b=''; req.on('data',c=>b+=c); req.on('end',async()=>{
      try{
        const { scene, layout } = JSON.parse(b)
        const r = await applyLayout(scene, layout || scene)
        res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(r))
      }catch(e){ res.writeHead(500).end(JSON.stringify({error:e.message})) }
    }); return
  }

  // static
  let fp = path.join(__dirname, url.pathname==='/'?'index.html':url.pathname)
  if(!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(__dirname,'index.html')
  if(!fs.existsSync(fp)){ res.writeHead(404); return res.end('not found') }
  const ext=path.extname(fp); const content=fs.readFileSync(fp)
  res.writeHead(200,{'Content-Type': mime[ext]||'text/plain'}); res.end(content)
})

const wss = new WebSocketServer({ server })
wss.on('connection', ws=>{ clients.add(ws); ws.send(JSON.stringify({type:'brand', data:brand})); ws.on('close',()=>clients.delete(ws)) })

server.listen(PORT, ()=>{ console.log(`\n Smile Kit v2 http://localhost:${PORT} | market:${isMarketOpen()} | obs:${obsConnected?'connected':'waiting'}`) })
