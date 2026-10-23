import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogRoles,shipRoleProfile,ROLE_REVIEW,roleReviews,roleCoverage} from '../src/ship-roles.js';
import {followupReviewNames} from '../src/role-review-data.js';
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
 assert.equal(profile('Corsair').status,'meta');assert.match(profile('Corsair').label,/PvE/);
 assert.equal(profile('F7A Hornet Mk II').status,'mixed');
 assert.equal(profile('Zeus Mk II ES').status,'mixed');
 assert.equal(profile('Talon Shrike').status,'unknown');
 assert.equal(profile('Gladius Pirate Edition').status,'unknown');
});
test('meta labels expire and never apply to PTU, unknown builds or concepts',()=>{
 for(const patch of ['4.11.0-live.1','4.10.2-ptu.12913470',undefined])assert.equal(shipRoleProfile(ship('Arrow'),patch,now).status,'unknown');
 assert.equal(shipRoleProfile(ship('Arrow'),ROLE_REVIEW.patch,new Date('2026-11-24')).status,'unknown');
 assert.equal(shipRoleProfile({...ship('Arrow'),values:{status:'in-concept'}},ROLE_REVIEW.patch,now).status,'unknown');
});
test('every flight-ready entry has an explicit audit, including ground and special editions',()=>{
 const ready=catalog.ships.filter(s=>s.values.status==='flight-ready');
 assert.equal(ready.length,231);
 assert.deepEqual(Object.keys(roleReviews).sort(),ready.map(s=>s.name).sort());
 for(const s of ready){const p=profile(s.name);assert.equal(p.reviewed,true,s.name);assert.ok(p.roles.length&&p.reason&&p.context,s.name)}
 const c=roleCoverage(catalog.ships,ROLE_REVIEW.patch,now);
 assert.deepEqual(c,{available:231,reviewed:231,rated:77,meta:23,mixed:49,offmeta:5,unknown:154});
 assert.equal(profile('ROC').reviewed,true);
 assert.equal(profile('ROC').rated,true);
 assert.equal(profile('ROC').status,'mixed');
 assert.equal(profile('Golem OX').status,'unknown');
 assert.equal(profile('Golem').status,'meta');
 assert.equal(profile('MOLE').status,'meta');
 assert.equal(profile('Argo Mole Carbon Edition').status,'unknown');
 assert.match(profile('MOTH').context,/разбор корпуса/);
 assert.match(profile('MOTH').reason,/RMC не относится/);
 for(const name of ['Javelin','Bengal'])assert.match(profile(name).reason,/доступность обычного владения/);
 assert.equal(roleCoverage(catalog.ships,'4.11.0-live.1',now).reviewed,0);
 assert.equal(shipRoleProfile({name:'New ship',values:{status:'flight-ready'}},ROLE_REVIEW.patch,now).reviewed,false);
});

test('follow-up distinguishes reports, tentative judgments, and unresearched catalogue descriptions',()=>{
 assert.equal(followupReviewNames.length,41);
 for(const name of followupReviewNames){
  const p=profile(name);
  assert.equal(p.playerReports,true,name);
  assert.ok(['limited','moderate'].includes(p.confidence),name);
  assert.ok(p.sources.some(s=>s.url.includes('reddit.com/')),name);
 }
 assert.equal(profile('400i').status,'offmeta');
 assert.match(profile('400i').context,/повседневных/);
 assert.equal(profile('Hull C').status,'offmeta');
 assert.equal(profile('ROC-DS').status,'offmeta');
 assert.equal(profile('SRV').status,'mixed');
 assert.match(profile('Prowler').roles.join(' '),/Скрытная канонерка/);
 assert.equal(profile('C8R Pisces').rated,false);
 assert.equal(profile('C8R Pisces').playerReports,true);
 assert.equal(profile('Talon Shrike').playerReports,false);
 assert.equal(profile('Starfarer Gemini').status,'unknown');
 assert.equal(profile('Cutter Scout').status,'unknown');
 assert.equal(profile('Syulen').status,'unknown');
 assert.equal(profile('325a').status,'mixed');
 assert.equal(profile('315p').status,'unknown');
 assert.equal(profile('315p').playerReports,true);
 assert.equal(profile('F7C-M Super Hornet Mk I').status,'mixed');
 assert.equal(profile('F7C-M Super Hornet Heartseeker Mk I').status,'unknown');
 assert.match(profile('Skylark').reason,/стыковке/);
 assert.equal(profile('Fury').status,'unknown');
 assert.equal(profile('Fury').playerReports,true);
 assert.equal(profile('Scorpius Antares').status,'unknown');
 assert.equal(shipRoleProfile(ship('400i'),'4.10.2-ptu.12913470',now).playerReports,false);
});
