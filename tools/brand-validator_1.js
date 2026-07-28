import fs from 'fs';const b=JSON.parse(fs.readFileSync(process.argv[2]||'brands/template/brand.json','utf8'));console.log('OK',b.meta.channel)
