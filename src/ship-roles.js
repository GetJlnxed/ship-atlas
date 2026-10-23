// An editorial snapshot, not a statistical tier list. Exact variants only.
export const ROLE_REVIEW = { patch: '4.10.2-live.12913470', date: '2026-10-23', maxAgeDays: 30 };
const sources = {
 fighters: { label: 'Игроки: F7A и соперники в текущем патче', url: 'https://www.reddit.com/r/starcitizen/comments/1x5dae1/how_is_the_f7a_hornet_mk_ii_in_the_current_patch/' },
 fleet: { label: 'Игроки: состав PvP-флота', url: 'https://www.reddit.com/r/starcitizen/comments/1x5utcy/pvp_focused_fleet/' },
 talon: { label: 'Игроки: оснащение Talon', url: 'https://www.reddit.com/r/starcitizen/comments/1xabmw9/espera_talon_build/' },
 hauling: { label: 'Игроки: Titan, Nomad и переход к перевозкам', url: 'https://www.reddit.com/r/starcitizen/comments/1xb8t8u/should_i_upgrade_my_avenger_titan/' },
 corsair: { label: 'Владельцы Corsair: применение и альтернативы', url: 'https://www.reddit.com/r/starcitizen/comments/1x5y8xt/long_time_corsair_owners_how_we_feeling/' },
 hercules: { label: 'Владельцы C2: грузы и перевозка техники', url: 'https://www.reddit.com/r/starcitizen/comments/1xbadt0/dont_use_this_ship_unless/' },
};
const review = (roles, status, context, reason, refs, crew = '1 пилот') => ({roles,status,context,reason,sources:refs.map(k=>sources[k]),crew});
export const roleReviews = {
 'Arrow': review(['Лёгкий истребитель','Дуэлянт'], 'meta', 'PvP', 'Часто рекомендуют для манёвренных дуэлей. Сила раскрывается у пилота, который умеет избегать попаданий; это не оценка живучести и не гарантия победы.', ['fighters','fleet']),
 'M80': review(['Тяжёлый истребитель','Перехватчик'], 'meta', 'PvP', 'Игроки выделяют сочетание скорости перехватчика и вооружения; его также называют среди реально встречающихся PvP-кораблей.', ['fighters','fleet']),
 'Talon': review(['Лёгкий истребитель','Скрытная атака'], 'meta', 'PvP · засады', 'Встречается в PvP-флотах как скрытный ударный истребитель. Оценка относится к стелс-сборке с заменёнными пушками, а не к штатным Lightstrike.', ['fighters','fleet','talon']),
 'Gladius': review(['Лёгкий истребитель','Дуэлянт'], 'mixed', 'PvP', 'Его регулярно рекомендуют и встречают в PvP, но в свежей дискуссии спорят о его месте относительно Arrow и тяжёлых истребителей. Однозначного статуса нет.', ['fighters','fleet']),
 'F7A Hornet Mk II': review(['Средний истребитель','Ударный истребитель'], 'mixed', 'PvP', 'Огневую мощь хвалят, но оценки против опытных пилотов лёгких истребителей расходятся. Хорошие отзывы о PvE не означают лидерства в PvP.', ['fighters','fleet']),
 'C1 Spirit': review(['Грузовой','Универсальный'], 'meta', 'малые перевозки', 'В обсуждении перехода со стартового корабля игроки рекомендуют C1 для небольших грузовых задач. Это редакционная оценка в начальном классе, не лидерство по доходу среди всех грузовиков.', ['hauling']),
 'Nomad': review(['Универсальный','Малые перевозки'], 'offmeta', 'грузовые контракты', 'Для специализированных перевозок игроки советуют перейти к C1 или грузовикам Hull. Nomad остаётся удобным универсальным кораблём; красный статус относится только к эффективности грузовых контрактов.', ['hauling']),
 'Corsair': review(['Канонерка','Универсальный','Грузовой'], 'offmeta', 'грузовые контракты', 'Владельцы, ориентированные на торговлю, выбирают более вместительные альтернативы. Здесь оценены перевозки: отзывы о боевом применении расходятся, и красный тег не является вердиктом для PvE или PvP.', ['corsair','fleet']),
 'C2 Hercules': review(['Тяжёлый грузовой','Перевозка техники'], 'mixed', 'перевозки', 'Владельцы выделяют перевозку техники, но спорят о выгоде обычных грузовых рейсов по сравнению с Hull B. Единой оценки для всех грузовых задач нет.', ['hercules']),
 'Mantis': review(['Квантовый перехват','Поддержка группы'], 'unknown', 'PvP в группе', 'В PvP его упоминают как корабль контроля и перехвата. Само участие в составах не доказывает лидерства: сравнительной оценки для зелёного тега недостаточно.', ['fighters'], 'Пилот и союзные боевые корабли'),
};
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
 const reviewed=Boolean(record&&current&&ready&&!v.ground);
 let roles=reviewed?record.roles:catalogRoles(v.focus);
 let roleNote=reviewed?'Практические роли: редакционная сводка обсуждений игроков.':'Роли по назначению из каталога; применение в текущей мете отдельно не подтверждено.';
 if(ship?.name==='Zeus Mk II ES'&&ready){roles=['Универсальный','Экспедиционный'];roleNote='«Универсальный» — оценка применения по оснащению: жилой отсек и 32 SCU. «Экспедиционный» — заявленная роль. Это не доказательство лидерства в текущей мете.';}
 if(!roles.length)roles=['Роль не уточнена'];
 const status=reviewed?record.status:'unknown';
 const label=!ready?'Мета не оценена':status==='meta'?`Мета · ${record.context}`:status==='offmeta'?`Не мета · ${record.context}`:status==='mixed'?`Спорный выбор · ${record.context}`:'Мета не проверена';
 return {roles,status,label,roleNote,reviewed,context:reviewed?record.context:null,crew:reviewed?record.crew:null,
  reason:reviewed?record.reason:!ready?'Для ещё не вышедшего корабля нельзя оценить текущую игровую мету.':record&&!current?'Оценка требует обновления: изменился патч каталога или прошло больше 30 дней после обзора.':'Недостаточно свежих сравнений игроков для зелёного или красного статуса. Отсутствие оценки не означает, что корабль слабый.',
  sources:reviewed?record.sources:[],patch:ROLE_REVIEW.patch,date:ROLE_REVIEW.date};
}
