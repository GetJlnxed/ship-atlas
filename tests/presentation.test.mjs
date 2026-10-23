import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fieldVisible} from '../src/field-presentation.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../public/data/catalog.json',import.meta.url)));
const sourceFields=[...catalog.fields,...catalog.archivedFields];
test('Presentation scopes preserve every source field and hide internal identifiers by default',()=>{
 for(const f of catalog.fields){
  assert.equal(fieldVisible(f,'technical'),true);
  if(/\.(hidden|retired|catalogued|scKey|scRef)$|\.slot\.name$|\.requiredTags/.test(f.key)){
   assert.equal(fieldVisible(f,'standard'),false,f.key);assert.equal(fieldVisible(f,'advanced'),false,f.key);
  }
  assert.ok(!f.group.includes('[]'),f.key);
 }
 const warning=sourceFields.find(f=>f.key==='game.ManneuverThruster[].temperature.overheatWarningTemperature');
 assert.equal(warning.level,'advanced');assert.equal(warning.unit,'');assert.match(warning.label,/Предупреждение о перегреве/);
 assert.equal(sourceFields.find(f=>f.key==='game.ManneuverThruster.count').group,warning.group);
});
test('All public field labels and groups avoid raw schema paths; RSI retains distinct source meanings',()=>{
 for(const f of catalog.fields.filter(f=>!f.technical)){
  assert.doesNotMatch(f.label+' '+f.group,/\[\]|_|RSIAvionic|RSIPropulsion|RSIModular|RSIThruster|RSIWeapon/,f.key);
 }
 const radar=sourceFields.filter(f=>f.key.startsWith('rsi.compiled.RSIAvionic.radar'));
 assert.ok(radar.length>5);assert.ok(radar.every(f=>f.group==='RSI · Радар'));
 assert.equal(radar.find(f=>f.key.endsWith('.quantity')).label,'Количество компонентов');
 assert.equal(radar.find(f=>f.key.endsWith('.count')).label,'Число записей оборудования');
 assert.equal(radar.find(f=>f.key.endsWith('.count')).technical,true);
 assert.equal(radar.find(f=>f.key.endsWith('.component_class')).technical,true);
 for(const type of ['QuantumDrive','Shield','WeaponGun','ManneuverThruster']){
  const groups=new Set(catalog.fields.filter(f=>f.key.startsWith('game.'+type+'.')||f.key.startsWith('game.'+type+'[].')).map(f=>f.group));
  assert.equal(groups.size,1,type);
 }
});
