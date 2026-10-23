<script setup>
import {computed,ref,watch} from 'vue';
const props=defineProps({value:null,format:Function});
const expanded=ref(false);
const items=computed(()=>Array.isArray(props.value)?[...new Set(props.value)]:[props.value]);
const full=computed(()=>props.format(props.value));
const long=computed(()=>items.value.length>3||full.value.length>180);
const preview=computed(()=>{const s=props.format(items.value.slice(0,3));return s.length>180?s.slice(0,177)+'…':s});
watch(()=>props.value,()=>expanded.value=false);
</script>
<template><span class="field-value"><span>{{!long||expanded?full:preview}}</span><button v-if="long" class="value-expand" type="button" :aria-expanded="expanded" @click="expanded=!expanded">{{expanded?'Свернуть':items.length>3?'Показать все ('+items.length+')':'Развернуть'}}</button></span></template>
