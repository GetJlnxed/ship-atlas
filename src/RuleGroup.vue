<script setup>
import {computed} from 'vue';
import {operations} from './engine.js';
import SearchSelect from './SearchSelect.vue';
const props=defineProps({group:Object,fields:Array,showPaths:Boolean,depth:{type:Number,default:0}});
defineEmits(['remove']);
const fieldOptions=computed(()=>props.fields.map(f=>({value:f.key,label:f.label+(f.unit?' · '+f.unit:''),group:f.group,search:f.key})));
const valueOptions=k=>(field(k)?.values||[]).map(v=>({value:String(v),label:String(v)}));
const field=k=>props.fields.find(f=>f.key===k);
const add=()=>props.group.children.push({id:crypto.randomUUID(),field:'cargo',op:'gte',value:32,to:100,unknown:'exclude',quantifier:'any'});
const addGroup=()=>props.group.children.push({id:crypto.randomUUID(),mode:'or',children:[]});
function ops(k){let t=field(k)?.type;return Object.entries(operations).filter(([op])=>t==='number'?!['contains','notContains'].includes(op):t==='boolean'?['eq','neq','exists','missing'].includes(op):!['gt','gte','lt','lte','between'].includes(op))}
function changed(rule){rule.op=field(rule.field)?.type==='number'?'gte':'eq';rule.value=field(rule.field)?.type==='boolean'?'true':'';rule.to=''}
</script>
<template>
 <div class="rule-group" :class="{nested:depth>0}">
  <div class="group-head"><span class="branch-mark">{{depth?'↳':'⌘'}}</span><select v-model="group.mode" aria-label="Логика группы"><option value="and">И — все условия</option><option value="or">ИЛИ — любое условие</option><option value="not">НЕ — ни одного</option></select><span class="muted small">{{group.children.length}} условий</span><button v-if="depth" class="icon-button" aria-label="Удалить группу" @click="$emit('remove')">×</button></div>
  <p v-if="!group.children.length" class="rule-empty">Добавьте характеристику или вложенную группу.</p>
  <template v-for="(node,index) in group.children" :key="node.id">
   <RuleGroup v-if="node.children" :group="node" :fields="fields" :show-paths="showPaths" :depth="depth+1" @remove="group.children.splice(index,1)" />
   <div v-else class="rule-row">
    <div class="rule-line"><SearchSelect v-model="node.field" :options="fieldOptions" label="Характеристика" @change="changed(node)" />
    <select v-model="node.op" aria-label="Оператор"><option v-for="[key,label] in ops(node.field)" :value="key" :key="key">{{label}}</option></select>
    <template v-if="!['exists','missing'].includes(node.op)"><select v-if="field(node.field)?.type==='boolean'" v-model="node.value" aria-label="Значение"><option value="true">Да</option><option value="false">Нет</option></select><SearchSelect v-else-if="field(node.field)?.type==='text'&&!['in','notIn'].includes(node.op)" v-model="node.value" :options="valueOptions(node.field)" label="Значение" placeholder="Значение" allow-custom /><input v-else v-model="node.value" :type="field(node.field)?.type==='number'&&!['in','notIn'].includes(node.op)?'number':'text'" step="any" :placeholder="['in','notIn'].includes(node.op)?'A | B | C':'Значение'" aria-label="Значение"><input v-if="node.op==='between'" v-model="node.to" type="number" step="any" placeholder="До" aria-label="Верхняя граница"></template>
    <button class="icon-button" aria-label="Удалить условие" @click="group.children.splice(index,1)">×</button></div>
    <div class="rule-options"><span class="field-path">{{showPaths?node.field:field(node.field)?.group}}</span><label>Нет данных <select v-model="node.unknown" aria-label="Неизвестные значения"><option value="exclude">Исключить</option><option value="include">Включить</option><option value="only">Только неизвестные</option></select></label><label v-if="node.field.includes('[]')&&!['neq','notContains','notIn','exists','missing'].includes(node.op)">Элементы <select v-model="node.quantifier" aria-label="Проверка элементов"><option value="any">Хотя бы один</option><option value="all">Все</option><option value="none">Ни один</option></select></label></div>
   </div>
  </template>
  <div class="group-actions"><button class="text-button" @click="add">＋ Условие</button><button class="text-button" @click="addGroup">＋ Группа</button></div>
 </div>
</template>

