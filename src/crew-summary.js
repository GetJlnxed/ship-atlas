export const crewExplanationUrl='https://robertsspaceindustries.com/en/comm-link/engineering/16172-The-Shipyard-Ship-Technical-Information';

const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:null;

export function crewSummary(values={}) {
  // Source min/max describe operating crew, not the number of bodies that fit inside.
  // One pilot is the basic flight model, not a claim that solo operation is effective.
  const available=values.status==='flight-ready';
  const hasOperator=positive(values.crewMin)!==null||values['fy.positions[].positionType']?.some(type=>['pilot','driver'].includes(type));
  return {
    minimum:available&&hasOperator?1:null,
    maximum:null,
    recommended:positive(values.crewMax),
    minimumNote:available
      ?'Один пилот (или водитель) для базового управления исправной техникой. Это не штатный минимум для работы по назначению и не проверка каждого корабля в текущем LIVE.'
      :'Не подтверждено для игры: модель ещё не имеет статуса готовой к использованию.',
    maximumNote:'Максимум людей внутри, включая стоящих пассажиров. Источники не дают проверенного предела. Количество кресел и штатный экипаж не определяют эту вместимость.',
    recommendedNote:'Оценка по заявленному максимальному штатному экипажу источника. Не включает стоящих пассажиров и не доказывает максимальную эффективность. Полезный состав зависит от задачи и доступных постов.'
  };
}
