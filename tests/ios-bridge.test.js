import test from 'node:test';
import assert from 'node:assert/strict';
import {isIPhoneApp,shareIPhoneFile} from '../ios-bridge.js';

test('iPhone sharing writes ordered chunks, shares the saved file, and removes the temporary folder',async()=>{
 const calls=[],previous=globalThis.Capacitor;
 try{
  globalThis.Capacitor={getPlatform:()=> 'ios',isNativePlatform:()=>true,nativePromise:async (plugin,method,options)=>{
   calls.push({plugin,method,options});
   if(method==='getUri')return {uri:'file:///export/test.mp4'};
   if(method==='share')throw Error('Share canceled');
  }};
  assert.equal(isIPhoneApp(),true);
  const bytes=new Uint8Array(768*1024+12).fill(142);
  await shareIPhoneFile(new Blob([bytes]),'../../test.mp4');
  assert.deepEqual(calls.map(c=>c.method),['writeFile','appendFile','getUri','share','rmdir']);
  assert.equal(Buffer.from(calls[0].options.data,'base64').length,768*1024);
  assert.equal(Buffer.from(calls[1].options.data,'base64').length,12);
  assert.equal(calls[0].options.path.split('/').length,2);
  assert.deepEqual(calls[3].options.files,['file:///export/test.mp4']);
  assert.ok(calls[0].options.path.startsWith(calls[4].options.path+'/'));
 }finally{if(previous)globalThis.Capacitor=previous;else delete globalThis.Capacitor;}
});
