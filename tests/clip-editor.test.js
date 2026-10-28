import test from 'node:test';
import assert from 'node:assert/strict';
import {openClipEditor} from '../clip-editor.js';

test('trim handles cannot cross and coloured markers can be added without pausing playback',async()=>{
 const previous={document:globalThis.document};let saved,pauses=0;
 const fields=new Map();const q=selector=>{if(!fields.has(selector))fields.set(selector,{value:selector==='[data-out]'?'10':'0',style:{},innerHTML:'',textContent:'',currentTime:2,paused:true,pause(){pauses++;this.paused=true;this.onpause?.()},async play(){this.paused=false;this.onplay?.()},removeAttribute(){},load(){}});return fields.get(selector)};
 const modal={querySelector:q,querySelectorAll:()=>[],addEventListener(){},showModal(){},close(){},remove(){}};
 globalThis.document={createElement:()=>modal,body:{append(){}}};
 try{
  openClipEditor({id:'c',duration:10,trimStart:0,trimEnd:10,blob:new Blob(['video'])},{save:async edit=>{saved=edit},report:err=>{throw err}});
  const video=q('[data-video]');video.currentTime=2;await q('[data-play-selection]').onclick();assert.equal(video.paused,false);assert.equal(q('[data-play-selection]').textContent,'■ Stop');await q('[data-play-selection]').onclick();assert.equal(video.paused,true);assert.equal(video.currentTime,2);assert.equal(q('[data-play-selection]').textContent,'▶ Play');await q('[data-play-selection]').onclick();const before=pauses;
  q('[data-add-green]').onclick();video.currentTime=4;q('[data-add-red]').onclick();
  assert.equal(pauses,before);assert.match(q('[data-pins]').innerHTML,/pin-green/);assert.match(q('[data-pins]').innerHTML,/pin-red/);
  q('[data-in]').value='12';q('[data-in]').oninput();assert.equal(Number(q('[data-in]').value),9.95);
  q('[data-in]').value='1';q('[data-in]').oninput();q('[data-out]').value='0';q('[data-out]').oninput();assert.equal(Number(q('[data-out]').value),1.05);
  q('[data-out]').value='10';await q('[data-save]').onclick();assert.deepEqual(saved.markers.map(m=>[m.color,m.sourceTime]),[['green',2],['red',4]]);assert.equal(saved.markers[1].sourceEnd,undefined);assert.equal(saved.markers[1].boundaryMode,'ai');
 }finally{globalThis.document=previous.document;}
});
