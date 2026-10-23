import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canonical,isMissing,matchGroup} from '../src/engine.js';
import {curateFields,migrateComparison} from '../src/catalog-quality.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../public/data/catalog.json',import.meta.url)));
test('Published field selection has no empty, constant, rare or duplicate vectors',()=>{
 const signatures=new Set();
 for(const f of catalog.fields){
  const values=catalog.ships.map(s=>s.values[f.key]),known=values.filter(v=>!isMissing(v));
  assert.ok(known.length>3,f.key);assert.ok(new Set(known.map(canonical)).size>1,f.key);
  const signature=JSON.stringify(values.map(canonical));assert.ok(!signatures.has(signature),f.key);signatures.add(signature);
 }
 assert.equal(catalog.fields.length+catalog.archivedFields.length,4070);
 assert.equal(catalog.meta.fieldCleanup.removed,catalog.archivedFields.length);
});
test('Deduplication prioritizes common fields, accounts for unknowns and array order, and preserves zero and false',()=>{
 const fields=['source.x','x','empty','constant','rare','distinctMissing'].map(key=>({key}));
 const ships=Array.from({length:5},(_,i)=>({values:{'source.x':i%2?[1,0]:[0,1,2],x:i%2?[0,1]:[2,1,0],empty:null,constant:false,rare:i<3?i:null,distinctMissing:i===4?null:i}}));
 const c=curateFields(fields,ships);assert.deepEqual(c.fields.map(f=>f.key),['x','distinctMissing']);
 assert.equal(c.archivedFields.find(f=>f.key==='source.x').replacement,'x');
 assert.equal(c.archivedFields.find(f=>f.key==='rare').removalReason,'rare');
});
test('Comparison aliases migrate and archived saved conditions retain exact filtering behavior',()=>{
 assert.deepEqual(migrateComparison(['fy.metrics.hullHealth','hull','game.ManneuverThruster[].hidden'],catalog.fields,catalog.archivedFields),['hull']);
 const old={mode:'and',children:[{field:'fy.metrics.hullHealth',op:'gte',value:10000,unknown:'exclude'}]};
 const current={mode:'and',children:[{...old.children[0],field:'hull'}]};
 assert.deepEqual(catalog.ships.filter(s=>matchGroup(s.values,old)).map(s=>s.id),catalog.ships.filter(s=>matchGroup(s.values,current)).map(s=>s.id));
 assert.ok(catalog.fields.find(f=>f.key==='hull').aliases.includes('fy.metrics.hullHealth'));
});
