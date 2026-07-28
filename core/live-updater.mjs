import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, 'secrets.env') })

const KEY = process.env.TWELVE_DATA_API_KEY || ''
const LIVE_PATH = path.join(__dirname, 'live.json')

function isMarketOpen(){
  const now=new Date()
  const utc=now.getUTCHours()+now.getUTCMinutes()/60
  const day=now.getUTCDay()
  if(day===0||day===6) return false
  return utc>=14.5 && utc<21
}

async function fetchPrices(){
  if(!KEY){
    console.log('[mock] no key, writing mock')
    return { ts:new Date().toISOString(), symbols:[{symbol:'AAPL',price:214.33,change:0.42,dir:'up'},{symbol:'SCOM',price:14.2,change:2.3,dir:'up'}] }
  }
  if(!isMarketOpen()){
    console.log('[skip] market closed, keeping last')
    if(fs.existsSync(LIVE_PATH)) return JSON.parse(fs.readFileSync(LIVE_PATH,'utf8'))
  }
  try{
    const res=await fetch(`https://api.twelvedata.com/price?symbol=AAPL,MSFT,SCOM&apikey=${KEY}`)
    const data=await res.json()
    console.log('[live] fetched', data)
    return { ts:new Date().toISOString(), symbols: Object.entries(data).map(([k,v])=>({symbol:k, price:parseFloat(v.price||214), change:0.5, dir:'up'})) }
  }catch(e){
    console.log('[error]', e.message)
    return JSON.parse(fs.readFileSync(LIVE_PATH,'utf8'))
  }
}

async function loop(){
  const prices=await fetchPrices()
  fs.writeFileSync(LIVE_PATH, JSON.stringify(prices,null,2))
  console.log('Wrote', LIVE_PATH)
}

loop()
setInterval(loop, 60*1000)
