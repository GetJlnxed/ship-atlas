<script setup>
import {computed} from 'vue';
import {shipRoleProfile} from './ship-roles.js';
const props=defineProps({ship:{type:Object,required:true},patch:String,expanded:Boolean});
const profile=computed(()=>shipRoleProfile(props.ship,props.patch));
</script>
<template>
 <component :is="expanded?'section':'span'" :class="expanded?'ship-role-details':'ship-role-overlay'" aria-label="Роли и мета корабля">
  <span class="ship-role-chips"><span v-for="role in profile.roles" :key="role" class="role-chip">{{role}}</span></span>
  <span class="meta-chip" :class="profile.status">{{profile.label}}</span>
  <template v-if="expanded">
   <p>{{profile.reason}}</p>
   <details class="role-evidence"><summary>Почему такие теги · источники</summary>
    <p>{{profile.roleNote}}</p>
    <p v-if="profile.reviewed">Обзор от 23.10.2026 · LIVE {{profile.patch}}<br>Условия: {{profile.context}} · {{profile.crew}}.</p>
    <p>Цвет — редакционная оценка для указанной задачи по отзывам игроков, а не статистика побед. Зелёный — сильный выбор в этой роли; красный — есть более подходящие альтернативы. Спорные и непроверенные варианты остаются нейтральными. Оснащение и опыт экипажа влияют на результат.</p>
    <ul v-if="profile.sources.length"><li v-for="source in profile.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noreferrer">{{source.label}} ↗</a></li></ul>
   </details>
  </template>
 </component>
</template>
<style scoped>
.ship-role-overlay{position:absolute;inset:auto 0 0;z-index:2;display:flex;align-items:flex-start;flex-direction:column;gap:6px;padding:30px 11px 11px;background:linear-gradient(transparent,rgba(5,13,17,.92));pointer-events:none}
.ship-role-chips{display:flex;gap:5px;flex-wrap:wrap;max-width:100%}
.role-chip,.meta-chip{display:inline-block;font-size:10px;font-weight:500;line-height:1.35;padding:4px 7px;border-radius:5px;letter-spacing:0;text-align:left;overflow-wrap:anywhere}
.role-chip{color:#f0f5f6;background:#182b35e8;border:1px solid #607b875c;backdrop-filter:blur(6px)}
.meta-chip{color:#c5d1d5;background:#23353eee;border:1px solid #66798280}
.meta-chip.meta{color:#dbffec;background:#17533fee;border-color:#4caa8070}
.meta-chip.offmeta{color:#ffe3df;background:#712f32ee;border-color:#df777b70}
.meta-chip.mixed{color:#e5dec9;background:#474131ee;border-color:#ada07b70}
.ship-role-details{margin:16px 0 22px;padding:16px;border:1px solid var(--line);border-radius:10px;background:#102027}
.ship-role-details>.meta-chip{margin-top:8px}
.ship-role-details>p{font-size:12px;line-height:1.7;color:#becfd4;margin:12px 0}
.role-evidence{font-size:11px;line-height:1.7;color:var(--muted)}
.role-evidence summary{cursor:pointer;color:var(--accent)}
.role-evidence a{color:var(--accent)}.role-evidence ul{padding-left:18px}.role-evidence li+li{margin-top:5px}
@media(max-width:430px){.role-chip,.meta-chip{font-size:11px}}
</style>
