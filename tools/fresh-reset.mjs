import { execSync } from 'child_process'
import fs from 'fs'

function run(cmd){ console.log('> '+cmd); execSync(cmd, {stdio:'inherit'}) }

try{
  run('git rev-parse --git-dir')
  run('git fetch origin')
  run('git checkout main')
  run('git pull origin main')
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,16)
  const backup = `backup-auto-${ts}`
  run(`git checkout -b ${backup}`)
  run(`git push -u origin ${backup}`)
  run('git checkout main')
  const feat = `feat/fresh-v4-${ts}`
  run(`git checkout -b ${feat}`)
  for(const p of ['obs/Smile-Trading-Kit-FINAL.json','obs/Smile-Trading-Kit-v2.json','obs/Smile-Trading-Kit-v3.json','core/live.json']){
    if(fs.existsSync(p)){ fs.unlinkSync(p); console.log('removed '+p) }
  }
  for(const d of ['core/vendor','core/node_modules']){
    if(fs.existsSync(d)){ fs.rmSync(d,{recursive:true,force:true}); console.log('removed '+d) }
  }
  run('git add .')
  try{ run(`git commit -m "feat: fresh v4 localhost + 1:1 SVG + validate fix - ${new Date().toISOString()}"`) }catch{}
  run(`git push -u origin ${feat}`)
  try{
    run(`gh pr create --title "feat: fresh v4" --body "Auto fresh push, duplicates cleaned, localhost v4, SVG 1:1, validate fixed" --base main`)
  }catch{
    console.log(`Create PR manually: https://github.com/RKW-Kim/smile-live-kit/compare/${feat}`)
  }
}catch(e){ console.error(e.message); process.exit(1) }
