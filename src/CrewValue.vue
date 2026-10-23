<script setup>
import {computed} from 'vue';
import {crewSummary} from './crew-summary.js';
const props=defineProps({values:Object,format:Function});
const crew=computed(()=>crewSummary(props.values));
</script>
<template>
 <span class="crew-value">
  <span :title="crew.minimumNote"><small>{{values.ground?'Мин. для езды':'Мин. для полёта'}}</small><b>{{format(crew.minimum)}}</b></span>
  <span :title="crew.maximumNote"><small>Макс. на борту</small><b class="crew-unknown">Неизвестно</b></span>
  <span :title="crew.recommendedNote"><small>Рек. · оценка</small><b>{{crew.recommended===null?'—':'≈ '+format(crew.recommended)}}</b></span>
 </span>
</template>
