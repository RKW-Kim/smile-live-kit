import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TEMPLATE = path.join(ROOT, 'obs', 'Smile-Trading-Kit-TEMPLATE.json')
const FINAL = path.join(ROOT, 'obs', 'Smile-Trading-Kit-FINAL.json')

function abs(p){ return path.resolve(ROOT, p) }

let txt = fs.readFileSync(TEMPLATE, 'utf8')
txt = txt.replaceAll('{{LOCAL_FILE_TICKER}}', abs('core/ticker.html'))
txt = txt.replaceAll('{{LOCAL_FILE_LOWER}}', abs('core/lower-third.html'))
txt = txt.replaceAll('{{LOCAL_FILE_CHART}}', abs('core/chart.html'))
txt = txt.replaceAll('{{LOCAL_FILE_OVERLAY}}', abs('core/overlay.html'))

fs.writeFileSync(FINAL, txt)
console.log('Wrote FINAL: ' + FINAL)
console.log('ticker: ' + abs('core/ticker.html'))
console.log('Import FINAL into OBS - scenes and sources will appear, no localhost')
