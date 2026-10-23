import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogRoles,shipRoleProfile,ROLE_REVIEW,roleReviews} from '../src/ship-roles.js';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));
const now=new Date('2026-10-23T12:00:00Z');
const ship=name=>catalog.ships.find(s=>s.name===name);
const profile=name=>shipRoleProfile(ship(name),ROLE_REVIEW.patch,now);
test('all catalogue roles have readable Russian tags, including mixed roles',()=>{
 for(const s of catalog.ships)if(s.values.focus)assert.ok(catalogRoles(s.values.focus).length,`${s.name}: ${s.values.focus}`);
 assert.deepEqual(catalogRoles('Stealth Bomber'),['Стелс-бомбардировщик']);
 assert.deepEqual(catalogRoles('Medium Freight / Gunship'),['Грузовой','Канонерка']);
 assert.ok(profile('M80').roles.includes('Перехватчик'));
 assert.ok(profile('Zeus Mk II ES').roles.includes('Универсальный'));
});
test('meta judgments have evidence and a role; absent and conflicting evidence are not negative',()=>{
 for(const name of Object.keys(roleReviews)){assert.ok(ship(name),name);const p=profile(name);assert.ok(p.sources.length);assert.ok(p.reason);assert.ok(p.context)}
 assert.equal(profile('Arrow').status,'meta');
 assert.equal(profile('Corsair').status,'offmeta');assert.match(profile('Corsair').label,/грузовые контракты/);
 assert.equal(profile('F7A Hornet Mk II').status,'mixed');
 assert.equal(profile('Zeus Mk II ES').status,'unknown');
 assert.equal(profile('Talon Shrike').status,'unknown');
 assert.equal(profile('Gladius Pirate Edition').status,'unknown');
});
test('meta labels expire and never apply to PTU, unknown builds, concepts or ground vehicles',()=>{
 for(const patch of ['4.11.0-live.1','4.10.2-ptu.12913470',undefined])assert.equal(shipRoleProfile(ship('Arrow'),patch,now).status,'unknown');
 assert.equal(shipRoleProfile(ship('Arrow'),ROLE_REVIEW.patch,new Date('2026-11-24')).status,'unknown');
 for(const values of [{status:'in-concept'},{status:'flight-ready',ground:true}])assert.equal(shipRoleProfile({...ship('Arrow'),values},ROLE_REVIEW.patch,now).status,'unknown');
});
