import {it,expect} from 'vitest';
import {mount,flushPromises} from '@vue/test-utils';
import fs from 'node:fs';
import PvpComparison from '../src/PvpComparison.vue';
import App from '../src/App.vue';
import {vi} from 'vitest';
import {armorCheck,assessThreat,threats,activeLoadout,defaultStations} from '../src/pvp.js';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));
const ids=['anvl-paladin','aegs-gladius'];
const ships=ids.map(id=>catalog.ships.find(s=>s.id===id));
it('uses the same threat model, adjusts crew per capacity, and respects known pilot control',async()=>{
 const w=mount(PvpComparison,{props:{ships,data:catalog.pvp}});await flushPromises();
 expect(w.get('[data-threat=duelist] [data-ship=anvl-paladin]').text()).toContain('Нет активных орудий');
 await w.get('[aria-label="Экипаж для сравнения"]').setValue(3);await flushPromises();
 expect(w.get('[data-crew-ship=aegs-gladius]').text()).toContain('В расчёте: 1 чел.');
 const p=catalog.pvp.profiles['anvl-paladin'];const expected=assessThreat(threats[0],p,activeLoadout(p,3,0,defaultStations(p,3)),catalog.pvp);
 expect(w.get('[data-threat=duelist] [data-ship=anvl-paladin] .pvp-verdict').text()).toBe(expected.title);
 await w.get('[aria-label="Экипаж для сравнения"]').setValue(1);await flushPromises();
 const links=w.findAll('[data-crew-ship=anvl-paladin] .pvp-link input');expect(links[1].attributes('disabled')).toBeDefined();await links[0].setValue(true);await flushPromises();
 expect(w.get('[data-crew-ship=anvl-paladin] .pvp-control-caveat').text()).toContain('в текущем LIVE не проверена');expect(w.get('[data-threat=duelist] [data-ship=anvl-paladin]').text()).not.toContain('Нет активных орудий');w.unmount();
});
it('compares every weapon threshold with a shared bonus and filters by enemy group',async()=>{
 const w=mount(PvpComparison,{props:{ships,data:catalog.pvp}});await w.findAll('.pvp-tabs button')[1].trigger('click');await w.get('[aria-label="Прибавка урона для сравнения"]').setValue(100);
 const gun=catalog.pvp.weapons.find(x=>x.name==='AD4B Ballistic Gatling');const expected=armorCheck(catalog.pvp.profiles[ids[0]],gun,100);
 expect(w.get('[data-weapon="AD4B Ballistic Gatling"] [data-ship=anvl-paladin] .pvp-verdict').text()).toBe(expected.label);
 await w.get('[aria-label="Противник для сравнения"]').setValue('duelist');expect(w.findAll('[data-weapon]')).toHaveLength(2);expect(w.find('[data-weapon="AD4B Ballistic Gatling"]').exists()).toBe(false);
 await w.get('[aria-label="Противник для сравнения"]').setValue('control');expect(w.text()).toContain('контрольные пушки не заданы');w.unmount();
});
it('does not show armor conclusions for a mismatched LIVE patch',async()=>{
 const w=mount(PvpComparison,{props:{ships,data:{...catalog.pvp,patch:'4.11.0-live.1'}}});await flushPromises();expect(w.get('[data-threat=duelist]').text()).toContain('Версия данных не подтверждена');await w.findAll('.pvp-tabs button')[1].trigger('click');expect(w.get('[data-weapon] .pvp-verdict').text()).toBe('Нет данных LIVE');w.unmount();
});
it('opens PvP comparison from the catalogue and keeps crew settings across comparison tabs',async()=>{
 localStorage.clear();vi.stubGlobal('fetch',async()=>({ok:true,json:async()=>catalog}));
 const w=mount(App);await flushPromises();await w.get('[aria-label="Сравнить 100i"]').trigger('click');await w.get('[aria-label="Сравнить 125a"]').trigger('click');await w.get('.compare-tray .primary-button').trigger('click');
 await w.findAll('.comparison-mode button')[1].trigger('click');await w.get('[aria-label="Экипаж для сравнения"]').setValue(3);await w.findAll('.comparison-mode button')[0].trigger('click');await w.findAll('.comparison-mode button')[1].trigger('click');expect(w.get('[aria-label="Экипаж для сравнения"]').element.value).toBe('3');
 w.unmount();vi.unstubAllGlobals();localStorage.clear();document.body.style.overflow='';
});
