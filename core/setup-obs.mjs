import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TEMPLATE = path.join(ROOT, 'obs', 'Smile-Trading-Kit-v3.json')
const FINAL = path.join(ROOT, 'obs', 'Smile-Trading-Kit-FINAL.json')

const vendorDir = path.join(ROOT, 'core', 'vendor')
if(!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir, {recursive:true})

async function ensureVendor(){
  const files = [
    ['alpine.min.js', 'https://unpkg.com/alpinejs@3.15.0/dist/cdn.min.js'],
    ['htmx.min.js', 'https://unpkg.com/htmx.org@1.12.2/dist/htmx.min.js'],
  ]
  for(const [name, url] of files){
    const p = path.join(vendorDir, name)
    if(!fs.existsSync(p)){
      console.log(`[vendor] downloading ${name}...`)
      try{
        const res = await fetch(url)
        const text = await res.text()
        fs.writeFileSync(p, text)
        console.log(`  ok ${name}`)
      }catch(e){ console.log(`  failed ${name}, CDN fallback will be used`, e.message) }
    }
  }
}
await ensureVendor()

let template = fs.readFileSync(TEMPLATE, 'utf8')

function toFileUrl(p){
  let abs = path.resolve(ROOT, p).replace(/\\/g,'/')
  if(!abs.startsWith('/')) abs = '/' + abs
  return 'file://' + abs
}
function toLocalPath(p){
  return path.resolve(ROOT, p)
}

const localTicker = toLocalPath('core/ticker.html')
const fileUrlTicker = toFileUrl('core/ticker.html')

// Replace placeholders - LOCAL_FILE is raw filesystem path, FILE_URL is file://
template = template.replaceAll('{{LOCAL_FILE}}/core/ticker.html', toLocalPath('core/ticker.html').replace(/\\/g,'/'))
template = template.replaceAll('{{FILE_URL}}/core/ticker.html', toFileUrl('core/ticker.html'))

template = template.replaceAll('{{LOCAL_FILE}}/core/lower-third.html', toLocalPath('core/lower-third.html').replace(/\\/g,'/'))
template = template.replaceAll('{{FILE_URL}}/core/lower-third.html', toFileUrl('core/lower-third.html'))

template = template.replaceAll('{{LOCAL_FILE}}/core/chart.html', toLocalPath('core/chart.html').replace(/\\/g,'/'))
template = template.replaceAll('{{FILE_URL}}/core/chart.html', toFileUrl('core/chart.html'))

template = template.replaceAll('{{LOCAL_FILE}}/core/overlay.html', toLocalPath('core/overlay.html').replace(/\\/g,'/'))
template = template.replaceAll('{{FILE_URL}}/core/overlay.html', toFileUrl('core/overlay.html'))

fs.writeFileSync(FINAL, template)
console.log(`[setup] Wrote ${FINAL}`)
console.log(`[setup] ROOT: ${ROOT}`)
console.log(`[setup] ticker local_file: ${toLocalPath('core/ticker.html')}`)
console.log(`[setup] If OBS shows blank, check Help -> Log, and try:`)
console.log(`  1. In OBS browser source properties, tick 'Shutdown source when not visible' OFF, then ON`)
console.log(`  2. Press Refresh cache`)
console.log(`  3. Or install Local Webserver plugin (Tools -> Local Webserver) and use http://127.0.0.1:8080/core/ticker.html`)
