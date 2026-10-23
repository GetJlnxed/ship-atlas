<script setup>
import {computed,ref,nextTick,onMounted,onUnmounted,useId,watch} from 'vue';
const props=defineProps({modelValue:[String,Number],options:{type:Array,default:()=>[]},label:String,placeholder:{type:String,default:'Выберите…'},allowCustom:Boolean});
const emit=defineEmits(['update:modelValue','change']);
const open=ref(false),query=ref(''),active=ref(0),root=ref(null),search=ref(null),trigger=ref(null),list=ref(null),id=useId();
const selected=computed(()=>props.options.find(o=>String(o.value)===String(props.modelValue)));
const matches=computed(()=>{const words=query.value.toLocaleLowerCase('ru').trim().split(/\s+/).filter(Boolean);return props.options.filter(o=>words.every(w=>`${o.label} ${o.group||''} ${o.search||''}`.toLocaleLowerCase('ru').includes(w)))});
const visible=computed(()=>matches.value.slice(0,80));
watch(query,()=>active.value=0);
async function show(){query.value='';active.value=0;open.value=true;await nextTick();search.value?.focus()}
function close(focus=false){open.value=false;if(focus)trigger.value?.focus()}
function choose(value){emit('update:modelValue',value);emit('change',value);close(true)}
async function move(step){active.value=Math.max(0,Math.min(visible.value.length-1,active.value+step));await nextTick();list.value?.children[active.value]?.scrollIntoView?.({block:'nearest'})}
function enter(){if(visible.value[active.value])choose(visible.value[active.value].value);else if(props.allowCustom)choose(query.value)}
function outside(e){if(!root.value?.contains(e.target))close()}
onMounted(()=>document.addEventListener('pointerdown',outside));
onUnmounted(()=>document.removeEventListener('pointerdown',outside));
</script>
<template>
 <div ref="root" class="search-select" @keydown.esc.stop.prevent="close(true)" @focusout="!$el.contains($event.relatedTarget)&&close()">
  <button ref="trigger" class="search-select-trigger" type="button" :value="modelValue" :aria-label="label" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="id" @click="open?close():show()" @keydown.down.prevent="show()"><span>{{selected?.label||modelValue||placeholder}}</span><span aria-hidden="true">⌄</span></button>
  <div v-if="open" class="search-select-popup">
   <input ref="search" v-model="query" type="search" role="combobox" :aria-label="'Поиск: '+label" :aria-controls="id" aria-expanded="true" aria-autocomplete="list" :aria-activedescendant="visible.length?id+'-'+active:undefined" placeholder="Начните вводить…" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="enter()">
   <div :id="id" ref="list" role="listbox" :aria-label="label" class="search-select-results">
    <button v-for="(o,i) in visible" :id="id+'-'+i" :key="o.value" type="button" role="option" :aria-selected="String(o.value)===String(modelValue)" :class="{highlighted:i===active}" @pointerdown.prevent @click="choose(o.value)"><span>{{o.label}}</span><small v-if="o.group">{{o.group}}</small></button>
   </div>
   <p v-if="!matches.length" class="search-select-note">Ничего не найдено</p>
   <p v-else-if="matches.length>80" class="search-select-note">Первые 80 из {{matches.length}}. Уточните поиск.</p>
   <button v-if="allowCustom" type="button" class="search-select-custom" @pointerdown.prevent @click="choose(query)">{{query?'Использовать «'+query+'»':'Очистить значение'}}</button>
  </div>
 </div>
</template>
