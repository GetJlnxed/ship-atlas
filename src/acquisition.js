// Sources checked 2026-10-23. Reward routes refer to a model's specified
// reward edition, never to every cosmetic variant sharing part of its name.
export const acquisitionSources={
  wikelo:'https://starcitizen.tools/Wikelo#Ships_and_vehicles',
  pyro:'https://starcitizen.tools/Guide:Executive_Hangars',
  concierge:'https://support.robertsspaceindustries.com/hc/en-us/articles/360002542733-Concierge-Levels-and-Rewards',
  fleet:'https://fleetyards.net/ships/'
};
export const acquisitionOptions=[
  {value:'auec',label:'Покупка за aUEC',note:'Есть цена покупки или магазин в снимке каталога.'},
  {value:'pledge',label:'Донат · Pledge Store',note:'Известна продажа за реальные деньги. Может быть доступна только в отдельные периоды или при выполнении условий.'},
  {value:'rental',label:'Аренда за aUEC',note:'Временный доступ, не покупка в собственность.'},
  {value:'quest',label:'Квесты / обмен · Wikelo',note:'В том числе специальные версии за материалы и репутацию. Не любой квест с выплатой aUEC.'},
  {value:'pyro',label:'Награды Pyro',note:'Специальная версия из Executive Hangars. Конкретная награда не гарантирована.'},
  {value:'special',label:'Промо / особые награды',note:'Особые условия, включая Concierge и старые акции. Не означает, что акция доступна сейчас.'},
  {value:'unknown',label:'Нет данных о получении',note:'Не подтверждён ни один из перечисленных способов.'}
];
const wikelo=new Set(['Ursa Medivac','Pulse','Asgard','Scorpius','Clipper','L-22 Alpha Wolf','F8C Lightning','Sabre Firebird','Fortune','Golem','Guardian','Guardian MX','Guardian QI','Starlancer MAX','L-21 Wolf','Polaris','Sabre Peregrine','Prospector','Prowler Utility','Meteor','RAFT','Apollo Triage','Idris-P','C1 Spirit','Ares Inferno','A2 Hercules','Intrepid','Constellation Mk IV Taurus','Terrapin Medic','Zeus Mk II CL','Zeus Mk II ES']);
const pyro=new Set(['F7A Hornet Mk II','F8C Lightning','Corsair','Cutlass Black','Syulen','Guardian MX','Meteor','Scorpius']);
// Catalog pledge prices for these editions are valuations, not direct sales.
const special=new Set(['F8C Lightning Executive Edition','600i Executive-Edition','Sabre Raven','Mustang Omega','Dragonfly Starkitten Edition','F7A Hornet Mk I']);
const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
export function acquisitionMethods(ship){
  const v=ship.values||{},name=ship.name||v.name,methods=[];
  if(positive(v.price)||positive(v['fy.availability.soldAt.count']))methods.push('auec');
  if(!special.has(name)&&(positive(v.pledge)||v['fy.onSale']===true))methods.push('pledge');
  if(positive(v['fy.availability.rentalAt.count']))methods.push('rental');
  if(wikelo.has(name))methods.push('quest');
  if(pyro.has(name))methods.push('pyro');
  if(special.has(name))methods.push('special');
  return methods.length?methods:['unknown'];
}
export function matchesAcquisition(methods,selected){return !selected.length||selected.some(value=>methods.includes(value))}
export function acquisitionNote(methods,selected){
  return acquisitionOptions.filter(o=>selected.includes(o.value)&&methods.includes(o.value)).map(o=>o.value==='quest'?'Wikelo · наградная версия':o.value==='pyro'?'Pyro · наградная версия':o.label).join(' · ');
}
