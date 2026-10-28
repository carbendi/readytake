import test from 'node:test';
import assert from 'node:assert/strict';
import {duplicateBrandKit} from '../kit-actions.js';
test('duplicated kit has independent slots and edits while resolving the same originals',()=>{
 let n=0;const id=()=>`copy-${++n}`;
 const original={id:'brand',name:'Shampoo',logoId:'logo',activeSlotId:'slot',slots:[{id:'slot',name:'Product demo',state:{script:'Original',musicId:'music'}}]};
 const items=[{id:'take',kind:'clip',kitId:'brand',slotId:'slot',blob:new Blob(['video']),trimStart:2,markers:[{sourceTime:3,color:'green'}]},{id:'shared',kind:'clip',kitId:'brand',slotId:'slot',sourceId:'take',trimStart:1},{id:'other',kind:'clip',kitId:'another-brand',blob:new Blob()}];
 const copy=duplicateBrandKit(original,items,id);assert.notEqual(copy.kit.id,original.id);assert.equal(copy.kit.name,'Shampoo copy');assert.notEqual(copy.kit.activeSlotId,'slot');assert.equal(copy.clips.length,2);assert.equal(copy.clips[0].sourceId,'take');assert.equal(copy.clips[1].sourceId,'take');assert.equal(copy.clips[0].blob,undefined);assert.equal(copy.clips[0].slotId,copy.kit.activeSlotId);assert.equal(copy.kit.logoId,'logo');
 copy.kit.slots[0].state.script='Changed';copy.clips[0].markers[0].color='red';assert.equal(original.slots[0].state.script,'Original');assert.equal(items[0].markers[0].color,'green');
});
