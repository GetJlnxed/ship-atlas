import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'data/raw/details');fs.mkdirSync(dir,{recursive:true});
const ships=[1,2].flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,`data/raw/fleet-page-${n}.json`))).items);
const queue=ships.flatMap(s=>['detail','hardpoints','positions'].map(type=>({slug:s.slug,type})));let done=0;const errors=[];
async function worker(){while(queue.length){const {slug,type}=queue.shift();const file=path.join(dir,slug+'-'+type+'.json');if(fs.existsSync(file)){done++;continue}const url='https://api.fleetyards.net/v1/models/'+slug+(type==='detail'?'':'/'+type);let success=false;for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(type==='detail'?!d.id:!Array.isArray(d))throw Error('Unexpected schema');fs.writeFileSync(file,JSON.stringify(d));success=true;break}catch(e){if(attempt===2)errors.push({slug,type,error:e.message})}}done++;if(done%40===0)console.log(`${done}/${ships.length*3} imported; failures ${errors.length}`)}}
await Promise.all(Array.from({length:4},worker));fs.writeFileSync(path.join(root,'data/enrichment-report.json'),JSON.stringify({at:new Date().toISOString(),total:ships.length*3,done,errors},null,2));console.log(JSON.stringify({done,errors}));
