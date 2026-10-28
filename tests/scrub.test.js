import test from 'node:test';
import assert from 'node:assert/strict';
import {EditPreview} from '../preview.js';
import {Timeline} from '../timeline.js';

test('rapid seeks skip outdated requests instead of queuing every frame',async()=>{
 const player=new EditPreview({clips:[]});player.pause=()=>{};let release,positions=[];
 player.position=async time=>{positions.push(time);if(time===1)await new Promise(r=>release=r)};
 player.seek(1);await new Promise(r=>setTimeout(r,0));
 for(let i=2;i<=100;i++)player.seek(i);
 release();await player.serial;assert.deepEqual(positions,[1,100]);assert.equal(player.seekQueued,false);
});

test('playhead dragging updates immediately, clamps and does not rebuild the timeline',()=>{
 const previous={request:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame};let frame;
 globalThis.requestAnimationFrame=fn=>{frame=fn;return 1};globalThis.cancelAnimationFrame=()=>{frame=null};
 try{
  const line={style:{}},input={},ruler={getBoundingClientRect:()=>({left:10})},seeks=[];
  const timeline=Object.create(Timeline.prototype);Object.assign(timeline,{root:{querySelector:s=>s==='.tl-playhead'?line:s==='[data-tl-time]'?input:ruler},model:{duration:10},px:10,seekTime:t=>seeks.push(t),render(){throw Error('Should not rebuild')}});
  const target={setPointerCapture(){}};const event=x=>({clientX:x,pointerId:1,button:0,currentTarget:target,type:'pointermove',preventDefault(){},stopPropagation(){}});
  timeline.scrub(event(30));assert.equal(timeline.at,2);target.onpointermove(event(-20));assert.equal(timeline.at,0);target.onpointermove(event(500));assert.equal(timeline.at,10);assert.equal(line.style.left,'180px');
  frame();assert.deepEqual(seeks,[10]);target.onpointerup({...event(60),type:'pointerup'});assert.equal(timeline.at,5);assert.equal(timeline.scrubbing,false);assert.equal(seeks.at(-1),5);
 }finally{globalThis.requestAnimationFrame=previous.request;globalThis.cancelAnimationFrame=previous.cancel;}
});
