<script setup>
import {computed} from 'vue';
import {acquisitionOptions,acquisitionSources} from './acquisition.js';
const props=defineProps({modelValue:{type:Array,default:()=>[]},counts:{type:Object,default:()=>({})}});
const emit=defineEmits(['update:modelValue']);
const summary=computed(()=>!props.modelValue.length?'Любой способ':props.modelValue.length===1?acquisitionOptions.find(o=>o.value===props.modelValue[0])?.label:`Выбрано: ${props.modelValue.length}`);
function toggle(value){emit('update:modelValue',props.modelValue.includes(value)?props.modelValue.filter(x=>x!==value):[...props.modelValue,value])}
</script>
<template>
 <div class="filter-section acquisition-filter">
  <span class="section-label" id="acquisition-label">Способ получения</span>
  <details>
   <summary class="acquisition-trigger" aria-labelledby="acquisition-label acquisition-summary"><span id="acquisition-summary">{{summary}}</span><span aria-hidden="true">⌄</span></summary>
   <div class="acquisition-options" role="group" aria-label="Способы получения">
    <label v-for="o in acquisitionOptions" :key="o.value" class="check-row" :title="o.note"><input type="checkbox" :value="o.value" :checked="modelValue.includes(o.value)" @change="toggle(o.value)"><span>{{o.label}}</span><small>{{counts[o.value]||0}}</small></label>
    <button v-if="modelValue.length" type="button" class="text-button" @click="emit('update:modelValue',[])">Очистить способы</button>
   </div>
  </details>
  <small class="acquisition-hint">Можно выбрать несколько — подойдёт любой из выбранных.</small>
  <details class="acquisition-help"><summary>Условия и источники</summary><p>Снимок на 23.10.2026. Наличие цены доната не означает продажу прямо сейчас. Награды могут отличаться от стандартной версии комплектацией и оформлением. Список способов может быть неполным.</p><p>Wikelo — обмен за материалы и репутацию. Pyro — наградная версия из ангара; она не равна одноимённой награде Concierge. Промо включает завершённые акции.</p><a :href="acquisitionSources.fleet" target="_blank" rel="noreferrer">Магазины и цены ↗</a> · <a :href="acquisitionSources.wikelo" target="_blank" rel="noreferrer">Wikelo ↗</a> · <a :href="acquisitionSources.pyro" target="_blank" rel="noreferrer">Pyro ↗</a></details>
 </div>
</template>
<style scoped>
.acquisition-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:6px;padding:12px;cursor:pointer;font-size:12px;background:#101c20;list-style:none}
.acquisition-trigger::-webkit-details-marker{display:none}.acquisition-trigger>span:first-child{min-width:0;overflow-wrap:anywhere}
.acquisition-options{padding:8px 0}.acquisition-options .check-row{min-height:40px}.acquisition-options .check-row>span{white-space:normal;line-height:1.5}.acquisition-options input{flex-shrink:0}
.acquisition-hint{display:block;font-size:10px;line-height:1.6;color:var(--muted);margin-top:9px}
.acquisition-help{font-size:10px;line-height:1.7;color:var(--muted);margin-top:8px}.acquisition-help summary{cursor:pointer}.acquisition-help a{color:var(--accent)}
</style>
