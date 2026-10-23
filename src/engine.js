export const isMissing=v=>v==null||v===''||(Array.isArray(v)&&!v.length);
export const operations={eq:'равно',neq:'не равно',gt:'больше',gte:'не меньше',lt:'меньше',lte:'не больше',between:'в диапазоне',contains:'содержит',notContains:'не содержит',in:'одно из',notIn:'ни одно из',exists:'известно',missing:'нет данных'};
export function matchRule(values,rule){
 const v=values[rule.field],missing=isMissing(v);
 if(rule.op==='missing')return missing;if(rule.op==='exists')return !missing;
 if(rule.unknown==='only')return missing;if(missing)return rule.unknown==='include';
 const scalar=x=>{
   const a=String(x).toLocaleLowerCase(),b=String(rule.value??'').toLocaleLowerCase();
   const nums=rule.value!==''&&rule.value!=null&&Number.isFinite(Number(rule.value));
   switch(rule.op){case'eq':return a===b;case'neq':return a!==b;case'contains':return a.includes(b);case'notContains':return !a.includes(b);case'in':return String(rule.value??'').split('|').map(s=>s.trim().toLocaleLowerCase()).includes(a);case'notIn':return !String(rule.value??'').split('|').map(s=>s.trim().toLocaleLowerCase()).includes(a);case'gt':return nums&&Number(x)>Number(rule.value);case'gte':return nums&&Number(x)>=Number(rule.value);case'lt':return nums&&Number(x)<Number(rule.value);case'lte':return nums&&Number(x)<=Number(rule.value);case'between':return nums&&rule.to!==''&&rule.to!=null&&Number.isFinite(Number(rule.to))&&Number(x)>=Number(rule.value)&&Number(x)<=Number(rule.to);default:return false;}
 };
 const arr=Array.isArray(v)?v:[v];
 if(rule.quantifier==='all'||['neq','notContains','notIn'].includes(rule.op))return arr.every(scalar);
 if(rule.quantifier==='none')return !arr.some(scalar);
 return arr.some(scalar);
}
export function matchGroup(values,group){if(!group?.children?.length)return true;const results=group.children.map(n=>n.children?matchGroup(values,n):matchRule(values,n));return group.mode==='or'?results.some(Boolean):group.mode==='not'?!results.some(Boolean):results.every(Boolean)}
export function compareValue(a,b,direction='asc'){const am=isMissing(a),bm=isMissing(b);if(am||bm)return am===bm?0:am?1:-1;const d=typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b),'ru',{numeric:true});return direction==='desc'?-d:d}
export function canonical(v){return isMissing(v)?'__missing__':JSON.stringify(Array.isArray(v)?[...v].sort((a,b)=>String(a).localeCompare(String(b))):v)}
export function different(ships,key){return new Set(ships.map(s=>canonical(s.values[key]))).size>1}
export function csv(rows){return '\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@-]/,"'"+'$&').replaceAll('"','""')+'"').join(',')).join('\r\n')}
export function validateGroup(group,fields,depth=0){if(depth>20||!group||!['and','or','not'].includes(group.mode)||!Array.isArray(group.children)||group.children.length>200)return false;return group.children.every(n=>n.children?validateGroup(n,fields,depth+1):fields.some(f=>f.key===n.field)&&Object.hasOwn(operations,n.op)&&['string','number','boolean','undefined'].includes(typeof n.value))}
