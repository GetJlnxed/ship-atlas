export const crewExplanationUrl='https://robertsspaceindustries.com/en/comm-link/engineering/16172-The-Shipyard-Ship-Technical-Information';

const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:null;

// Layout evidence is independent of operating crew. Exact names deliberately
// avoid inheriting a cockpit layout across unverified variants or future reworks.
const layouts=[
  {names:['Buccaneer'],extra:false,url:'https://robertsspaceindustries.com/en/comm-link/engineering/15359-Q-A-Drake-Buccaneer-Part-II'},
  {names:['Ares Ion','Ares Inferno'],extra:false,url:'https://robertsspaceindustries.com/en/comm-link/engineering/17414-Q-A-CRUSADER-ARES'},
  {names:['Sabre'],extra:false,url:'https://robertsspaceindustries.com/en/comm-link/engineering/15014-Q-A-Aegis-Sabre'},
  {names:['F8C Lightning','F8C Lightning Executive Edition'],extra:false,url:'https://starcitizen.tools/Comm-Link:Q%26A_-_Anvil_Aerospace_F8C_Lightning'},
  {names:['100i','125a','135c'],extra:true,url:'https://robertsspaceindustries.com/en/comm-link/engineering/16537-Q-A-Origin-100-Series-Part-II'},
  {names:['Nomad'],extra:true,url:'https://starcitizen.tools/Nomad'},
  {names:['Prospector'],extra:true,url:'https://starcitizen.tools/Prospector'},
  {names:['Hawk'],extra:true,url:'https://robertsspaceindustries.com/en/comm-link/engineering/16883-Q-A-Anvil-Arrow'},
  {names:['Spartan'],extra:true,url:'https://robertsspaceindustries.com/en/ship-matrix'}
];

export function additionalOccupants(values={}) {
  const layout=layouts.find(entry=>entry.names.includes(values.name));
  if(layout)return {possible:layout.extra,source:layout.url};
  // Positive evidence only: a single crew member/seat never proves no interior.
  if(positive(values.crewMin)>1||positive(values.crewMax)>1||positive(values['game.Seat.count'])>1)
    return {possible:true,source:'Дополнительные места или штатный экипаж в данных каталога.'};
  if(positive(values['fy.metrics.beds'])>0)
    return {possible:true,source:'Жилой интерьер: спальные места в данных FleetYards.'};
  return {possible:null,source:null};
}

export function crewSummary(values={}) {
  // Source min/max describe operating crew, not the number of bodies that fit inside.
  // One pilot is the basic flight model, not a claim that solo operation is effective.
  const available=values.status==='flight-ready';
  const hasOperator=positive(values.crewMin)!==null||values['fy.positions[].positionType']?.some(type=>['pilot','driver'].includes(type));
  const minimum=available&&hasOperator?1:null;
  const occupancy=additionalOccupants(values);
  const occupancyNote=occupancy.possible===true
    ?'1+ — управляет один человек, но на борту есть место ещё для человека: в кресле, интерьере или пассажирском отсеке. Плюс не означает обязательного второго члена экипажа и не задаёт максимум.'
    :occupancy.possible===false
      ?'1 — только пилот: отдельного места для второго человека или доступного интерьера нет.'
      :'1 ? — для управления нужен один человек; возможность разместить второго пока не подтверждена. Одно кресло само по себе не означает отсутствие интерьера.';
  return {
    minimum,
    minimumLabel:minimum===null?'—':occupancy.possible===true?'1+':occupancy.possible===false?'1':'1 ?',
    occupancy,
    recommended:positive(values.crewMax),
    minimumNote:available
      ?occupancyNote+' Это базовое управление исправной техникой, а не оценка боевой эффективности. Планировка по источникам, без отдельной проверки в текущем LIVE.'
      :'Не подтверждено для игры: модель ещё не имеет статуса готовой к использованию.',
    recommendedNote:'Оценка по заявленному максимальному штатному экипажу источника. Не включает стоящих пассажиров и не доказывает максимальную эффективность. Полезный состав зависит от задачи и доступных постов.'
  };
}
