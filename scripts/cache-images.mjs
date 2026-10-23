import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'public/data/catalog.json')));
const dir=path.join(root,'public/images');fs.mkdirSync(dir,{recursive:true});
const queue=[...data.ships];const report=[];
async function worker(){while(queue.length){const s=queue.shift();const file=path.join(dir,s.id+'.jpg');if(fs.existsSync(file))continue;if(!s.image)continue;try{const r=await fetch(s.image,{signal:AbortSignal.timeout(15000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error('HTTP '+r.status);const b=Buffer.from(await r.arrayBuffer());if(b.length<500)throw Error('Empty image');fs.writeFileSync(file,b)}catch(e){report.push({id:s.id,error:e.message})}}}
await Promise.all(Array.from({length:4},worker));fs.writeFileSync(path.join(root,'data/image-report.json'),JSON.stringify(report,null,2));console.log('Images',fs.readdirSync(dir).length,'failed',report.length);
