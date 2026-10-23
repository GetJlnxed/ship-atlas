import fs from 'node:fs';
import path from 'node:path';

// Keep the hardpoint tree: flattened arrays lose weapon/seat relationships.
export function extractCombatProfile(ship, slots) {
  if (!Array.isArray(slots) || !slots.length) return null;
  const stations=[], pilot=[], automatic=[], seen=new Set();
  function walk(list, station=null) {
    for (const h of list) {
      if (seen.has(h.id)) continue;
      seen.add(h.id);
      const c=h.component;
      let owner=station;
      if (c && !c.tags?.includes('gimbalMount') && (c.type==='TurretBase' || c.type==='Turret') &&
          (h.category==='turret' || /Remote Turret/.test(c.name||''))) {
        owner={id:h.id, kind:c.subType==='PDCTurret'?'automatic':c.subType==='MannedTurret'?'manned':'remote', guns:[]};
        stations.push(owner);
      }
      if (c?.type==='WeaponGun') {
        const gun=weaponRecord(c);
        (owner?owner.guns:pilot).push(gun);
      }
      walk(h.hardpoints||[],owner);
    }
  }
  walk(slots);
  const combatStations=stations.filter(s=>s.guns.length).filter(s=>{
    if(s.kind==='automatic'){automatic.push(...s.guns);return false}return true;
  }).map((s,i)=>({...s,label:(s.kind==='manned'?'Обитаемая':'Удалённая')+' турель '+(i+1),
    // Seat count and remote mount type do not establish pilot fire control.
    // No verified seat-control graph is present in this source.
    pilotLinked:false,pilotControl:null}));
  const v=ship.values;
  return {pilot,stations:combatStations,automatic,
    crewMin:v.crewMin,crewMax:v.crewMax,
    pitch:v.pitch,yaw:v.yaw,boost:v['fy.speeds.scmSpeedBoosted'],
    armorPhysical:v['game.Armor[].typeData.deflectionPhysical'],
    armorEnergy:v['game.Armor[].typeData.deflectionEnergy'],
    status:v.status,ground:v.ground};
}

export function weaponRecord(c) {
  const t=c.typeData||{};
  return {id:c.slug,name:c.name,size:Number(c.size)||null,physical:t.damagePerShot?.physical??null,
    energy:t.damagePerShot?.energy??null,speed:t.speed??null,pellets:t.pelletsPerShot??null,
    source:'https://api.fleetyards.net/v1/components/'+c.slug};
}

export function buildCombatData(ships,rawRoot) {
  const manifest=JSON.parse(fs.readFileSync(path.join(rawRoot,'import-manifest.json'),'utf8'));
  const controls=JSON.parse(fs.readFileSync(new URL('../data/pilot-control.json',import.meta.url),'utf8'));
  const profiles={},weapons=new Map();
  for(const s of ships){
    const file=path.join(rawRoot,'details',s.id+'-hardpoints.json');
    if(!fs.existsSync(file))continue;
    const p=extractCombatProfile(s,JSON.parse(fs.readFileSync(file,'utf8')));
    if(!p)continue;
    for(const station of p.stations){
      station.pilotControl=controls.records.find(r=>r.shipId===s.id&&r.stationId===station.id)||null;
      if(station.pilotControl?.label)station.label=station.pilotControl.label;
    }
    profiles[s.id]=p;
    for(const g of [...p.pilot,...p.stations.flatMap(t=>t.guns),...p.automatic])weapons.set(g.name,g);
  }
  const supplement=path.join(rawRoot,'components','deadbolt-iv-cannon-espr-ballisticcannon-s4.json');
  if(fs.existsSync(supplement)){const c=JSON.parse(fs.readFileSync(supplement,'utf8'));weapons.set(c.name,weaponRecord(c))}
  const names=['Mantis GT-220 Gatling','AD4B Ballistic Gatling','AD5B Ballistic Gatling','Deadbolt IV Cannon','C-788 Cannon','M5A Cannon','CF-337 Panther Repeater'];
  return {patch:manifest.observedFleetYardsPatch||null,fetchedAt:manifest.fetchedAt,
    profiles,weapons:names.map(name=>weapons.get(name)||{name,id:name,physical:null,energy:null})};
}
