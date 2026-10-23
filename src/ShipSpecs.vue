<script setup>
import {computed,ref,watch} from 'vue';
import FieldValue from './FieldValue.vue';
import FieldScope from './FieldScope.vue';
import ShipPvp from './ShipPvp.vue';
import {fieldVisible} from './field-presentation.js';
import {isMissing} from './engine.js';
import {fieldSearchText} from './catalog-quality.js';
const props=defineProps({ship:Object,fields:Array,format:Function,sourceName:Function,pvp:Object});
defineEmits(['add']);
const section=ref('overview'),group=ref(''),search=ref(''),scope=ref('standard'),page=ref(1);
const sections=[{id:'flight',label:'Полёт',icon:'↗',hint:'Скорость, манёвренность, двигатели'},
 {id:'cargo',label:'Груз и габариты',icon:'▱',hint:'Отсеки, размеры и масса'},
 {id:'combat',label:'Вооружение и защита',icon:'⌖',hint:'Орудия, ракеты, щиты и броня'},
 {id:'systems',label:'Системы',icon:'◈',hint:'Топливо, энергия и оборудование'},
 {id:'general',label:'Общие данные',icon:'≡',hint:'Экипаж, доступность и источники'}];
const summaryKeys=['cargo','crewMin','length','scm','speed','shieldTotal','gunCount','price'];
function category(f){
 const key=f.key.toLowerCase();
 if(['cargo','length','beam','height','mass'].includes(key)||/cargo|metrics\.(length|beam|height|mass)|storagecontainer/.test(key))return 'cargo';
 if(['scm','speed','pitch','yaw','roll'].includes(key)||/speeds|thruster|flightcontroller|quantumdrive|quantum_drive|scm_speed|afterburner|acceleration|pitch_max|yaw_max|roll_max/.test(key))return 'flight';
 if(['hull','gunCount','gunMaxSize','missileCount','shieldCount','shieldTotal','armorTotal'].includes(f.key)||/weapon|missile|shield|armor|bomb|turret|hullhealth|hullparts|hulldoors/.test(key))return 'combat';
 if(['hydrogen','quantum'].includes(key)||/^game\.|fuel|power|cooler|radar|life_support/.test(key))return 'systems';
 return 'general';
}
const known=computed(()=>props.fields.filter(f=>!isMissing(props.ship.values[f.key])));
const allowed=computed(()=>known.value.filter(f=>fieldVisible(f,scope.value)));
const summary=computed(()=>summaryKeys.map(key=>known.value.find(f=>f.key===key)).filter(Boolean));
const deflection=computed(()=>['game.Armor[].typeData.deflectionEnergy','game.Armor[].typeData.deflectionPhysical'].map(key=>props.fields.find(f=>f.key===key)).filter(Boolean));
const summaryValue=f=>f.key==='price'&&props.ship.values.price>=1e6?(props.ship.values.price/1e6).toLocaleString('ru-RU',{maximumFractionDigits:1})+' млн':props.format(props.ship.values[f.key]);
const counts=computed(()=>Object.fromEntries(sections.map(s=>[s.id,allowed.value.filter(f=>category(f)===s.id).length])));
const searching=computed(()=>!!search.value.trim());
const sectionFields=computed(()=>allowed.value.filter(f=>searching.value?fieldSearchText(f).includes(search.value.toLowerCase().trim()):category(f)===section.value));
const groups=computed(()=>[...new Set(sectionFields.value.map(f=>f.group))].map(name=>({name,count:sectionFields.value.filter(f=>f.group===name).length})));
const activeGroup=computed(()=>groups.value.some(g=>g.name===group.value)?group.value:groups.value[0]?.name);
const rows=computed(()=>searching.value?sectionFields.value:sectionFields.value.filter(f=>f.group===activeGroup.value));
const pageCount=computed(()=>Math.max(1,Math.ceil(rows.value.length/12)));
const visible=computed(()=>rows.value.slice((page.value-1)*12,page.value*12));
watch([section,group,search,scope],()=>page.value=1);
function navigate(id){section.value=id;group.value='';search.value=''}
</script>
<template>
 <section class="ship-specs-browser" aria-label="Характеристики корабля">
  <div class="specs-header"><div><div class="eyebrow">ПАСПОРТ КОРАБЛЯ</div><h3>Всё важное — по разделам</h3></div><span>{{known.length}} характеристик</span></div>
  <div class="field-search specs-search"><input v-model="search" type="search" placeholder="Найти характеристику во всех разделах…" aria-label="Поиск характеристик корабля"><FieldScope v-model="scope" /></div>
  <nav class="specs-tabs" aria-label="Разделы характеристик"><button :class="{active:section==='overview'&&!searching}" @click="navigate('overview')">Обзор</button><button v-for="s in sections" :key="s.id" :class="{active:section===s.id&&!searching}" @click="navigate(s.id)">{{s.label}} <span>{{counts[s.id]}}</span></button></nav>
  <template v-if="section==='overview'&&!searching">
   <div class="specs-summary"><button v-for="f in summary" :key="f.key" @click="$emit('add',f)" :aria-label="'Фильтр '+f.label"><span>{{f.label}}</span><strong>{{summaryValue(f)}} <small>{{f.unit}}</small></strong><span class="summary-plus">＋</span></button></div>
   <div v-if="deflection.length" class="deflection-overview"><h3>Броня · Deflection</h3><div class="specs-summary deflection-summary"><button v-for="f in deflection" :key="f.key" :data-field="f.key" @click="$emit('add',f)" :aria-label="'Фильтр '+f.label"><span>{{f.label.replace('Deflection · ','')}}</span><strong>{{format(ship.values[f.key])}} <small>{{f.unit}}</small></strong><span class="summary-plus">＋</span></button></div></div>
   <ShipPvp :ship="ship" :data="pvp" />
   <p class="specs-tip">Нажмите на показатель, чтобы добавить его в воронку. Подробности — в разделах ниже.</p>
   <div class="specs-sections"><button v-for="s in sections" :key="s.id" @click="navigate(s.id)"><span class="section-symbol">{{s.icon}}</span><div><b>{{s.label}}</b><small>{{s.hint}}</small></div><span>{{counts[s.id]}} →</span></button></div>
  </template>
  <div v-else class="specs-workspace" :class="{'is-searching':searching}">
   <aside v-if="!searching&&groups.length" class="specs-group-nav" aria-label="Группы характеристик"><button v-for="g in groups" :key="g.name" :class="{active:activeGroup===g.name}" @click="group=g.name">{{g.name.replace(/^(Игровое оборудование|FleetYards|RSI) · /,'')}}<small>{{g.count}}</small></button></aside>
   <div class="specs-results"><div class="specs-results-title"><h3>{{searching?'Результаты поиска':activeGroup||'Нет данных'}}</h3><span>{{rows.length}}</span></div>
    <p class="specs-tip" v-if="rows.length">＋ — добавить условие. Несколько значений относятся к разным штатным компонентам.</p>
    <div class="spec-group"><div v-for="f in visible" :key="f.key" class="spec-row"><div>{{f.label}}<small v-if="searching">{{f.group}}</small><small v-if="scope==='technical'">{{f.key}}</small><small v-if="f.note" class="field-note">{{f.note}}</small></div><strong><FieldValue :value="ship.values[f.key]" :format="format" /> <small>{{f.unit}}</small><em>{{sourceName(ship,f.key)}}</em></strong><button class="icon-button" :aria-label="'Фильтр '+f.label" @click="$emit('add',f)">＋</button></div></div>
    <div v-if="!rows.length" class="field-empty"><p>На выбранном уровне характеристик нет.</p><button v-if="scope!=='technical'" class="text-button" @click="scope='technical'">Проверить все уровни →</button></div>
    <div v-if="pageCount>1" class="specs-pagination"><span>{{(page-1)*12+1}}–{{Math.min(page*12,rows.length)}} из {{rows.length}}</span><button :disabled="page===1" @click="page--" aria-label="Предыдущие характеристики">←</button><span>{{page}} / {{pageCount}}</span><button :disabled="page===pageCount" @click="page++" aria-label="Следующие характеристики">→</button></div>
   </div>
  </div>
 </section>
</template>
