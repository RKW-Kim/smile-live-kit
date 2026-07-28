import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { OBSWebSocket } from 'obs-websocket-js'
import dotenv from 'dotenv'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, 'secrets.env') })
const brand = JSON.parse(fs.readFileSync(path.join(__dirname, 'brand.json'),'utf8'))
const obs = new OBSWebSocket()
const url = process.env.OBS_WS_URL || 'ws://localhost:4455'
const pass = process.env.OBS_WS_PASSWORD || ''
const sceneArg = process.argv[2] || 'CHART'

async function getId(scene, source){
  const { sceneItems } = await obs.call('GetSceneItemList', {sceneName: scene})
  return sceneItems.find(i=>i.sourceName===source)?.sceneItemId
}

async function main(){
  if(!pass){ console.log('Set OBS_WS_PASSWORD in secrets.env'); return }
  await obs.connect(url, pass)
  console.log('[obs] connected')
  const layout = brand.layouts?.scenes?.[sceneArg]
  if(!layout){ console.log('No layout for', sceneArg); process.exit(0) }
  for(const [key, cfg] of Object.entries(layout)){
    const map = { camera: 'WEBCAM-1', chart: 'chart', ticker: 'ticker' }
    const source = map[key] || key
    const id = await getId(sceneArg, source)
    if(!id){ console.log('no item', source); continue }
    await obs.call('SetSceneItemTransform', {
      sceneName: sceneArg,
      sceneItemId: id,
      sceneItemTransform: { positionX: cfg.x, positionY: cfg.y, cropTop:0, cropBottom:0 }
    })
    console.log(`Moved ${source} to ${cfg.x},${cfg.y} in ${sceneArg}`)
  }
  await obs.disconnect()
}
main()
