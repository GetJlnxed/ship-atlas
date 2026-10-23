import {it,expect,vi,afterEach} from 'vitest';
import {mount,flushPromises} from '@vue/test-utils';
import fs from 'node:fs';
import App from '../src/App.vue';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));let wrapper;
afterEach(()=>{wrapper?.unmount();vi.useRealTimers();vi.unstubAllGlobals();localStorage.clear();document.body.innerHTML=''});
it('photo tags open the same ship with context and sources; comparison remains independent',async()=>{
 vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));localStorage.clear();
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>catalog})));
 wrapper=mount(App,{attachTo:document.body});await flushPromises();
 await wrapper.get('[aria-label="Поиск корабля"]').setValue('M80');
 const card=wrapper.get('.ship-card');expect(card.get('.ship-role-overlay').text()).toContain('Перехватчик');
 expect(card.get('.meta-chip.meta').text()).toContain('Мета · PvP');
 await card.get('.compare-toggle').trigger('click');expect(wrapper.find('.ship-role-details').exists()).toBe(false);
 expect(card.get('.compare-toggle').attributes('aria-pressed')).toBe('true');
 await card.get('.role-chip').trigger('click');
 const details=wrapper.get('.ship-role-details');expect(details.text()).toContain('1 пилот');
 expect(details.findAll('a').length).toBe(2);expect(details.text()).toContain('LIVE 4.10.2');
});
