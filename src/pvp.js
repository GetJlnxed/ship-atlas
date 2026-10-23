export const REVIEW_PATCH='4.10.2';
export const REVIEW_DATE='23.10.2026';
export const sources={
  fighters:'https://www.reddit.com/r/starcitizen/comments/1x5dae1/how_is_the_f7a_hornet_mk_ii_in_the_current_patch/',
  talon:'https://www.reddit.com/r/starcitizen/comments/1xabmw9/espera_talon_build/',
  control:'https://www.reddit.com/r/starcitizen/comments/1x5utcy/pvp_focused_fleet/',
  group:'https://www.reddit.com/r/starcitizen/comments/1xc0ian/are_people_really_trying_to_stop_us_from/',
  armor:'https://robertsspaceindustries.com/comm-link/Patch-Notes/21070-Star-Citizen-Alpha-47'
};
export const threats=[
  {id:'duelist',name:'Манёвренный дуэлянт',example:'Arrow / Gladius',reference:'aegs-gladius',source:sources.fighters,
    guns:['Mantis GT-220 Gatling','CF-337 Panther Repeater'],loadout:'Контрольные S3-пушки; единая сборка LIVE не подтверждена.'},
  {id:'stealth',name:'Малозаметный атакующий',example:'Talon',reference:'espr-talon',source:sources.talon,
    guns:['AD4B Ballistic Gatling','Deadbolt IV Cannon','C-788 Cannon'],loadout:'Альтернативные сборки: AD4B, Deadbolt IV или C788.'},
  {id:'interceptor',name:'Быстрый тяжёлый атакующий',example:'M80',reference:'orig-m80',source:sources.fighters,
    guns:['AD4B Ballistic Gatling','AD5B Ballistic Gatling'],loadout:'Баллистическая сборка AD4B + AD5B.'},
  {id:'heavy',name:'Противник с сильным залпом',example:'Guardian MX / Hornet Mk II',reference:'mrai-guardian-mx',source:sources.fighters,
    guns:['Deadbolt IV Cannon','AD4B Ballistic Gatling','M5A Cannon'],loadout:'Примеры альтернативных пушек; эталон корпуса — Guardian MX.'},
  {id:'control',name:'Блокировка ухода',example:'Mantis / Raven EX / Guardian Qi',reference:null,source:sources.control,
    guns:[],loadout:'Здесь важнее квантовая блокировка и наличие напарников.'},
  {id:'group',name:'Групповой перехват',example:'Mantis + Talon + M80',reference:null,source:sources.group,
    guns:['AD4B Ballistic Gatling','AD5B Ballistic Gatling','C-788 Cannon'],loadout:'Наблюдался такой состав группы; точные пушки всех участников неизвестны.'}
];

export const numeric=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
export function threshold(value){
  const a=Array.isArray(value)?value:[value];
  return a.length&&a.every(v=>numeric(v)!==null)&&new Set(a).size===1?a[0]:null;
}
export const currentData=data=>typeof data?.patch==='string'&&/^4\.10\.2-live\./i.test(data.patch);

// A documented capability and a runtime check for this build are separate facts.
export function pilotControlState(station,patch){
  const evidence=station?.pilotControl;
  if(!(station?.kind==='remote'&&evidence?.status==='known'&&
    evidence.mode==='simultaneous-pilot-fire'&&typeof evidence.source==='string'&&
    evidence.source.startsWith('https://')&&evidence.checkedAt))return 'unknown';
  const check=evidence.liveCheck;
  if(patch&&check?.patch===patch&&check.checkedAt&&check.source?.startsWith('https://')){
    if(check.status==='verified')return 'verified';
    if(check.status==='unavailable')return 'unavailable';
  }
  return 'known';
}
export const canPilotControl=(station,patch)=>['known','verified'].includes(pilotControlState(station,patch));

// One projectile, full-health main hull, no shields. A threshold comparison
// does not simulate impact angle, wear, splash damage or component penetration.
export function armorCheck(profile,weapon,bonus=0){
  const channels=['physical','energy'].filter(k=>numeric(weapon?.[k])!==null&&weapon[k]>0);
  if(!profile||!channels.length||numeric(weapon.physical)===null||numeric(weapon.energy)===null||weapon.pellets!==1)
    return {state:'unknown',label:'Нет данных',channels:[]};
  const rows=channels.map(k=>({type:k,hit:weapon[k]*(1+bonus/100),limit:threshold(profile[k==='physical'?'armorPhysical':'armorEnergy'])}));
  if(rows.some(r=>r.limit===null))return {state:'unknown',label:'Нет данных брони',channels:rows};
  if(rows.some(r=>r.hit>r.limit))return {state:'passes',label:'Броня не остановит снаряд',channels:rows};
  if(rows.some(r=>Math.abs(r.hit-r.limit)<1e-8))return {state:'boundary',label:'На границе',channels:rows};
  return {state:'blocked',label:'Целая броня блокирует снаряд',channels:rows};
}

export function weaponDescription(weapon){
  const type=/Ballistic Gatling|Gatling/.test(weapon.name)?'Баллистический гатлинг':
    weapon.physical>0?'Баллистическая пушка':/Repeater/.test(weapon.name)?'Лазерный репитер':'Лазерная пушка';
  return `${type} · S${weapon.size||'?'}`;
}

