<script setup>
import {ref,computed,watch} from 'vue';
import FieldScope from './FieldScope.vue';
import {fieldVisible} from './field-presentation.js';
import {fieldSearchText} from './catalog-quality.js';
const props=defineProps({fields:Array,total:Number});
defineEmits(['add']);
const search=ref(''),scope=ref('standard'),group=ref(''),page=ref(1);
const allowed=computed(()=>props.fields.filter(f=>fieldVisible(f,scope.value)));
const groups=computed(()=>[...new Set(allowed.value.map(f=>f.group))]);
const found=computed(()=>allowed.value.filter(f=>(!group.value||f.group===group.value)&&fieldSearchText(f).includes(search.value.toLowerCase().trim())));
const pages=computed(()=>Math.max(1,Math.ceil(found.value.length/12)));
const visible=computed(()=>found.value.slice((page.value-1)*12,page.value*12));
watch([search,scope,group],()=>page.value=1);
watch(scope,()=>{if(!groups.value.includes(group.value))group.value=''});
</script>
<template>
 <div class="field-explorer">
  <div class="field-search"><input v-model="search" type="search" placeholder="Название или характеристика…" aria-label="Поиск всех полей"><FieldScope v-model="scope" /></div>
  <div class="explorer-toolbar"><select v-model="group" aria-label="Группа характеристик"><option value="">Все группы</option><option v-for="g in groups" :key="g" :value="g">{{g}}</option></select><span>Найдено: {{found.length}}</span></div>
  <div class="field-group"><button v-for="f in visible" :key="f.key" @click="$emit('add',f)"><div>{{f.label}} <small>{{f.unit}}</small><span>{{f.group}}</span><span v-if="scope==='technical'">{{f.key}}</span></div><small>{{f.coverage}} / {{total}}</small><b>＋</b></button></div>
  <p v-if="!found.length" class="field-empty">Нет характеристик по этому запросу. Измените группу, уровень или поисковую фразу.</p>
  <div v-if="pages>1" class="specs-pagination"><span>{{(page-1)*12+1}}–{{Math.min(page*12,found.length)}} из {{found.length}}</span><button :disabled="page===1" @click="page--" aria-label="Предыдущие поля">←</button><span>{{page}} / {{pages}}</span><button :disabled="page===pages" @click="page++" aria-label="Следующие поля">→</button></div>
 </div>
</template>
