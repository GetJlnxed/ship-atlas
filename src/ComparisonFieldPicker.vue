<script setup>
import {computed,ref} from 'vue';
import FieldScope from './FieldScope.vue';
import {fieldSearchText} from './catalog-quality.js';
import {fieldVisible} from './field-presentation.js';
const props=defineProps({fields:Array,modelValue:Array,defaults:Array});
const emit=defineEmits(['update:modelValue']);
const opened=ref(false),search=ref(''),scope=ref('standard'),selectedOnly=ref(false);
const chosen=computed(()=>new Set(props.modelValue));
const available=computed(()=>props.fields.filter(f=>(selectedOnly.value?chosen.value.has(f.key):fieldVisible(f,scope.value))&&(!search.value||fieldSearchText(f).includes(search.value.toLowerCase().trim()))));
const groups=computed(()=>{
 const map=new Map();
 for(const f of available.value){if(!map.has(f.group))map.set(f.group,[]);map.get(f.group).push(f)}
 return [...map].map(([name,fields])=>({name,fields,count:fields.filter(f=>chosen.value.has(f.key)).length}));
});
function selectFields(fields,checked){const next=new Set(props.modelValue);for(const f of fields)checked?next.add(f.key):next.delete(f.key);emit('update:modelValue',[...next])}
</script>
<template>
 <div class="comparison-picker">
  <button class="outline-button" :aria-expanded="opened" aria-controls="comparison-field-options" @click="opened=!opened">☷ Выбрать характеристики <span>{{modelValue.length}}</span><span>{{opened?'−':'＋'}}</span></button>
  <Transition name="picker">
   <section v-if="opened" id="comparison-field-options" class="comparison-field-options" aria-label="Выбор характеристик для сравнения">
    <div class="picker-heading"><div><h3>Что сравниваем?</h3><p>Отметьте нужные строки. Выбор сохраняется в этом браузере.</p></div><button class="icon-button" aria-label="Закрыть выбор характеристик" @click="opened=false">×</button></div>
    <div class="picker-search"><input v-model="search" type="search" placeholder="Найти: груз, щиты, скорость…" aria-label="Найти характеристику для выбора"><FieldScope v-if="!selectedOnly" v-model="scope" /><label class="check-row"><input v-model="selectedOnly" type="checkbox">Только выбранные</label></div>
    <div class="picker-actions"><button class="text-button" @click="emit('update:modelValue',[...defaults])">Базовый набор</button><button class="text-button" :disabled="!available.length" @click="selectFields(available,true)">Выбрать найденные ({{available.length}})</button><button class="text-button" :disabled="!available.length" @click="selectFields(available,false)">Снять найденные</button><button class="text-button" :disabled="!modelValue.length" @click="emit('update:modelValue',[])">Очистить выбор</button></div>
    <div class="picker-groups">
     <details v-for="group in groups" :key="group.name" :open="!!search||selectedOnly||group.name==='Основное'" class="picker-group">
      <summary>{{group.name}}<span>{{group.count}} / {{group.fields.length}}</span></summary>
      <label class="check-row picker-group-toggle"><input type="checkbox" :checked="group.count===group.fields.length" :indeterminate="group.count>0&&group.count<group.fields.length" :aria-label="'Вся группа '+group.name" @change="selectFields(group.fields,$event.target.checked)">Вся группа{{search?' (найденные)':''}}</label>
      <div class="picker-field-grid"><label v-for="f in group.fields" :key="f.key" class="picker-field" :class="{checked:chosen.has(f.key)}"><input type="checkbox" :checked="chosen.has(f.key)" :aria-label="'Сравнивать: '+f.label" :data-field="f.key" @change="selectFields([f],$event.target.checked)"><span>{{f.label}} <small v-if="f.unit">{{f.unit}}</small><small v-if="scope==='technical'" class="picker-field-path">{{f.key}}</small></span></label></div>
     </details>
     <p v-if="!available.length" class="field-empty">{{selectedOnly?'Нет выбранных характеристик по этому запросу.':'Ничего не найдено. Измените запрос или уровень параметров.'}}</p>
    </div>
    <div class="picker-footer"><span>Выбрано: <b>{{modelValue.length}}</b>. Поиск и уровень меняют только список выбора.</span><button class="primary-button" @click="opened=false">Готово</button></div>
   </section>
  </Transition>
 </div>
</template>
