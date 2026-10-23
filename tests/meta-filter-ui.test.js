import {it,expect,vi,afterEach} from 'vitest';
import {mount,flushPromises} from '@vue/test-utils';
import fs from 'node:fs';
import App from '../src/App.vue';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));let wrapper;
afterEach(()=>{wrapper?.unmount();vi.useRealTimers();vi.unstubAllGlobals();localStorage.clear();document.body.innerHTML=''});
it('single meta selector matches card tags, combines filters, persists, clears and accepts older funnels',async()=>{
 vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));localStorage.clear();
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>catalog})));
 wrapper=mount(App,{attachTo:document.body});await flushPromises();
 expect(wrapper.get('.meta-filter').element.previousElementSibling.classList.contains('acquisition-filter')).toBe(true);
 expect(wrapper.get('#meta-status').element.multiple).toBe(false);
 await wrapper.get('#meta-status').setValue('meta');
 expect(wrapper.findAll('.ship-card').length).toBe(4);
 expect(wrapper.findAll('.ship-card .meta-chip').every(tag=>tag.classes().includes('meta'))).toBe(true);
 await wrapper.get('.acquisition-trigger').trigger('click');await wrapper.get('input[value="auec"]').setValue(true);
 expect(wrapper.findAll('.ship-card').length).toBe(3);
 expect(JSON.parse(localStorage.getItem('atlas-state-v1')).metaStatus).toBe('meta');
 wrapper.unmount();wrapper=mount(App);await flushPromises();expect(wrapper.get('#meta-status').element.value).toBe('meta');
 await wrapper.get('.active-filters').findAll('button').find(b=>b.text().startsWith('Метовость:')).trigger('click');
 expect(wrapper.get('#meta-status').element.value).toBe('');
 await wrapper.get('.sidebar-title .text-button').trigger('click');
 for(const value of ['offmeta','mixed','unknown']){
  await wrapper.get('#meta-status').setValue(value);
  expect(wrapper.findAll('.ship-card').length).toBeGreaterThan(0);
  expect(wrapper.findAll('.ship-card .meta-chip').every(tag=>tag.classes().includes(value))).toBe(true);
 }
 await wrapper.get('.sidebar-title .text-button').trigger('click');expect(wrapper.get('#meta-status').element.value).toBe('');
 const state=JSON.parse(localStorage.getItem('atlas-state-v1'));delete state.metaStatus;localStorage.setItem('atlas-state-v1',JSON.stringify(state));
 wrapper.unmount();wrapper=mount(App);await flushPromises();expect(wrapper.get('#meta-status').element.value).toBe('');
 expect(Number(wrapper.get('.results-toolbar b').text())).toBe(catalog.ships.length);
});
