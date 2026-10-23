import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {acquisitionMethods,matchesAcquisition} from '../src/acquisition.js';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));
const methods=name=>acquisitionMethods(catalog.ships.find(s=>s.name===name));
test('purchase and rental come from the ship, not its components',()=>{
 assert.deepEqual(acquisitionMethods({name:'Unknown',values:{'game.WeaponGun[].availability.soldAt.count':[3]}}),['unknown']);
 assert.deepEqual(acquisitionMethods({values:{price:0,pledge:Infinity}}),['unknown']);
 assert.deepEqual(acquisitionMethods({values:{'fy.availability.rentalAt.count':1}}),['rental']);
 assert.ok(methods('100i').includes('auec'));assert.ok(methods('100i').includes('pledge'));
});
test('reward routes do not leak into cosmetic variants or masquerade as store purchases',()=>{
 assert.ok(methods('F8C Lightning').includes('quest'));assert.ok(methods('F8C Lightning').includes('pyro'));
 assert.deepEqual(methods('F8C Lightning Executive Edition'),['special']);
 assert.ok(!methods('Sabre Raven').includes('pledge'));
 assert.ok(!methods('F7A Hornet Mk II').includes('pledge'));
 assert.deepEqual(acquisitionMethods({name:'Other Guardian',values:{}}),['unknown']);
});
test('multi-selection is OR and an empty selection is unrestricted',()=>{
 assert.equal(matchesAcquisition(['pledge'],['auec','pledge']),true);
 assert.equal(matchesAcquisition(['quest'],['auec','pledge']),false);
 assert.equal(matchesAcquisition(['unknown'],[]),true);
});
