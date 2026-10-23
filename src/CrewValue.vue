<script setup>
defineProps({values:Object,format:Function});
const note='Рекомендуемый экипаж — заявленный максимальный экипаж из источника. Это ориентир полного состава: эффективность зависит от задачи и занятых постов.';
</script>
<template>
 <span class="crew-value" :title="note">
  <span><small>Мин.</small> <b>{{format(values.crewMin)}}</b></span>
  <span><small>Рек.</small> <b>{{format(values.crewMax)}}</b></span>
 </span>
</template>
