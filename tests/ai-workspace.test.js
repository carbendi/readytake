import test from 'node:test';
import assert from 'node:assert/strict';
import {Buffer} from 'node:buffer';
import {AIAssist} from '../ai-workspace.js';
import {setAIKey} from '../ai-service.js';

test('AI mode guides a mocked script, consented analysis and reviewed proposal without changing footage',async()=>{
 const previous=globalThis.fetch,original={id:'clip',role:'aroll',include:true,duration:4,trimStart:0,trimEnd:4,blob:new Blob(['video'],{type:'video/mp4'}),markers:[]};
 const context={kit:{name:'Brand',shootNotes:'Introduce our shampoo'},slot:{name:'Shampoo'},state:{target:'15',ai:{}},clips:[original]},nodes=new Map(),busy=[],saved=[];let applied,calls=0,proxyCalls=0;
 const root={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{value:'',addEventListener(name,callback){this[name]=callback}});return nodes.get(selector)},querySelectorAll:()=>[]};
 const assist=new AIAssist(root,{getContext:()=>context,createProxyCanvas:()=>({}),renderProxy:async ({clips,options})=>{proxyCalls++;assert.equal(options.size,360);assert.equal(options.analysisProxy,true);assert.equal(clips[0].trimEnd,4);return {blob:new Blob(['encoded proxy'],{type:'video/webm'})}},save:async()=>saved.push(true),preferences:()=>({provider:'gemini',model:'gemini-example'}),onBusy:value=>busy.push(value),report(){},applyPlan:async value=>{applied=value},openTimeline(){},openAudio(){},openExport(){}});
 try{
  setAIKey('test-session');globalThis.fetch=async(url,options)=>{calls++;const parts=JSON.parse(options.body).contents[0].parts,prompt=parts.at(-1).text;
  if(prompt.startsWith('Analyse this'))assert.equal(Buffer.from(parts[0].inlineData.data,'base64').toString(),'encoded proxy');
  if(prompt.startsWith('Create a UGC')||prompt.startsWith('Propose a')){assert.match(prompt,/Shampoo tutorial/);assert.doesNotMatch(prompt,/Packshot photography|Introduce our shampoo/);}
  const result=prompt.startsWith('Extract the requested')?{items:[{title:'Shampoo tutorial',category:'UGC'},{title:'Packshot photography',category:'Photography'}],sharedRequirements:'Use the brand name'}:prompt.startsWith('Create a UGC')?{script:'Here is our shampoo.',direction:'Introduce the product',hooks:['Meet our shampoo'],shots:[]}:prompt.startsWith('Analyse this')?{transcript:[{start:0,end:2,text:'Here is our shampoo.'}],moments:[],exclusions:[]}:{summary:'Product introduction',cuts:[{clipId:'clip',start:0,end:2}],broll:[],captions:[{start:0,end:2,text:'Here is our shampoo.'}],missingShots:[]};return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}]})}};
  assist.render();await nodes.get('[data-ai-draft]').onclick();assert.match(assist.message,/Analyse the client brief/);
  await nodes.get('[data-ai-brief-review]').onclick();assert.ok(context.state.ai.briefReview.items.every(item=>!item.selected));
  await nodes.get('[data-ai-draft]').onclick();assert.match(assist.message,/Tick at least one/);
  context.state.ai.briefReview.items[0].selected=true;
  busy.length=0;await nodes.get('[data-ai-draft]').onclick();assert.equal(context.state.ai.script,'Here is our shampoo.');assert.deepEqual(busy,[true,false]);await nodes.get('[data-ai-analyse]').onclick();assert.match(assist.message,/sharing/);assert.equal(calls,2);
  context.state.ai.videoConsent=true;await nodes.get('[data-ai-analyse]').onclick();assert.equal(context.state.ai.analysis.clip.transcript[0].text,'Here is our shampoo.');await nodes.get('[data-ai-plan]').onclick();assert.equal(context.state.ai.plan.total,2);await nodes.get('[data-ai-apply]').click({target:{}});assert.equal(applied.cuts[0].clipId,'clip');assert.equal(original.trimEnd,4);assert.equal(calls,4);assert.equal(proxyCalls,1);assert.ok(saved.length>=3);context.state.ai.brief='A changed brief';await nodes.get('[data-ai-draft]').onclick();assert.match(assist.message,/Analyse the client brief/);
 }finally{globalThis.fetch=previous;setAIKey('')}
});
