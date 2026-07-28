import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, 'secrets.env') })

const PORT = process.env.PORT || 8787
let brand = JSON.parse(fs.readFileSync(path.join(__dirname, 'brand.json'),'utf8'))
let clients = new Set()

fs.watch(path.join(__dirname,'brand.json'),()=>{
  try{
    brand = JSON.parse(fs.readFileSync(path.join(__dirname,'brand.json'),'utf8'))
    const msg=JSON.stringify({type:'brand',data:brand})
    for(const ws of clients){try{ws.send(msg)}catch{}}
    console.log('[brand] reloaded')
  }catch{}
})

const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'}

const server = http.createServer((req,res)=>{
  const url = new URL(req.url, `http://localhost:${PORT}`)
  res.setHeader('Access-Control-Allow-Origin','*')
  if(url.pathname==='/api/brand'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(brand))}
  if(url.pathname==='/api/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,brand:brand.meta.channel}))}
  let fp = path.join(__dirname, url.pathname==='/'?'index.html':url.pathname)
  if(!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(__dirname,'index.html')
  if(!fs.existsSync(fp)){res.writeHead(404);return res.end('not found')}
  const ext=path.extname(fp)
  res.writeHead(200,{'Content-Type':mime[ext]||'text/plain'})
  res.end(fs.readFileSync(fp))
})

const wss = new WebSocketServer({server})
wss.on('connection', ws=>{ clients.add(ws); ws.send(JSON.stringify({type:'brand',data:brand})); ws.on('close',()=>clients.delete(ws)) })

server.listen(PORT, ()=>{ console.log(`Smile Kit v4 http://localhost:${PORT}`) })
