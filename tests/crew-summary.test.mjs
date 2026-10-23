import test from 'node:test';
import assert from 'node:assert/strict';
import {crewSummary} from '../src/crew-summary.js';
const ready={status:'flight-ready',crewMin:1,crewMax:1,'game.Seat.count':1};
test('one pilot and extra occupants are independent from recommended crew',()=>{
 const crew=crewSummary({...ready,crewMin:6,crewMax:6,'game.Seat.count':14});
 assert.equal(crew.minimum,1);assert.equal(crew.minimumLabel,'1+');assert.equal(crew.recommended,6);
 assert.equal('maximum' in crew,false);
});
test('single seat with interior differs from a cockpit-only fighter',()=>{
 assert.equal(crewSummary({...ready,name:'F8C Lightning'}).minimumLabel,'1');
 for(const name of ['100i','125a','135c','Nomad','Prospector','Hawk'])assert.equal(crewSummary({...ready,name}).minimumLabel,'1+',name);
 assert.equal(crewSummary({...ready,name:'Mustang Beta','fy.metrics.beds':1}).minimumLabel,'1+');
 assert.equal(crewSummary({...ready,'game.Seat.count':2}).minimumLabel,'1+');
});
test('single seat, unknown variants and virtual stations never establish absence of interior',()=>{
 for(const name of ['Unknown ship','F8C future rework']){
  const crew=crewSummary({...ready,name,'fy.positions.count':4});
  assert.equal(crew.minimumLabel,'1 ?');assert.equal(crew.occupancy.possible,null);
 }
});
test('concepts, missing data and invalid numbers are not presented as confirmed crew',()=>{
 assert.equal(crewSummary({status:'in-concept',crewMin:4,crewMax:8}).minimumLabel,'—');
 assert.equal(crewSummary({status:'flight-ready'}).minimum,null);
 assert.equal(crewSummary({crewMax:0}).recommended,null);
 assert.equal(crewSummary({crewMax:Infinity}).recommended,null);
 assert.equal(crewSummary({status:'flight-ready','fy.positions[].positionType':['pilot']}).minimum,1);
});
