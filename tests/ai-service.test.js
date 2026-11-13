import test from 'node:test';
import assert from 'node:assert/strict';
import {setAIKey,hasAIKey,listAIModels,generateAIJson,validateAIPlan,validateAnalysis,validateDraft} from '../ai-service.js';

test('AI requests require a session key and transmit it in a header, not in a URL',async()=>{const previous=globalThis.fetch;let calls=[];try{setAIKey('');globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.includes('models?')?{models:[{name:'models/gemini-example',displayName:'Example',supportedGenerationMethods:['generateContent']},{name:'models/embedding',supportedGenerationMethods:['embedContent']}]}:{candidates:[{finishReason:'STOP',content:{parts:[{text:'{"ok":true}'}]}}]}}};await assert.rejects(listAIModels(),/API key/);assert.equal(calls.length,0);setAIKey('test-session-key');assert.equal(hasAIKey(),true);assert.equal((await listAIModels()).length,1);const result=await generateAIJson({model:'gemini-example',prompt:'Test',media:{blob:new Blob(['video']),mimeType:'video/webm;codecs=vp9,opus'}});assert.equal(result.ok,true);assert.ok(calls.every(c=>!c.url.includes('test-session-key')));assert.equal(calls[0].options.headers['x-goog-api-key'],'test-session-key');assert.equal(JSON.parse(calls[1].options.body).contents[0].parts[0].inlineData.mimeType,'video/webm');setAIKey('');assert.equal(hasAIKey(),false);}finally{globalThis.fetch=previous;setAIKey('')}});
test('AI edit proposals reject unknown clips, invalid trims, captions and excessive duration',()=>{const clips=[{id:'a',role:'aroll',duration:20,trimStart:2,trimEnd:15},{id:'b',role:'broll',duration:10,trimStart:0,trimEnd:10}],valid={summary:'Test',cuts:[{clipId:'a',start:2,end:8}],broll:[{clipId:'b',start:1,end:3,at:2}],captions:[{start:0,end:2,text:'Hello'}]};assert.equal(validateAIPlan(valid,clips,10).total,6);assert.throws(()=>validateAIPlan({...valid,cuts:[{clipId:'missing',start:0,end:1}]},clips),/unknown/);assert.throws(()=>validateAIPlan({...valid,cuts:[{clipId:'a',start:0,end:3}]},clips),/outside/);assert.throws(()=>validateAIPlan({...valid,captions:[{start:0,end:9,text:'Too long'}]},clips),/caption/);assert.throws(()=>validateAIPlan(valid,clips,1),/duration/);assert.throws(()=>validateAIPlan({...valid,broll:{}},clips),/invalid/)});
test('analysis timestamps map back from proxies to original media',()=>{const result=validateAnalysis({transcript:[{start:1,end:3,text:'A line'}],moments:[],exclusions:[{start:4,end:5,reason:'Repeated line'}]},45,60);assert.equal(result.transcript[0].start,46);assert.equal(result.exclusions[0].end,50);assert.throws(()=>validateAnalysis({transcript:[{start:0,end:30,text:'Wrong'}]},45,60),/timestamps/)});
test('drafts must contain a usable script and sanitise generated shot kinds',()=>{assert.throws(()=>validateDraft({script:''}),/script/);const draft=validateDraft({script:'Hello',hooks:['Hook'],shots:[{kind:'broll',description:'Product close-up'},{kind:'unknown',description:'Presenter'}]});assert.equal(draft.shots[0].kind,'broll');assert.equal(draft.shots[1].kind,'aroll')});
test('provider errors and incomplete JSON do not create usable edits',async()=>{const previous=globalThis.fetch;try{setAIKey('session-test');globalThis.fetch=async()=>({ok:false,status:429});await assert.rejects(generateAIJson({model:'gemini-example',prompt:'x'}),/quota/);globalThis.fetch=async()=>({ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{'}]}}]})});await assert.rejects(generateAIJson({model:'gemini-example',prompt:'x'}),/incomplete/);}finally{setAIKey('');globalThis.fetch=previous}});

test('OpenAI and Claude route separately through the local helper, and only Gemini accepts video',async()=>{
 const previous=globalThis.fetch,location=globalThis.location,calls=[];
 try{
  globalThis.location={origin:'https://carbendi.github.io'};
  setAIKey('openai-test','openai');setAIKey('claude-test','claude');
  globalThis.fetch=async(url,options)=>{
   calls.push([url,options]);
   return {ok:true,json:async()=>url.endsWith('models')?{data:[{id:'gpt-example'},{id:'gpt-image-example'}]}:url.includes('openai')?{status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"script":"OpenAI"}'}]}]}:{stop_reason:'end_turn',content:[{type:'text',text:'```json\n{"script":"Claude"}\n```'}]}};
  };
  await assert.rejects(listAIModels(undefined,'openai'),/local ReadyTake/);
  assert.equal(calls.length,0);
  globalThis.location={origin:'http://127.0.0.1:8787'};
  assert.deepEqual((await listAIModels(undefined,'openai')).map(m=>m.id),['gpt-example']);
  assert.equal((await generateAIJson({provider:'openai',model:'gpt-example',prompt:'Script'})).script,'OpenAI');
  assert.equal((await generateAIJson({provider:'claude',model:'claude-example',prompt:'Script'})).script,'Claude');
  await assert.rejects(generateAIJson({provider:'claude',model:'claude-example',prompt:'Analyse',media:{}}),/Choose Gemini/);
  assert.equal(calls.length,3);
  assert.deepEqual(calls.map(([url,o])=>[url,o.headers['x-readytake-key']]),[
   ['/api/ai/openai/models','openai-test'],['/api/ai/openai/generate','openai-test'],['/api/ai/claude/generate','claude-test']
  ]);
  assert.equal(JSON.parse(calls[1][1].body).store,false);
  assert.equal(JSON.parse(calls[2][1].body).messages[0].content,'Script');
 }finally{globalThis.fetch=previous;if(location===undefined)delete globalThis.location;else globalThis.location=location;setAIKey('','openai');setAIKey('','claude');}
});

test('iPhone AI calls the native bridge, passes the chosen Gemini model and does not use browser fetch',async()=>{
 const original=globalThis.Capacitor,fetch=globalThis.fetch,calls=[];
 try{
  globalThis.fetch=async()=>{throw Error('Unexpected browser request');};
  globalThis.Capacitor={getPlatform:()=> 'ios',isNativePlatform:()=>true,nativePromise:async(plugin,method,options)=>{
   calls.push({plugin,method,options});
   if(method==='appleStatus')return {available:true};
   if(method==='appleGenerate')return {text:'{"script":"On device"}'};
   return {status:200,body:JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"script":"Gemini"}'}]}}]})};
  }};
  setAIKey('test-only','gemini');
  assert.equal((await listAIModels(undefined,'apple'))[0].id,'apple-on-device');
  assert.equal((await generateAIJson({provider:'apple',prompt:'Write'})).script,'On device');
  assert.equal((await generateAIJson({provider:'gemini',model:'gemini-test',prompt:'Write'})).script,'Gemini');
  assert.deepEqual(calls.map(x=>x.method),['appleStatus','appleGenerate','provider']);
  assert.equal(calls[2].options.model,'gemini-test');
  assert.equal(calls[2].options.key,'test-only');
  assert.equal('key' in calls[1].options,false);
 }finally{
  setAIKey('','gemini');globalThis.fetch=fetch;
  if(original)globalThis.Capacitor=original;else delete globalThis.Capacitor;
 }
});
