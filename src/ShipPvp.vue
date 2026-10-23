<script setup>
import {computed,ref,watch} from 'vue';
import {REVIEW_DATE,threats,sources,currentData,numeric,threshold,armorCheck,weaponDescription,canPilotControl,pilotControlState,activeLoadout,defaultStations,assessThreat} from './pvp.js';
const props=defineProps({ship:Object,data:Object});
const profile=computed(()=>props.data?.profiles?.[props.ship.id]);
const crew=ref(1),reserve=ref(0),selected=ref([]),linked=ref([]),tab=ref('threats'),group=ref('all'),bonus=ref(0);
const maxCrew=computed(()=>Math.max(1,numeric(profile.value?.crewMax)??numeric(props.ship.values.crewMax)??20));
const capacity=computed(()=>Math.max(0,crew.value-1-reserve.value));
const stations=computed(()=>profile.value?.stations||[]);
const pilotStations=computed(()=>stations.value.filter(s=>linked.value.includes(s.id)&&canPilotControl(s,props.data?.patch)).map(s=>s.id));
const unverifiedPilotStations=computed(()=>stations.value.filter(s=>pilotStations.value.includes(s.id)&&pilotControlState(s,props.data?.patch)==='known'));
const controlLabel=s=>({known:'Возможность известна · в текущем LIVE не проверена',verified:'Проверено в текущем LIVE',unavailable:'В текущем LIVE не работает',unknown:'Возможность управления пилотом неизвестна'})[pilotControlState(s,props.data?.patch)];
const independent=computed(()=>stations.value.filter(s=>!pilotStations.value.includes(s.id)));
const loadout=computed(()=>activeLoadout(profile.value,crew.value,reserve.value,selected.value,pilotStations.value,props.data?.patch));
const valid=computed(()=>currentData(props.data)&&profile.value?.status==='flight-ready'&&!profile.value?.ground);
const assessments=computed(()=>threats.map(t=>({...t,...assessThreat(t,profile.value,loadout.value,props.data)})));
const weapons=computed(()=>props.data?.weapons||[]);
const weaponThreats=w=>threats.filter(t=>t.guns.includes(w.name));
const damageBonus=computed(()=>Math.max(0,Math.min(100,Number(bonus.value)||0)));
const rows=computed(()=>weapons.value.filter(w=>group.value==='all'||threats.find(t=>t.id===group.value)?.guns.includes(w.name)).map(w=>({...w,...(valid.value?armorCheck(profile.value,w,damageBonus.value):{state:'unknown',label:'Нет данных LIVE',channels:[]})})));
const preview=computed(()=>weapons.value.filter(w=>/^(AD4B|AD5B|C-788)/.test(w.name)).map(w=>({...w,...(valid.value?armorCheck(profile.value,w,damageBonus.value):{state:'unknown',label:'Нет данных LIVE'})})));
const n=v=>numeric(v)===null?'—':v.toLocaleString('ru-RU',{maximumFractionDigits:2});
const sizes=guns=>Object.entries(guns.reduce((a,g)=>{const key=g.size?'S'+g.size:'S?';a[key]=(a[key]||0)+1;return a},{})).map(([s,c])=>`${c} × ${s}`).join(' · ')||'нет';
function clampCrew(){crew.value=Math.min(maxCrew.value,Math.max(1,Math.floor(Number(crew.value)||1)));reserve.value=Math.min(Math.max(0,Math.floor(Number(reserve.value)||0)),crew.value-1)}
watch([crew,reserve],()=>{clampCrew();selected.value=selected.value.filter(id=>independent.value.some(s=>s.id===id)).slice(0,capacity.value)});
watch(()=>props.ship.id,()=>{crew.value=1;reserve.value=0;selected.value=[];linked.value=[];tab.value='threats';group.value='all';bonus.value=0},{immediate:true});
function setCrew(value){crew.value=value;clampCrew();selected.value=defaultStations({...profile.value,stations:independent.value},crew.value,reserve.value)}
function setLinked(id,checked){if(!canPilotControl(stations.value.find(s=>s.id===id),props.data?.patch))return;linked.value=checked?[...linked.value,id]:linked.value.filter(x=>x!==id);selected.value=selected.value.filter(x=>x!==id)}
function checkStation(id,checked){selected.value=checked?[...selected.value,id].slice(0,capacity.value):selected.value.filter(x=>x!==id)}
</script>
<template>
 <section class="pvp-panel" aria-label="PvP-профиль корабля">
  <header class="pvp-heading"><div><div class="eyebrow">БОЕВОЙ ПРОФИЛЬ</div><h3>Кого сможете встретить</h3></div><span class="pvp-patch">{{data?.patch||'Патч не подтверждён'}}</span></header>
  <p class="pvp-intro">Оценка условий для боя со штатными пушками. Экипаж, занятые турели и тип противника учитываются отдельно. Это не вероятность победы.</p>
  <div class="pvp-crew"><span>На борту</span><div class="pvp-segments"><button v-for="count in [1,2,3]" :key="count" :disabled="count>maxCrew" :class="{active:crew===count}" :aria-pressed="crew===count" @click="setCrew(count)">{{count}} {{count===1?'человек':'человека'}}</button></div><label v-if="maxCrew>3" class="pvp-other-crew">Другое число <input type="number" min="1" :max="maxCrew" v-model="crew" @change="setCrew(Number(crew))" aria-label="Число членов экипажа"></label></div>
  <p v-if="crew<(profile?.crewMin||0)" class="pvp-note">Ниже заявленного минимума экипажа ({{profile.crewMin}}). Оценка огневых постов не подтверждает возможность полноценно обслуживать корабль.</p>
  <details class="pvp-stations"><summary>Боевые посты · активные орудия: {{loadout.guns.length}} · занятые турели: {{loadout.turrets.length}}</summary>
   <div class="pvp-station-content">
    <label>На инженерии и других задачах <input type="number" min="0" :max="crew-1" v-model="reserve" aria-label="Экипаж вне боевых постов"></label>
    <p>Один человек пилотирует. Остальные занимают выбранные турели: один стрелок на пост. Автоматическая оборона и ракеты не добавляют баллы.</p>
    <p>Орудия вне отдельных турелей: <b>{{sizes(profile?.pilot||[])}}</b>.</p>
    <div v-for="s in stations" :key="s.id" class="pvp-station">
     <label><input type="checkbox" :checked="pilotStations.includes(s.id)||selected.includes(s.id)" :disabled="pilotStations.includes(s.id)||(!selected.includes(s.id)&&selected.length>=capacity)" @change="checkStation(s.id,$event.target.checked)"><span>{{s.label}} <b>{{sizes(s.guns)}}</b></span></label>
     <div v-if="s.kind==='remote'" class="pvp-pilot-control"><label class="pvp-link"><input type="checkbox" :checked="pilotStations.includes(s.id)" :disabled="!canPilotControl(s,data?.patch)" @change="setLinked(s.id,$event.target.checked)"><span>Управляется пилотом</span></label><small class="pvp-control-status" :class="pilotControlState(s,data?.patch)">{{controlLabel(s)}}</small><template v-if="s.pilotControl"><a :href="s.pilotControl.source" target="_blank" rel="noopener noreferrer">Источник возможности{{s.pilotControl.sourcePatch?' · '+s.pilotControl.sourcePatch:''}} ↗</a><small v-if="s.pilotControl.note" class="pvp-control-note">{{s.pilotControl.note}}</small><a v-if="['verified','unavailable'].includes(pilotControlState(s,data?.patch))" :href="s.pilotControl.liveCheck.source" target="_blank" rel="noopener noreferrer">Проверка {{s.pilotControl.liveCheck.patch}} ↗</a></template></div>
    </div>
    <p v-if="!stations.length">Отдельных вооружённых турелей в снимке нет. Дополнительный человек не увеличивает число орудий.</p>
    <p v-if="loadout.unused">Не назначены на огневые посты: {{loadout.unused}}. Они не повышают оценку огня.</p>
    <p>Галочка доступна, если управление пилотом описано в источнике. Проверка работы в текущем LIVE указана отдельно. Без источника возможность остаётся неизвестной. Для назначения отдельного стрелка снимите галочку справа и выберите турель слева.</p>
   </div>
  </details>
  <p v-if="unverifiedPilotStations.length" class="pvp-control-caveat" role="status">В расчёт включены турели с известным управлением пилотом: {{unverifiedPilotStations.map(s=>s.label).join(', ')}}. Их работа в текущем LIVE не проверена; оценка предполагает, что эта возможность работает.</p>
  <div class="pvp-armor-preview" aria-label="Краткая проверка брони"><button v-for="w in preview" :key="w.id" @click="tab='armor'" :class="w.state"><span>{{w.name.replace(' Ballistic Gatling','').replace(' Cannon','')}}<small>{{weaponDescription(w)}}</small></span><b>{{w.label}}</b><span class="pvp-preview-threats">Сценарии: {{weaponThreats(w).map(t=>t.name).join(' · ')}}</span></button></div>
  <p class="pvp-note">Проверка порога: целая броня корпуса, без щитов, обычное попадание{{damageBonus?`, урон +${damageBonus}%`:''}}. Это не неуязвимость: слабые места и износ брони считаются иначе.</p>
  <nav class="pvp-tabs" aria-label="Боевой анализ"><button :class="{active:tab==='threats'}" :aria-pressed="tab==='threats'" @click="tab='threats'">Противники</button><button :class="{active:tab==='armor'}" :aria-pressed="tab==='armor'" @click="tab='armor'">Броня против пушек</button></nav>
  <div v-if="tab==='threats'" class="pvp-threat-grid">
   <article v-for="t in assessments" :key="t.id" class="pvp-threat" :class="t.level" :data-threat="t.id"><div class="pvp-threat-top"><h4>{{t.name}}</h4><span>{{t.example}}</span></div><strong>{{t.title}}</strong><details><summary>Почему так</summary><ul><li v-for="reason in t.reasons" :key="reason">{{reason}}</li></ul><p>{{t.loadout}}</p><a :href="t.source" target="_blank" rel="noopener noreferrer">Наблюдения и сборки игроков ↗</a></details></article>
  </div>
  <div v-else class="pvp-armor-detail">
   <div class="pvp-armor-controls"><label>Противник<select v-model="group" aria-label="Пушки группы противников"><option value="all">Все контрольные пушки</option><option v-for="t in threats.filter(t=>t.guns.length)" :key="t.id" :value="t.id">{{t.name}}</option></select></label><label>Прибавка к урону, %<input type="number" min="0" max="100" step="1" v-model="bonus" @change="bonus=Math.max(0,Math.min(100,Number(bonus)||0))" aria-label="Прибавка к урону оружия"></label></div>
   <p class="pvp-note">Типы противников показывают, в каких сценариях мы проверяем эту пушку. Это возможные варианты вооружения, а не подтверждение сборки каждого встречного корабля. Базовые пушки — без улучшений. Прибавку от крафта задайте вручную. Несколько пушек и скорострельность не складываются для прохождения порога одного снаряда.</p>
   <div class="pvp-armor-thresholds"><span>Физический порог <b>{{n(threshold(profile?.armorPhysical))}}</b></span><span>Энергетический порог <b>{{n(threshold(profile?.armorEnergy))}}</b></span></div>
   <div class="pvp-armor-scroll"><table class="pvp-armor-table"><thead><tr><th>Орудие</th><th>Тип противника / примеры</th><th>Урон снаряда / порог</th><th>Результат</th></tr></thead><tbody><tr v-for="w in rows" :key="w.id" :data-weapon="w.name"><td><a v-if="w.source" :href="w.source" target="_blank" rel="noopener noreferrer">{{w.name}} ↗</a><span v-else>{{w.name}}</span><small>{{weaponDescription(w)}}</small></td><td class="pvp-weapon-threats"><span v-for="t in weaponThreats(w)" :key="t.id"><b>{{t.name}}</b><small>{{t.example}}</small></span></td><td><span v-for="c in w.channels" :key="c.type">{{n(c.hit)}} / {{n(c.limit)}}<small>{{c.type==='physical'?'Физический':'Энергетический'}}</small></span><span v-if="!w.channels.length">—</span></td><td><span class="pvp-status" :class="w.state">{{w.label}}</span></td></tr></tbody></table></div>
   <p class="pvp-note">«Броня не остановит снаряд» означает, что урон одного снаряда выше порога целой брони корпуса. Это не гарантирует поражение компонента или уничтожение корабля. «Целая броня блокирует снаряд» относится только к целому корпусу без слабых мест. На точном равенстве показываем «На границе».</p>
  </div>
  <details class="pvp-method"><summary>Как читать оценку · источники и ограничения</summary><p>Обзор угроз проверен {{REVIEW_DATE}} для 4.10.2 LIVE. Это сообщения игроков, а не статистика встреч или результаты турнира. Контрольные пушки показывают возможные угрозы, а не единственный лодаут группы.</p><p>Условия для боя: хотя бы одно активное орудие проходит порог корпуса эталона, а обе скорости разворота составляют не менее 85% от эталона. Это условный порог интерфейса. Занятая турель с подходящей пушкой даёт отдельную оценку обороны. Для M80 отдельно сравнивается скорость форсажа SCM.</p><p>Не рассчитаны навык пилотов, точность, сектора турелей, дистанция обнаружения, длительность форсажа, распределение питания, ракеты, щиты в момент попадания и урон по слабым местам. Орудия считаются штатными; смена экипажа не меняет оружие.</p><p>Сравнение брони использует урон одного снаряда и соответствующий физический или энергетический deflection целого корпуса. Неизвестные и неоднозначные значения не заменяются нулём. Изношенная броня может пропускать меньшие снаряды; для турелей и двигателей действуют отдельные модификаторы.</p><a :href="sources.armor" target="_blank" rel="noopener noreferrer">CIG: принцип работы deflection и слабые места ↗</a><p>Снимок характеристик: {{data?.fetchedAt||'неизвестно'}} · {{data?.patch||'версия не подтверждена'}}. При смене патча набор угроз требует повторной проверки.</p></details>
 </section>
</template>
