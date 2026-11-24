const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
let busy=false, power=false, clock=0, arrivals=0;
const ctx=vm.createContext({console,Math,performance:{now:()=>clock},setInterval:()=>1,
 parent:{cameraIsWatching:()=>false,encounterBusy:()=>busy,cameraArrival:()=>{if(busy)return false;busy=true;arrivals++;return true;},cameraPower:v=>{power=v;},document:{getElementById:()=>({hidden:true})}},
});
for(const file of ['assets','config','occupancy','multi']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../camera/js',file+'.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run('let timer, cam=0; function render(){parent.cameraPower(multi.breakerPhase===3);} startMulti();');
assert.equal(run('multi.rooms.owner(0)'), 'patrol');
assert.equal(run('multi.rooms.owner(4)'), 'light');
run('multi.now=8000; tickMultiBreaker(0)');
assert.equal(run('multi.rooms.owner(6)'), 'breaker');
run('tickMultiBreaker(20)'); assert.equal(power,true);
run('tickMultiBreaker(18)'); assert.equal(power,false);
run("multi.rooms.move('patrol',2); multi.agents[0].room=2; multi.agents[0].idx=4; multi.agents[0].next=0; advanceAgent(multi.agents[0])");
assert.equal(run('multi.deskOwner'),'patrol');
run("multi.rooms.move('light',7); multi.agents[1].room=7; multi.agents[1].idx=4; multi.agents[1].next=0; advanceAgent(multi.agents[1])");
assert.equal(run('multi.deskOwner'),'patrol'); assert.equal(arrivals,1);
busy=false; run('tickMulti()'); assert.equal(run('multi.deskOwner'),null); assert.ok(run('multi.deskReady>multi.now'));
run('resetMulti(); startMulti()'); busy=false;
// Simulated 30 minutes; each arrival resolves after 10 seconds.
let releaseAt=0, lastArrivals=arrivals;
for(let i=0;i<18000;i++){
 clock+=100; if(busy && clock>=releaseAt)busy=false;
 run('tickMulti()');
 if(arrivals!==lastArrivals){releaseAt=clock+10000;lastArrivals=arrivals;}
 assert.ok(run('multi.agents.every(a=>multi.rooms.owner(a.room)===a.kind)'));
 assert.ok(run('new Set(multi.agents.map(a=>a.room)).size===2'));
 assert.ok(run('multi.agents.every(a=>!!assets[a.room][a.kind])'));
}
assert.ok(arrivals>5,`arrivals: ${arrivals}`);
console.log('multi simulation OK; arrivals:',arrivals);
