<script setup>
import {computed,ref} from 'vue';
import ShipPvp from './ShipPvp.vue';
import {threats,REVIEW_DATE,sources,currentData,threshold,armorCheck,weaponDescription,activeLoadout,assessThreat} from './pvp.js';
const props=defineProps({ships:Array,data:Object});
const crew=ref(1),bonus=ref(0),group=ref('all'),section=ref('threats'),configs=ref({});
const crewCount=computed(()=>Math.min(100,Math.max(1,Math.floor(Number(crew.value)||1))));
const damageBonus=computed(()=>Math.min(100,Math.max(0,Number(bonus.value)||0)));
const profile=s=>props.data?.profiles?.[s.id];
const loadout=s=>configs.value[s.id]?.loadout||activeLoadout(profile(s));
const selectedThreats=computed(()=>threats.filter(t=>group.value==='all'||t.id===group.value));
const rows=computed(()=>selectedThreats.value.map(t=>({...t,cells:props.ships.map(s=>assessThreat(t,profile(s),loadout(s),props.data,damageBonus.value))})));
const weapons=computed(()=>(props.data?.weapons||[]).filter(w=>selectedThreats.value.some(t=>t.guns.includes(w.name))).map(w=>({...w,groups:threats.filter(t=>t.guns.includes(w.name)),cells:props.ships.map(s=>currentData(props.data)&&profile(s)?.status==='flight-ready'&&!profile(s)?.ground?armorCheck(profile(s),w,damageBonus.value):{state:'unknown',label:'Нет данных LIVE',channels:[]})})));
const n=value=>value===null||value===undefined?'—':value.toLocaleString('ru-RU',{maximumFractionDigits:2});
</script>
<template>
 <section class="pvp-comparison" aria-label="Сравнение PvP и брони">
  <div class="pvp-compare-intro"><p>Одинаковые противники и оружие для всех кораблей. Оценка использует штатное вооружение и выбранные боевые посты, а не вероятность победы.</p><span class="pvp-patch">{{data?.patch||'Нет версии данных'}}</span></div>
  <div class="pvp-compare-controls">
   <label>Ваша команда, чел.<input type="number" v-model="crew" min="1" max="100" step="1" aria-label="Экипаж для сравнения" @change="crew=crewCount"></label>
   <label>Тип противника<select v-model="group" aria-label="Противник для сравнения"><option value="all">Все группы</option><option v-for="t in threats" :key="t.id" :value="t.id">{{t.name}}</option></select></label>
   <label>Урон противника, +%<input type="number" v-model="bonus" min="0" max="100" aria-label="Прибавка урона для сравнения" @change="bonus=damageBonus"></label>
  </div>
  <p class="pvp-note">Один человек — пилот, остальные по умолчанию занимают турели с наибольшим числом орудий. Если команда больше вместимости корабля, учитываются только места на борту. Назначения можно изменить под названием каждого корабля. Управление турелями пилотом включается отдельно.</p>
  <nav class="pvp-tabs" aria-label="Раздел PvP-сравнения"><button :class="{active:section==='threats'}" :aria-pressed="section==='threats'" @click="section='threats'">Прогнозы по противникам</button><button :class="{active:section==='armor'}" :aria-pressed="section==='armor'" @click="section='armor'">Броня против оружия</button></nav>
  <div class="comparison-scroll pvp-comparison-scroll"><table class="comparison-table pvp-comparison-table">
   <thead><tr><th>{{section==='threats'?'С кем столкнётесь':'Что попадает в корпус'}}<small>{{section==='threats'?'Условия для боя и ответного огня':'Урон одного снаряда / порог брони'}}</small></th><th v-for="s in ships" :key="s.id"><strong>{{s.name}}</strong><small>{{s.values.manufacturer}}</small></th></tr></thead>
   <tbody>
    <tr class="pvp-config-row"><th>Экипаж и посты<small>Настройка каждого корабля</small></th><td v-for="s in ships" :key="s.id" :data-crew-ship="s.id"><ShipPvp :ship="s" :data="data" :requested-crew="crewCount" controls-only @configuration="configs[s.id]=$event" /></td></tr>
    <template v-if="section==='threats'"><tr v-for="t in rows" :key="t.id" :data-threat="t.id"><th>{{t.name}}<small>{{t.example}}</small><details><summary>О сценарии</summary><p>{{t.loadout}}</p><a :href="t.source" target="_blank" rel="noopener noreferrer">Источник ↗</a></details></th><td v-for="(cell,i) in t.cells" :key="ships[i].id" :data-ship="ships[i].id"><strong class="pvp-verdict" :class="cell.level">{{cell.title}}</strong><details><summary>Почему так</summary><ul><li v-for="reason in cell.reasons" :key="reason">{{reason}}</li></ul></details></td></tr></template>
    <template v-else>
     <tr><th>Deflection корпуса<small>Физический / энергетический</small></th><td v-for="s in ships" :key="s.id">{{n(threshold(profile(s)?.armorPhysical))}} / {{n(threshold(profile(s)?.armorEnergy))}}</td></tr>
     <tr v-for="w in weapons" :key="w.id" :data-weapon="w.name"><th><a :href="w.source" target="_blank" rel="noopener noreferrer">{{w.name}} ↗</a><small>{{weaponDescription(w)}}</small><small v-for="t in w.groups" :key="t.id">{{t.name}} · {{t.example}}</small></th><td v-for="(cell,i) in w.cells" :key="ships[i].id" :data-ship="ships[i].id"><strong class="pvp-verdict" :class="cell.state">{{cell.label}}</strong><small v-for="c in cell.channels" :key="c.type">{{c.type==='physical'?'Физический':'Энергетический'}}: {{n(c.hit)}} / {{n(c.limit)}}</small></td></tr>
     <tr v-if="!weapons.length"><td :colspan="ships.length+1">Для этой группы контрольные пушки не заданы. Смотрите прогноз блокировки ухода.</td></tr>
    </template>
   </tbody>
  </table></div>
  <p class="pvp-note">Целая броня корпуса, без щитов и слабых мест. Прохождение порога не гарантирует поражение компонента. Прибавка к урону применяется только к пушкам противника; число пушек не складывается в один снаряд. Неизвестные значения остаются неизвестными.</p>
  <details class="pvp-method"><summary>Источники и ограничения</summary><p>Набор угроз проверен {{REVIEW_DATE}}. Снимок: {{data?.fetchedAt||'неизвестно'}}. Это сценарии по наблюдениям игроков, а не статистика встреч. Для другого патча оценка отключается.</p><p>Манёвренность сравнивается с эталоном группы (порог 85%), огонь — с deflection его корпуса. Турель учитывается только с назначенным стрелком или известной возможностью управления пилотом. Навык, точность, сектора огня, щиты, ракеты и время уничтожения не моделируются.</p><a :href="sources.armor" target="_blank" rel="noopener noreferrer">CIG: deflection и слабые места ↗</a></details>
 </section>
</template>
