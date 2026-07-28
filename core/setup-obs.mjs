import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TEMPLATE = path.join(ROOT, 'obs', 'Smile-Trading-Kit-v3.json')
const FINAL = path.join(ROOT, 'obs', 'Smile-Trading-Kit-FINAL.json')

// Ensure vendor files exist (download if missing) for file:// offline
const vendorDir = path.join(ROOT, 'core', 'vendor')
if(!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir, {recursive:true})

async function ensureVendor(){
  const files = [
    ['alpine.min.js', 'https://unpkg.com/alpinejs@3.15.0/dist/cdn.min.js'],
    ['htmx.min.js', 'https://unpkg.com/htmx.org@1.12.2/dist/htmx.min.js'],
    ['htmx-sse.js', 'https://unpkg.com/htmx.org@1.12.2/dist/ext/sse.js'],
  ]
  for(const [name, url] of files){
    const p = path.join(vendorDir, name)
    if(!fs.existsSync(p)){
      console.log(`[vendor] downloading ${name}...`)
      try{
        const res = await fetch(url)
        const text = await res.text()
        fs.writeFileSync(p, text)
      }catch(e){ console.log(`  failed ${name}, will use CDN fallback`, e.message) }
    }
  }
}

await ensureVendor()

let template = fs.readFileSync(TEMPLATE, 'utf8')
// Replace {{ROOT}} placeholder with file:// absolute path
// On Windows: file:///C:/path/to/core/ticker.html
function toFileUrl(p){
  let abs = path.resolve(ROOT, p).replace(/\\/g,'/')
  if(!abs.startsWith('/')) abs = '/' + abs // Windows needs /C:/
  return 'file://' + abs
}

template = template.replaceAll('{{ROOT}}/core/ticker.html', toFileUrl('core/ticker.html'))
template = template.replaceAll('{{ROOT}}/core/lower-third.html', toFileUrl('core/lower-third.html'))
template = template.replaceAll('{{ROOT}}/core/chart.html', toFileUrl('core/chart.html'))
template = template.replaceAll('{{ROOT}}/core/overlay.html', toFileUrl('core/overlay.html'))
template = template.replaceAll('{{ROOT}}/core/assets/smile-mark-animated.html', toFileUrl('core/assets/smile-mark-animated.html'))

fs.writeFileSync(FINAL, template)
console.log(`[setup] Wrote ${FINAL}`)
console.log(`[setup] Root: ${ROOT}`)
console.log(`[setup] Now import FINAL into OBS -> Scene Collection -> Import`)
