import {it,expect} from 'vitest';
import {mount} from '@vue/test-utils';
import SearchSelect from '../src/SearchSelect.vue';
import RuleGroup from '../src/RuleGroup.vue';

it('searches a long field list by group and name, selects by keyboard, preserves current value on Escape',async()=>{
 const options=Array.from({length:200},(_,i)=>({value:'f'+i,label:'Показатель '+i,group:i===199?'Броня':'Системы'}));
 const w=mount(SearchSelect,{props:{modelValue:'f1',label:'Характеристика',options}});
 await w.get('.search-select-trigger').trigger('click');expect(w.findAll('[role=option]')).toHaveLength(80);
 await w.get('input').setValue('броня 199');expect(w.findAll('[role=option]')).toHaveLength(1);
 await w.get('input').trigger('keydown',{key:'Enter'});expect(w.emitted('update:modelValue')[0]).toEqual(['f199']);
 await w.get('.search-select-trigger').trigger('click');await w.get('input').setValue('no match');await w.get('input').trigger('keydown',{key:'Escape'});
 expect(w.find('input').exists()).toBe(false);expect(w.emitted('update:modelValue')).toHaveLength(1);w.unmount();
});
it('searches text values in a rule and supports a custom substring without changing other rules',async()=>{
 const group={id:'root',mode:'and',children:[{id:'one',field:'cargo',value:32,op:'gte',unknown:'exclude'}]};
 const w=mount(RuleGroup,{props:{group,fields:[{key:'cargo',label:'Груз',type:'number',group:'Габариты'},{key:'manufacturer',label:'Производитель',type:'text',group:'Основное',values:['Anvil Aerospace','Aegis Dynamics']}]}});
 await w.get('[aria-label="Характеристика"]').trigger('click');await w.get('[aria-label="Поиск: Характеристика"]').setValue('производитель');await w.get('[role=option]').trigger('click');
 expect(group.children[0]).toMatchObject({field:'manufacturer',op:'eq',value:''});
 await w.get('[aria-label="Значение"]').trigger('click');await w.get('[aria-label="Поиск: Значение"]').setValue('anv');expect(w.findAll('[role=option]')).toHaveLength(1);await w.get('[role=option]').trigger('click');expect(group.children[0].value).toBe('Anvil Aerospace');
 await w.get('[aria-label="Оператор"]').setValue('contains');await w.get('[aria-label="Значение"]').trigger('click');await w.get('[aria-label="Поиск: Значение"]').setValue('Aeros');await w.get('.search-select-custom').trigger('click');expect(group.children[0].value).toBe('Aeros');w.unmount();
});
