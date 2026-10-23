<script setup>
defineProps({modelValue:String});
defineEmits(['update:modelValue']);
</script>
<template>
  <label class="field-scope">Параметры
    <select :value="modelValue" @change="$emit('update:modelValue',$event.target.value)" aria-label="Уровень параметров">
      <option value="standard">Основные</option>
      <option value="advanced">Расширенные</option>
      <option value="technical">Все, включая служебные</option>
    </select>
  </label>
</template>
