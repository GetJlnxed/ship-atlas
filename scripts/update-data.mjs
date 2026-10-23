// Downloads into a staging directory; a failed import never replaces the working snapshot.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=path.join(root,'data','import-'+Date.now());fs.mkdirSync(path.join(stage,'details'),{recursive:true});
async function get(url){let last;for(let i=0;i<3;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(60000),headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status+' '+url);return await r.json()}catch(e){last=e}}throw last}
const write=(p,d)=>fs.writeFileSync(path.join(stage,p),JSON.stringify(d));
const first=await get('https://api.fleetyards.net/v1/models?perPage=240&page=1');write('fleet-page-1.json',first);
const models=[...first.items],pages=first.meta.pagination.totalPages;
for(let page=2;page<=pages;page++){const d=await get('https://api.fleetyards.net/v1/models?perPage=240&page='+page);write('fleet-page-'+page+'.json',d);models.push(...d.items)}
if(models.length!==first.meta.pagination.totalCount||new Set(models.map(x=>x.id)).size!==models.length)throw Error('FleetYards pagination incomplete');
const rsi=await get('https://robertsspaceindustries.com/ship-matrix/index');if(!rsi.success||!Array.isArray(rsi.data))throw Error('Invalid RSI snapshot');write('rsi.json',rsi);
const queue=[...models];let completed=0;
async function worker(){while(queue.length){const m=queue.shift();for(const kind of ['detail','hardpoints','positions']){const suffix=kind==='detail'?'':kind==='hardpoints'?'/hardpoints?source=game_files':'/positions';const d=await get('https://api.fleetyards.net/v1/models/'+m.slug+suffix);if(kind==='detail'?!d.id:!Array.isArray(d))throw Error('Invalid '+kind+' for '+m.slug);write('details/'+m.slug+'-'+kind+'.json',d)}completed++;if(completed%20===0)console.log(completed+'/'+models.length)}}
await Promise.all(Array.from({length:3},worker));
// This gun is not present in the stock ship loadouts but is a checked PvP threat.
fs.mkdirSync(path.join(stage,'components'),{recursive:true});
const deadbolt=await get('https://api.fleetyards.net/v1/components/deadbolt-iv-cannon-espr-ballisticcannon-s4');
if(deadbolt.name!=='Deadbolt IV Cannon')throw Error('Invalid supplemental weapon');
write('components/deadbolt-iv-cannon-espr-ballisticcannon-s4.json',deadbolt);
write('import-manifest.json',{fetchedAt:new Date().toISOString(),fleetCount:models.length,pages,rsiCount:rsi.data.length,details:models.length,hardpoints:models.length,positions:models.length});
const raw=path.join(root,'data/raw'),backup=path.join(root,'data','raw-backup-'+Date.now());
fs.renameSync(raw,backup);fs.renameSync(stage,raw);
const build=spawnSync(process.execPath,[path.join(root,'scripts/build-data.mjs')],{cwd:root,stdio:'inherit'});
if(build.status!==0){fs.renameSync(raw,stage);fs.renameSync(backup,raw);throw Error('Build failed; previous source snapshot restored')}
console.log('Import complete. Previous data retained at '+backup+'. Run npm run build to refresh the distributable.');
