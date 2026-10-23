import test from 'node:test';
import assert from 'node:assert/strict';
import {crewSummary} from '../src/crew-summary.js';

test('basic piloting does not copy operating crew, seats or passengers into capacity',()=>{
 const crew=crewSummary({status:'flight-ready',crewMin:6,crewMax:6,'game.Seat.count':14});
 assert.equal(crew.minimum,1);assert.equal(crew.recommended,6);assert.equal(crew.maximum,null);
 const single=crewSummary({status:'flight-ready',crewMin:1,crewMax:1});
 assert.equal(single.maximum,null); // A single seat does not establish absence of an interior.
});
test('concepts, missing data and invalid numbers are not presented as confirmed crew',()=>{
 assert.equal(crewSummary({status:'in-concept',crewMin:4,crewMax:8}).minimum,null);
 assert.equal(crewSummary({status:'flight-ready'}).minimum,null);
 assert.equal(crewSummary({crewMax:0}).recommended,null);
 assert.equal(crewSummary({crewMax:Infinity}).recommended,null);
 assert.equal(crewSummary({status:'flight-ready','fy.positions[].positionType':['pilot']}).minimum,1);
});
