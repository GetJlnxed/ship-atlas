import {canonical,isMissing} from './engine.js';

// Full source data stays available for existing saved conditions; only curated fields
// are offered in the catalogue, comparison, exports and new conditions.
export function curateFields(fields,ships){
 const kept=[],removed=[],signatures=new Map();
 const priority=f=>(f.key.includes('.')?10:0)+(f.technical?2:0);
 for(const field of [...fields].sort((a,b)=>priority(a)-priority(b))){
  const values=ships.map(s=>s.values[field.key]);
  const known=values.filter(v=>!isMissing(v));
  const distinct=new Set(known.map(canonical)).size;
  const signature=JSON.stringify(values.map(canonical));
  const reason=!known.length?'empty':distinct===1?'constant':known.length<=3?'rare':signatures.has(signature)?'duplicate':null;
  if(reason){removed.push({...field,removalReason:reason,replacement:reason==='duplicate'?signatures.get(signature):undefined});continue}
  signatures.set(signature,field.key);kept.push(field);
 }
 const keys=new Set(kept.map(f=>f.key));
 return {fields:fields.filter(f=>keys.has(f.key)).map(f=>({...f,aliases:removed.filter(x=>x.replacement===f.key).map(x=>x.key)})),archivedFields:removed,
  report:{before:fields.length,after:kept.length,removed:removed.length,reasons:removed.reduce((a,f)=>(a[f.removalReason]=(a[f.removalReason]||0)+1,a),{})}};
}

export const fieldSearchText=f=>[f.label,f.group,f.key,...(f.aliases||[])].join(' ').toLowerCase();

export function migrateComparison(keys,fields,archived=[]){
 const valid=new Set(fields.map(f=>f.key)),aliases=new Map(archived.filter(f=>f.replacement).map(f=>[f.key,f.replacement]));
 return [...new Set(keys.map(key=>valid.has(key)?key:aliases.get(key)).filter(key=>valid.has(key)))];
}
