import test from 'node:test';
import assert from 'node:assert/strict';
import {AIAssist} from '../ai-workspace.js';
import {setAIKey} from '../ai-service.js';

test('AI mode guides a mocked script, consented analysis and reviewed proposal without changing footage',async()=>{
 const previous=globalThis.fetch,original={id:'clip',role:'aroll',include:true,duration:4,trimStart:0,trimEnd:4,blob:new Blob(['video'],{type:'video/mp4'}),markers:[]};
 const context={kit:{name:'Brand',shootNotes:'Introduce our shampoo'},slot:{name:'Shampoo'},state:{target:'15',ai:{}},clips:[original]},nodes=new Map(),busy=[],saved=[];let applied,calls=0;
 const root={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{value:'',addEventListener(name,callback){this[name]=callback}});return nodes.get(selector)},querySelectorAll:()=>[]};
 const assist=new AIAssist(root,{getContext:()=>context,save:async()=>saved.push(true),preferences:()=>({provider:'gemini',model:'gemini-example'}),onBusy:value=>busy.push(value),report(){},applyPlan:async value=>{applied=value},openTimeline(){},openAudio(){},openExport(){}});
 try{
  setAIKey('test-session');globalThis.fetch=async(url,options)=>{calls++;const prompt=JSON.parse(options.body).contents[0].parts.at(-1).text;const result=prompt.startsWith('Create a UGC')?{script:'Here is our shampoo.',direction:'Introduce the product',hooks:['Meet our shampoo'],shots:[]}:prompt.startsWith('Analyse this')?{transcript:[{start:0,end:2,text:'Here is our shampoo.'}],moments:[],exclusions:[]}:{summary:'Product introduction',cuts:[{clipId:'clip',start:0,end:2}],broll:[],captions:[{start:0,end:2,text:'Here is our shampoo.'}],missingShots:[]};return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}]})}};
  assist.render();await nodes.get('[data-ai-draft]').onclick();assert.equal(context.state.ai.script,'Here is our shampoo.');assert.deepEqual(busy,[true,false]);await nodes.get('[data-ai-analyse]').onclick();assert.match(assist.message,/sharing/);assert.equal(calls,1);
  context.state.ai.videoConsent=true;await nodes.get('[data-ai-analyse]').onclick();assert.equal(context.state.ai.analysis.clip.transcript[0].text,'Here is our shampoo.');await nodes.get('[data-ai-plan]').onclick();assert.equal(context.state.ai.plan.total,2);await nodes.get('[data-ai-apply]').click({target:{}});assert.equal(applied.cuts[0].clipId,'clip');assert.equal(original.trimEnd,4);assert.equal(calls,3);assert.ok(saved.length>=3);
 }finally{globalThis.fetch=previous;setAIKey('')}
});
