import {expandedReviews} from './role-review-data.js';
export const ROLE_REVIEW = {patch:'4.10.2-live.12913470',date:'2026-10-23',maxAgeDays:30};
export const roleReviews = expandedReviews;
const roleRules = [
 [/heavy fighter/i,'Тяжёлый истребитель'],[/medium fighter/i,'Средний истребитель'],[/light fighter/i,'Лёгкий истребитель'],[/snub fighter/i,'Снаб-истребитель'],[/stealth fighter/i,'Стелс-истребитель'],
 [/heavy bomber/i,'Тяжёлый бомбардировщик'],[/stealth bomber/i,'Стелс-бомбардировщик'],[/(?<!heavy |stealth )bomber/i,'Бомбардировщик'],
 [/interdiction/i,'Перехватчик'],[/heavy freight/i,'Тяжёлый грузовой'],[/(?<!heavy )freight|cargo|hauler/i,'Грузовой'],[/cargo loader/i,'Погрузчик'],
 [/gunship/i,'Канонерка'],[/dropship|military transport|boarding/i,'Десантный'],[/minelayer/i,'Минный заградитель'],[/anti-air/i,'ПВО'],
 [/ambulance|medical/i,'Медицинский'],[/mining|prospecting/i,'Добыча руды'],[/salvage|recovery/i,'Утилизация'],[/refin(?:ery|ing)/i,'Переработка'],[/refuel/i,'Заправщик'],[/repair/i,'Ремонтный'],[/construction/i,'Строительный'],
 [/expedition/i,'Экспедиционный'],[/exploration|pathfinder/i,'Исследовательский'],[/recon|intelligence/i,'Разведчик'],[/science/i,'Научный'],[/data/i,'Перевозка данных'],[/reporting/i,'Репортажный'],
 [/racing/i,'Гоночный'],[/luxury|touring/i,'Туристический'],[/passenger/i,'Пассажирский'],[/carrier/i,'Авианосец'],[/corvette/i,'Корвет'],[/frigate/i,'Фрегат'],[/destroyer/i,'Эсминец'],[/battlecruiser/i,'Линейный крейсер'],
 [/generalist|multi-role|modular/i,'Универсальный'],[/starter/i,'Стартовый'],[/patrol/i,'Патрульный'],[/combat support/i,'Боевая поддержка'],[/^combat$|^military$|^assault$/i,'Боевой'],[/^transport$/i,'Транспортный'],[/^stealth$/i,'Скрытный'],[/^industrial$/i,'Промышленный'],
];
export function catalogRoles(focus) {
 return [...new Set(roleRules.filter(([re])=>re.test(focus||'')).map(([,label])=>label))].slice(0,3);
}
export function shipRoleProfile(ship, patch, now = new Date()) {
 const v=ship?.values||{}, record=roleReviews[ship?.name];
 const age=(new Date(now).getTime()-Date.parse(ROLE_REVIEW.date+'T00:00:00Z'))/86400000;
 const current=patch===ROLE_REVIEW.patch&&Number.isFinite(age)&&age>=0&&age<=ROLE_REVIEW.maxAgeDays;
 const ready=v.status==='flight-ready';
 const reviewed=Boolean(record&&current&&ready);
 const status=reviewed?record.status:'unknown';
 const rated=reviewed&&status!=='unknown';
 const roles=reviewed?record.roles:catalogRoles(v.focus);
 const basis=reviewed?record.basis:null;
 const roleNote=basis==='players'?(rated?'Редакционная оценка по отзывам игроков для указанной задачи; не статистика побед и не утверждение о согласии всего сообщества.':'Отзывы игроков найдены и приведены ниже, но они пока не определяют место корабля в мете.'):basis==='edition'?'Специальная версия разобрана отдельно. Рейтинг базового корабля не переносится без проверки отличий.':reviewed?'Пока есть описание назначения и ограничений. Подборка отзывов для оценки меты этой модели ещё не завершена.':'Роли из каталога; актуальная практическая оценка отсутствует.';
 const label=!ready?'Мета не оценена':status==='meta'?`Мета · ${record.context}`:status==='offmeta'?`Не мета · ${record.context}`:status==='mixed'?`Спорный выбор · ${record.context}`:'Мета не определена';
 const links=reviewed?[...record.sources]:[];
 // Catalogue links support specifications only, never a meta verdict.
 if(reviewed&&ship.fleetUrl&&!links.some(s=>s.url===ship.fleetUrl))links.push({label:'Оснащение и назначение · FleetYards (не рейтинг)',url:ship.fleetUrl});
 if(reviewed&&!links.length&&ship.rsiUrl)links.push({label:'Заявленное оснащение · RSI (не рейтинг)',url:ship.rsiUrl});
 return {roles:roles.length?roles:['Роль не уточнена'],status,label,roleNote,reviewed,rated,basis,playerReports:reviewed&&Boolean(record.playerReports||basis==='players'),confidence:reviewed?record.confidence:null,context:reviewed?record.context:null,crew:reviewed?record.crew:null,
  reason:reviewed?record.reason:!ready?'Корабль не отмечен доступным в каталоге: текущая игровая мета не оценивается.':record&&!current?'Оценка требует обновления: изменился патч каталога или прошло больше 30 дней после обзора.':'Для этой модели ещё нет разбора. Отсутствие оценки не означает, что корабль слабый.',
  sources:links,patch:ROLE_REVIEW.patch,date:ROLE_REVIEW.date};
}
export function roleCoverage(ships, patch, now=new Date()) {
 const result={available:0,reviewed:0,rated:0,meta:0,mixed:0,offmeta:0,unknown:0};
 for(const ship of ships||[])if(ship.values?.status==='flight-ready') {
  const p=shipRoleProfile(ship,patch,now);result.available++;result[p.status]++;
  if(p.reviewed)result.reviewed++;if(p.rated)result.rated++;
 }
 return result;
}
