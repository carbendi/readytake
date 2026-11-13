import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSequence} from '../exporter.js';

test('cancelling while export loads a clip releases its URL, video element and audio context',async()=>{
 const original={window:globalThis.window,document:globalThis.document,cancelAnimationFrame:globalThis.cancelAnimationFrame,revoke:URL.revokeObjectURL};
 const controller=new AbortController(),removed=[],revoked=[];let closed=0,loadStarted;
 const loading=new Promise(resolve=>{loadStarted=resolve;});
 class Video extends EventTarget{
  load(){if(this.src)loadStarted();}
  removeAttribute(){delete this.src;}
  remove(){removed.push(this);}
 }
 const gain=()=>({connect(){}});
 class AudioContext{
  async resume(){}
  createMediaStreamDestination(){return {}}
  createGain(){return gain()}
  async close(){closed++}
 }
 try{
  globalThis.window={AudioContext};
  globalThis.document={createElement:tag=>tag==='video'?Object.assign(new Video(),{style:{}}):{},body:{append(){}}};
  globalThis.cancelAnimationFrame=()=>{};
  URL.revokeObjectURL=url=>{revoked.push(url);original.revoke(url);};
  const render=renderSequence({
   clips:[{id:'test',role:'aroll',duration:2,blob:new Blob(['test'])}],
   canvas:{captureStream(){},getContext(){}},kit:{aspect:'9:16'},
   options:{size:360,analysisProxy:true},signal:controller.signal
  });
  await loading;controller.abort();
  await assert.rejects(render,{name:'AbortError'});
  assert.equal(removed.length,1);assert.equal(revoked.length,1);assert.equal(closed,1);
 }finally{
  for(const key of ['window','document','cancelAnimationFrame'])if(original[key]===undefined)delete globalThis[key];else globalThis[key]=original[key];
  URL.revokeObjectURL=original.revoke;
 }
});
