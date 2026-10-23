<script setup>
defineProps({values:Object,format:Function});
</script>
<template>
 <section class="card-deflection" aria-label="Броня: deflection" title="Порог deflection целой брони для одного попадания, без щитов. Несколько значений — разные штатные компоненты; прочерк — нет данных.">
  <span class="card-stat-title">Броня · Deflection</span>
  <div><span><small>Физический</small><b>{{format(values['game.Armor[].typeData.deflectionPhysical'])}}</b></span><span><small>Энергетический</small><b>{{format(values['game.Armor[].typeData.deflectionEnergy'])}}</b></span></div>
 </section>
</template>
