import {it,expect} from 'vitest';
import {mount} from '@vue/test-utils';
import ComparisonFieldPicker from '../src/ComparisonFieldPicker.vue';
it('selects groups and search results without losing hidden selected fields',async()=>{
 const fields=[
  {key:'cargo',label:'Груз',group:'Габариты',level:'standard'},
  {key:'length',label:'Длина',group:'Габариты',level:'standard'},
  {key:'speed',label:'Скорость',group:'Полёт',level:'standard'},
  {key:'hidden',label:'Служебный флаг',group:'Служебные',level:'technical',technical:true},
 ];
 const wrapper=mount(ComparisonFieldPicker,{props:{fields,modelValue:['cargo','hidden'],defaults:['cargo','speed']}});
 const sync=async()=>wrapper.setProps({modelValue:wrapper.emitted('update:modelValue').at(-1)[0]});
 try{
  await wrapper.get('[aria-controls="comparison-field-options"]').trigger('click');
  const group=wrapper.get('[aria-label="Вся группа Габариты"]');expect(group.element.indeterminate).toBe(true);
  await group.setValue(true);await sync();expect(wrapper.props('modelValue')).toEqual(['cargo','hidden','length']);
  await wrapper.get('[aria-label="Найти характеристику для выбора"]').setValue('Длина');
  await wrapper.findAll('button').find(b=>b.text()==='Снять найденные').trigger('click');await sync();
  expect(wrapper.props('modelValue')).toEqual(['cargo','hidden']);
  await wrapper.get('[aria-label="Найти характеристику для выбора"]').setValue('');
  await wrapper.get('.picker-search .check-row input').setValue(true);
  expect(wrapper.findAll('.picker-field input').map(x=>x.attributes('data-field'))).toEqual(['cargo','hidden']);
 }finally{wrapper.unmount()}
});