export function defaultStations(profile,crew=1,reserve=0){
  return [...(profile?.stations||[])]
    .sort((a,b)=>b.guns.length-a.guns.length||b.guns.reduce((n,g)=>n+(g.size||0),0)-a.guns.reduce((n,g)=>n+(g.size||0),0))
    .slice(0,Math.max(0,crew-1-reserve)).map(s=>s.id);
}
export function activeLoadout(profile,crew=1,reserve=0,selected=[],linked=[],patch=null){
  if(!profile)return {guns:[],turrets:[],unused:0};
  const linkedSet=new Set(linked);
  const autoLinked=profile.stations.filter(s=>linkedSet.has(s.id)&&canPilotControl(s,patch));
  const turrets=profile.stations.filter(s=>selected.includes(s.id)&&!autoLinked.includes(s))
    .slice(0,Math.max(0,crew-1-reserve));
  return {guns:[...profile.pilot,...autoLinked.flatMap(s=>s.guns),...turrets.flatMap(s=>s.guns)],turrets,
    unused:Math.max(0,crew-1-reserve-turrets.length)};
}

export function assessThreat(threat,profile,loadout,data){
  const result=(level,title,reasons)=>({id:threat.id,level,title,reasons});
  if(!currentData(data))return result('unknown','Версия данных не подтверждена',['Нужен снимок 4.10.2 LIVE. Оценка другого патча не переносится автоматически.']);
  if(!profile||profile.status!=='flight-ready'||profile.ground)return result('unknown','Оценка недоступна',['Нет полного набора данных лётного корабля в LIVE.']);
  if(threat.id==='control')return result('risk','Уход нельзя гарантировать',[
    'Числа скорости и брони не показывают, сможете ли вы покинуть зону блокировки.',
    loadout.guns.length?'Нужен огонь по удерживающему кораблю или помощь прикрытия.':'Без занятого боевого поста ответный огонь в модели отсутствует.'
  ]);
  if(threat.id==='group')return result('risk','Опасно без прикрытия',[
    loadout.turrets.length?`Занято турелей: ${loadout.turrets.length}. Они дают независимый огонь, но не подтверждают защиту со всех направлений.`:'Один пилот не может одновременно удерживать несколько направлений огня.',
    'Броня не устраняет численный перевес и блокировку ухода. Несколько своих кораблей здесь не моделируются.'
  ]);
  const ref=data?.profiles?.[threat.reference];
  if(!ref)return result('unknown','Нет данных противника',[]);
  const checks=loadout.guns.map(g=>({gun:g,check:armorCheck(ref,g)}));
  const passing=checks.filter(x=>x.check.state==='passes');
  if(!loadout.guns.length)return result('risk','Нет активных орудий',['Выбранный экипаж не обслуживает ни одного орудия. Ракеты и автоматическая оборона не входят в оценку.']);
  if(!passing.length){
    const unknown=checks.some(x=>['unknown','boundary'].includes(x.check.state));
    return result(unknown?'unknown':'risk',unknown?'Неясна возможность ответного урона':'Штатным пушкам мешает броня',[
      unknown?'Не для всех активных орудий известен результат проверки.':'Активные штатные пушки не проходят порог целого корпуса эталонного противника без щитов.',
      'Это не учитывает слабые места, повреждённую броню и замену вооружения.'
    ]);
  }
  const fmt=n=>Number(n.toFixed(1)).toLocaleString('ru-RU');
  const reasons=[`Порог корпуса эталона проходят ${passing.length} из ${loadout.guns.length} активных штатных орудий. Это не расчёт времени уничтожения.`];
  const incoming=(data.weapons||[]).filter(w=>threat.guns.includes(w.name)).map(w=>({name:w.name,result:armorCheck(profile,w)}));
  const blocked=incoming.filter(w=>w.result.state==='blocked'),passes=incoming.filter(w=>w.result.state==='passes');
  if(blocked.length)reasons.push('Целый корпус блокирует контрольные снаряды: '+blocked.map(w=>w.name).join(', ')+'.');
  if(passes.length)reasons.push('Порог вашей брони проходят: '+passes.map(w=>w.name).join(', ')+'. Щиты и слабые места здесь не рассчитаны.');
  const rotationKnown=[profile.pitch,profile.yaw,ref.pitch,ref.yaw].every(v=>numeric(v)!==null&&v>0);
  const turn=rotationKnown?Math.min(profile.pitch/ref.pitch,profile.yaw/ref.yaw):null;
  const turretAnswer=loadout.turrets.some(s=>s.guns.some(g=>armorCheck(ref,g).state==='passes'));
  if(rotationKnown)reasons.push(`Тангаж / рыскание: ${fmt(profile.pitch)} / ${fmt(profile.yaw)}°/с; эталон ${fmt(ref.pitch)} / ${fmt(ref.yaw)}°/с.`);
  else reasons.push('Сравнение манёвренности недоступно.');
  if(turretAnswer)reasons.push('Занятая турель может вести огонь независимо от разворота корпуса. Сектора и точность стрелка не рассчитаны.');
  if(threat.id==='stealth')reasons.push('Первое обнаружение и внезапность не рассчитаны: нужна фактическая сигнатура и настройка радара.');
  if(threat.id==='interceptor'){
    if(numeric(profile.boost)===null||numeric(ref.boost)===null)return result('unknown','Неясен контроль дистанции',reasons);
    reasons.push(`Форсаж SCM: ${fmt(profile.boost)} против ${fmt(ref.boost)} м/с. Ускорение и запас форсажа здесь не моделируются.`);
    return result(profile.boost>=ref.boost?'conditional':'risk',profile.boost>=ref.boost?'Есть запас скорости':'Сложно навязать дистанцию',reasons);
  }
  if(turn===null&&!turretAnswer)return result('unknown','Недостаточно данных',reasons);
  if(turn!==null&&turn>=0.85)return result('conditional','Есть условия для боя',reasons);
  if(turretAnswer)return result('conditional','Оборона зависит от стрелка',reasons);
  return result('risk','Сложно удерживать цель',reasons);
}
