import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {extractCombatProfile} from '../scripts/combat-data.mjs';
import {armorCheck,threshold,defaultStations,activeLoadout,assessThreat,threats,canPilotControl,pilotControlState} from '../src/pvp.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../public/data/catalog.json',import.meta.url)));
const data=catalog.pvp;
const profile=id=>data.profiles[id];
const weapon=name=>data.weapons.find(w=>w.name.startsWith(name));

test('armor compares projectile damage, separately from DPS, energy and gun count',()=>{
 const p=profile('aegs-redeemer');
 assert.equal(armorCheck(p,weapon('AD4B')).state,'blocked');
 assert.equal(armorCheck(p,weapon('AD5B')).state,'blocked');
 assert.equal(armorCheck(p,weapon('C-788')).state,'passes');
 assert.equal(armorCheck(p,weapon('M5A')).state,'passes');
 assert.equal(armorCheck(p,weapon('AD5B'),20).state,'passes');
 assert.equal(armorCheck(profile('aegs-gladius'),weapon('Mantis')).state,'passes');
});
test('unknown, mixed armor and equality are never reported as protected',()=>{
 assert.equal(threshold([]),null);assert.equal(threshold([2,3]),null);assert.equal(threshold([2,null]),null);
 assert.equal(armorCheck({armorPhysical:[32],armorEnergy:[0]},weapon('Mantis')).state,'boundary');
 assert.equal(armorCheck({armorPhysical:null},weapon('Mantis')).state,'unknown');
 assert.equal(armorCheck({armorPhysical:[100,10]},weapon('Mantis')).state,'unknown');
 assert.equal(armorCheck({armorPhysical:[0]},weapon('Mantis')).state,'passes');
 assert.equal(armorCheck(profile('aegs-gladius'),{physical:null,energy:null}).state,'unknown');
});
test('Hurricane separates two pilot guns from four gunner guns and avoids duplicate nodes',()=>{
 const s=catalog.ships.find(s=>s.id==='anvl-hurricane');
 const raw=JSON.parse(fs.readFileSync(new URL('../data/raw/details/anvl-hurricane-hardpoints.json',import.meta.url)));
 const p=extractCombatProfile(s,[...raw,...raw]);
 assert.equal(p.pilot.length,2);assert.equal(p.stations.length,1);assert.equal(p.stations[0].guns.length,4);
 assert.equal(activeLoadout(p,1,0,defaultStations(p,1)).guns.length,2);
 const two=activeLoadout(p,2,0,defaultStations(p,2));assert.equal(two.guns.length,6);
 assert.equal(activeLoadout(p,2,1,defaultStations(p,2)).guns.length,2);
 assert.equal(assessThreat(threats[0],p,two,data).title,'Оборона зависит от стрелка');
 assert.equal(assessThreat(threats[0],p,activeLoadout(p,1),data).title,'Сложно удерживать цель');
});
test('Carrack solo cannot use empty turrets; crew is allocated once, with reserve respected',()=>{
 const p=profile('anvl-carrack');assert.equal(p.pilot.length,0);
 assert.equal(activeLoadout(p,1,0,p.stations.map(s=>s.id)).guns.length,0);
 const two=activeLoadout(p,2,0,defaultStations(p,2));
 const three=activeLoadout(p,3,0,defaultStations(p,3));
 assert.equal(two.turrets.length,1);assert.equal(three.turrets.length,2);
 assert.equal(activeLoadout(p,3,1,defaultStations(p,3)).turrets.length,1);
 assert.equal(assessThreat(threats[0],p,activeLoadout(p,1),data).title,'Нет активных орудий');
});
test('documented pilot links distinguish capability from LIVE checks and never double count',()=>{
 const p=profile('rsi-scorpius');assert.equal(p.pilot.length,4);assert.equal(p.stations.length,1);
 assert.equal(activeLoadout(p,1).guns.length,4);
 const id=p.stations[0].id;
 assert.equal(activeLoadout(p,1,0,[],[id],data.patch).guns.length,4);
 // Synthetic evidence exercises the allow rule; it is not a Scorpius claim.
 const station={...p.stations[0],pilotControl:{status:'known',mode:'simultaneous-pilot-fire',sourcePatch:'4.3.2',source:'https://example.test/proof',checkedAt:'2026-10-23'}};
 const verified={...p,stations:[station]};
 assert.equal(canPilotControl(station,data.patch),true);
 assert.equal(activeLoadout(verified,2,0,[id],[id],data.patch).guns.length,8);
 assert.equal(activeLoadout(verified,2,0,[id],[id],data.patch).turrets.length,0);
 for(const change of [{source:null},{mode:'remote-camera-only'},{status:'unknown'},{checkedAt:null}]){
   assert.equal(canPilotControl({...station,pilotControl:{...station.pilotControl,...change}},data.patch),false);
 }
 assert.equal(activeLoadout({...p,stations:[{...p.stations[0],pilotLinked:true}]},1,0,[],[id],data.patch).guns.length,4);
 assert.equal(activeLoadout(verified,1,0,[],[id],'4.11.0-live.1').guns.length,8);
 assert.equal(pilotControlState(station,data.patch),'known');
 const check={status:'verified',patch:data.patch,source:'https://example.test/live',checkedAt:'2026-10-23'};
 const checked={...station,pilotControl:{...station.pilotControl,liveCheck:check}};
 assert.equal(pilotControlState(checked,data.patch),'verified');
 assert.equal(pilotControlState(checked,'4.11.0-live.1'),'known');
 const broken={...checked,pilotControl:{...checked.pilotControl,liveCheck:{...check,status:'unavailable'}}};
 assert.equal(canPilotControl(broken,data.patch),false);
 assert.equal(activeLoadout({...p,stations:[broken]},1,0,[],[id],data.patch).guns.length,4);
});
test('tractor turrets and passengers do not add firepower',()=>{
 const p=profile('drak-cutlass-black');assert.equal(p.stations.length,1);
 assert.equal(activeLoadout(p,3,0,defaultStations(p,3)).guns.length,activeLoadout(p,2,0,defaultStations(p,2)).guns.length);
});
test('a single seat does not prove remote turret pilot control',()=>{
 const s=catalog.ships.find(s=>s.id==='rsi-scorpius');
 const raw=JSON.parse(fs.readFileSync(new URL('../data/raw/details/rsi-scorpius-hardpoints.json',import.meta.url)));
 const p=extractCombatProfile({...s,values:{...s.values,crewMax:1}},raw);
 assert.equal(p.stations[0].pilotLinked,false);
 assert.equal(activeLoadout(p,1).guns.length,p.pilot.length);
});
test('future patch, concept, ground vehicle and missing data never get positive assessments',()=>{
 const p=profile('aegs-gladius'),l=activeLoadout(p,1);
 for(const t of threats){
  assert.equal(assessThreat(t,p,l,{...data,patch:'4.11.0-live.1'}).level,'unknown');
  assert.equal(assessThreat(t,null,l,data).level,'unknown');
  assert.equal(assessThreat(t,{...p,ground:true},l,data).level,'unknown');
  assert.equal(assessThreat(t,{...p,status:'in-concept'},l,data).level,'unknown');
 }
});
test('all raw profiles can be assessed without optimistic missing-value coercion',()=>{
 for(const p of Object.values(data.profiles))for(const crew of [1,2,3]){
  const loadout=activeLoadout(p,crew,0,defaultStations(p,crew));
  for(const t of threats){const r=assessThreat(t,p,loadout,data);assert.ok(r.title);assert.ok(Array.isArray(r.reasons));}
 }
});
