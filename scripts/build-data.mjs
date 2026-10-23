import fs from 'node:fs';
import {buildCombatData} from './combat-data.mjs';
import {curateFields} from '../src/catalog-quality.js';
import {presentField} from '../src/field-presentation.js';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,'data/raw',n),'utf8'));
const p1=read('fleet-page-1.json');
const fleet=Array.from({length:p1.meta.pagination.totalPages},(_,i)=>i?read('fleet-page-'+(i+1)+'.json'):p1).flatMap(p=>p.items).map(f=>{const p=path.join(root,'data/raw/details',f.slug+'-detail.json');return fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):f});
if(fleet.length!==p1.meta.pagination.totalCount||new Set(fleet.map(x=>x.id)).size!==fleet.length)throw Error('Incomplete or duplicate FleetYards snapshot');
const rsi=read('rsi.json'); if(!rsi.success||!Array.isArray(rsi.data)||rsi.data.length<200)throw Error('Invalid RSI snapshot');
const labels={name:'Название',manufacturer:'Производитель',focus:'Назначение',status:'Готовность',size:'Размер',ground:'Наземная техника',crewMin:'Экипаж: минимум',crewMax:'Экипаж: максимум',cargo:'Груз',length:'Длина',beam:'Ширина',height:'Высота',mass:'Масса',scm:'Скорость SCM',speed:'Максимальная скорость',pitch:'Тангаж',yaw:'Рыскание',roll:'Крен',hull:'Прочность корпуса',hydrogen:'Водородное топливо',quantum:'Квантовое топливо',price:'Цена в игре',pledge:'Цена pledge',source:'Источники',added:'Дополнено из RSI',inGame:'Есть в игре',variant:'Издание / комплект'};
const units={cargo:'SCU',length:'м',beam:'м',height:'м',mass:'кг',scm:'м/с',speed:'м/с',pitch:'°/с',yaw:'°/с',roll:'°/с',hull:'HP',price:'aUEC',pledge:'USD'};
const groups={cargo:'Груз и габариты',length:'Груз и габариты',beam:'Груз и габариты',height:'Груз и габариты',mass:'Груз и габариты',scm:'Полёт',speed:'Полёт',pitch:'Полёт',yaw:'Полёт',roll:'Полёт',hull:'Корпус и топливо',hydrogen:'Корпус и топливо',quantum:'Корпус и топливо',price:'Цена и доступность',pledge:'Цена и доступность'};
const translations={metrics:'Габариты и корпус',speeds:'Полёт',availability:'Магазины',cargoHolds:'Грузовые отсеки',hydrogenFuelTanks:'Водородные баки',quantumFuelTanks:'Квантовые баки',storageContainers:'Контейнеры',weaponRacks:'Оружейные стойки',externalFuelTanks:'Внешние баки',refuelBoom:'Заправочная штанга',crew:'Экипаж',loaners:'Подменные корабли',compiled:'Компоненты',dockCounts:'Стыковочные места',carriedBy:'Перевозится на',hullParts:'Части корпуса',hullDoors:'Двери',signatureCrossSection:'Заметность',health:'Прочность',capacity:'Вместимость',maxCargo:'Макс. груз',personalInventory:'Личный инвентарь',mainAcceleration:'Ускорение',retroAcceleration:'Торможение',secondsToScmSpeed:'Разгон до SCM',secondsToStopFromScmSpeed:'Остановка с SCM',weaponPoolSize:'Оружейный пул',dockSize:'Размер дока',maxContainerSize:'Макс. контейнер',dimensions:'Размеры',count:'Количество',size:'Размер',name:'Название',quantity:'Количество',mounts:'Крепления',weapons:'Оружие',turrets:'Турели',missiles:'Ракеты',shield_generators:'Щиты',quantum_drives:'Квантовые двигатели',power_plants:'Силовые установки',coolers:'Охладители'};
const schema=new Map();
Object.assign(translations,{game:'Игровое оборудование',positions:'Позиции экипажа',Shield:'Щиты',Armor:'Броня',WeaponGun:'Корабельные орудия',Missile:'Ракеты',QuantumDrive:'Квантовые двигатели',PowerPlant:'Силовые установки',Cooler:'Охладители',Radar:'Радар',FlightController:'Управление полётом',Turret:'Турели / подвесы',typeData:'Параметры',durability:'Прочность компонента',maxHealth:'Макс. прочность',maxRegen:'Восстановление',damagePerShot:'Урон за выстрел',fireRate:'Скорострельность',range:'Дальность',speed:'Скорость',spoolUpTime:'Разогрев',driveSpeed:'Квантовая скорость',powerConsumption:'Потребление энергии',powerBase:'Выработка энергии',quantumFuelConsumption:'Расход квантового топлива',WeaponDefensive:'Контрмеры',MissileLauncher:'Ракетные установки',LifeSupportGenerator:'Жизнеобеспечение',MainThruster:'Основные двигатели',ManneuverThruster:'Маневровые двигатели',MiningArm:'Добыча',SalvageHead:'Утилизация',TractorBeam:'Тракторный луч',MedicalBed:'Медицинские кровати',FuelTank:'Водородные баки',QuantumFuelTank:'Квантовые баки',JumpDrive:'Прыжковые модули',CargoGrid:'Грузовые сетки',shieldTotal:'Щиты: суммарная прочность',gunCount:'Орудия: количество',missileCount:'Ракеты: количество',shieldCount:'Щиты: количество',armorTotal:'Броня: суммарная прочность',gunMaxSize:'Орудия: максимальный размер'});
function register(key,v,group,label,unit=''){
 let f=schema.get(key);if(!f){f={key,label,group,unit,types:new Set(),values:new Set(),coverage:0};schema.set(key,f)}
 if(v!==null&&v!==undefined&&v!==''){f.types.add(typeof v);if(typeof v==='string'&&v.length<140)f.values.add(v)}
}
const skip=new Set(['media','logo','icon','storeImage','signedId','holo','brochure','description']);
function flatten(value,prefix,out){
 if(Array.isArray(value)){
   if(prefix.includes('[]')){(out[prefix+'.count']??=[]).push(value.length)}else out[prefix+'.count']=value.length;
   register(prefix+'.count',value.length,prefix.startsWith('rsi.')?'RSI · Компоненты':(prefix.startsWith('game.')?'Игровое оборудование · ':'FleetYards · ')+(translations[prefix.split('.')[1]]||prefix.split('.')[1]),prefix.replace(/^(fy|rsi|game)\./,'')+' · количество');
   for(const v of value)flatten(v,prefix+'[]',out);return;
 }
 if(value&&typeof value==='object'){for(const [k,v]of Object.entries(value)){if(skip.has(k)||/Url$|Label$/.test(k)||['id','itemId','signedId','source_stream','derived_data','images'].includes(k))continue;flatten(v,prefix+'.'+k,out)}return}
 if(typeof value==='string'&&(/^https?:/.test(value)||value.length>600))return;
 let v=value;if(typeof v==='string'&&v.trim()!==''&&/^-?\d+(\.\d+)?$/.test(v))v=Number(v);
 if(prefix.includes('[]')){out[prefix]??=[];if(v!==null&&v!==undefined&&v!=='')out[prefix].push(v)}else out[prefix]=v;
 const seg=prefix.split('.');const group=(seg[0]==='fy'?'FleetYards':seg[0]==='game'?'Игровое оборудование':'RSI')+' · '+(translations[seg[1].replace('[]','')]||seg[1].replace('[]',''));
 register(prefix,v,group,seg.slice(1).map(k=>(translations[k.replace('[]','')]||k.replace(/([a-z])([A-Z])/g,'$1 $2'))+(k.includes('[]')?' [список]':'')).join(' › '));
}
function normalize(f,r){
 const id=f?.slug||'rsi-'+r.id,values={},origins={};
 const set=(k,a,b)=>{values[k]=a??b??null;origins[k]=a!=null?'FleetYards':b!=null?'RSI':null;register(k,values[k],groups[k]||'Основное',labels[k]||k,units[k])};
 set('name',f?.name,r?.name?.trim());set('manufacturer',f?.manufacturer?.name,r?.manufacturer?.name);set('focus',f?.focus,r?.focus);set('status',f?.productionStatus,r?.production_status);set('size',f?.metrics?.size,r?.size?.toLowerCase());
 set('ground',f?.metrics?.isGroundVehicle,r?(/ground|vehicle/i.test(r.type)||/ground/i.test(r.size)):null);
 set('crewMin',f?.crew?.min,r?.min_crew);set('crewMax',f?.crew?.max??f?.crew?.value,r?.max_crew);
 for(const[k,a,b]of [['cargo','cargo','cargocapacity'],['length','length','length'],['beam','beam','beam'],['height','height','height'],['mass','mass','mass'],['hull','hullHealth',null],['hydrogen','hydrogenFuelTankSize',null],['quantum','quantumFuelTankSize',null]])set(k,f?.metrics?.[a],b?r?.[b]:null);
 for(const[k,a,b]of [['scm','scmSpeed','scm_speed'],['speed','maxSpeed','afterburner_speed'],['pitch','pitch','pitch_max'],['yaw','yaw','yaw_max'],['roll','roll','roll_max']])set(k,f?.speeds?.[a],r?.[b]);
 set('price',f?.price,null);set('pledge',f?.pledgePrice,null);set('inGame',f?.inGame,r?.production_status==='flight-ready'?true:null);
 values.source=[f?'FleetYards':null,r?'RSI':null].filter(Boolean);register('source','FleetYards','Основное',labels.source);register('source','RSI','Основное',labels.source);
 set('added',!!(!f&&r),null);set('variant',!!r&&/edition|w\/|emerald|vindicator|snowblind|dunestalker|expedition/i.test(r.name),null);
 if(f)flatten(f,'fy',values);
 if(f){
  const hp=path.join(root,'data/raw/details',f.slug+'-hardpoints.json'),pos=path.join(root,'data/raw/details',f.slug+'-positions.json');
  if(fs.existsSync(pos))flatten(JSON.parse(fs.readFileSync(pos)),'fy.positions',values);
  if(fs.existsSync(hp)){
   const slots=JSON.parse(fs.readFileSync(hp));const seen=new Set(),byType={};
   function walk(list){for(const h of list){if(seen.has(h.id))continue;seen.add(h.id);if(h.component){const {hardpoints,...c}=h.component;const type=c.type||h.category||'Unknown';(byType[type]??=[]).push({...c,slot:{name:h.name,category:h.category,minSize:h.minSize,maxSize:h.maxSize,types:h.types}})}walk(h.hardpoints||[])}}walk(slots);
   for(const [type,list]of Object.entries(byType))flatten(list,'game.'+type,values);
   if(slots.length){const derived={shieldTotal:byType.Shield?.reduce((sum,c)=>sum+(c.typeData?.maxHealth??0),0)??null,shieldCount:byType.Shield?.length??0,gunCount:byType.WeaponGun?.length??0,missileCount:byType.Missile?.length??0,gunMaxSize:byType.WeaponGun?.length?Math.max(...byType.WeaponGun.map(c=>Number(c.size)||0)):null,armorTotal:byType.Armor?.reduce((sum,c)=>sum+(c.typeData?.health??0),0)??null};for(const[k,v]of Object.entries(derived)){values[k]=v;origins[k]='FleetYards · сумма / количество штатных компонентов';register(k,v,'Вооружение и защита',translations[k],['shieldTotal','armorTotal'].includes(k)?'HP':'')}}
  }
 }
 if(r)flatten(r,'rsi',values);
 for(const key of Object.keys(values)){if(Array.isArray(values[key]))values[key]=[...new Set(values[key])];const v=values[key];if(v!=null&&v!==''&&(!Array.isArray(v)||v.length))schema.get(key).coverage++}
 const rm=r?.media?.find(m=>m.images)?.images;
 let image=rm?.store_slideshow_small||rm?.slideshow||f?.media?.storeImage?.smallUrl||null;
 if(image?.startsWith('/'))image='https://robertsspaceindustries.com'+image;
 const originalImage=image;if(fs.existsSync(path.join(root,'public/images',id+'.jpg')))image='/images/'+id+'.jpg';
 return {id,name:values.name,values,origins,image,originalImage,description:f?.description||r?.description||'',fleetUrl:f?'https://fleetyards.net/ships/'+f.slug+'/':null,rsiUrl:r?'https://robertsspaceindustries.com'+r.url:f?.links?.storeUrl||null,updatedAt:f?.updatedAt||null};
}
const ships=fleet.map(f=>normalize(f,rsi.data.find(r=>r.id===f.rsiId)));
const added=rsi.data.filter(r=>!fleet.some(f=>f.rsiId===r.id));for(const r of added)ships.push(normalize(null,r));
const fields=[...schema.values()].map(f=>({...f,type:f.types.has('number')&&!f.types.has('string')?'number':f.types.has('boolean')&&!f.types.has('string')?'boolean':'text',types:undefined,values:[...f.values].sort(),technical:/createdAt|updatedAt|scIdentifier|erkulIdentifier|rsiId|rsiSlug|slug|chassis_id|manufacturer_id|time_modified|hasImages|hasVideos|holoToScale|adiMap|hasPaints|hasModules|hasUpgrades|fleetchartOffset|lastUpdatedAt|production_note|productionNote/.test(f.key)}));
const displayFields=fields.map(presentField);
const curated=curateFields(displayFields,ships);
const result={meta:{version:1,fetchedAt:fs.existsSync(path.join(root,'data/raw/import-manifest.json'))?read('import-manifest.json').fetchedAt:'2026-10-23',fleetCount:fleet.length,rsiCount:rsi.data.length,total:ships.length,added:added.map(r=>r.name.trim()),sources:[{name:'FleetYards',url:'https://api.fleetyards.net/v1/models?perPage=240&page=1'},{name:'RSI Ship Matrix',url:'https://robertsspaceindustries.com/ship-matrix/index'}],note:'Снимок публичных данных. Параметры RSI могут отличаться от текущей игры. Неизвестные значения не заменены нулями. Поля массивов проверяются по значениям элементов; разные условия не привязаны к одному элементу.'},fields:curated.fields,archivedFields:curated.archivedFields,ships};
result.meta.fieldCleanup=curated.report;
result.pvp=buildCombatData(ships,path.join(root,'data/raw'));
fs.mkdirSync(path.join(root,'public/data'),{recursive:true});fs.writeFileSync(path.join(root,'public/data/catalog.json.tmp'),JSON.stringify(result));fs.renameSync(path.join(root,'public/data/catalog.json.tmp'),path.join(root,'public/data/catalog.json'));fs.writeFileSync(path.join(root,'public/data/catalog.json.gz'),zlib.gzipSync(JSON.stringify(result),{level:9}));
console.log(JSON.stringify({ships:ships.length,fields:curated.fields.length,cleanup:curated.report,added:result.meta.added,sizeMB: +(JSON.stringify(result).length/1e6).toFixed(2)},null,2));
