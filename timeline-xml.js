import {sequence,renderDimensions} from './core.js';

const xml=value=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const mediaPath=entry=>'Media/'+encodeURIComponent(entry.file);
export function makeTimelineExchange({clips,kit,name,voiceover,music,mediaFolder}){
 const folder=String(mediaFolder||'').trim().replace(/\/+$/,'');
 if(folder&&!folder.startsWith('/'))throw Error('Enter an absolute media folder path starting with /.');
 const link=entry=>folder?'file://'+folder.split('/').map(encodeURIComponent).join('/')+'/'+encodeURIComponent(entry.file):'file:///ReadyTake/'+mediaPath(entry);
 const main=sequence(clips),fps=[24,25,30,50,60].includes(Number(kit.fps))?Number(kit.fps):25;
 if(!main.length)throw Error('Select at least one A-roll clip to export a timeline.');
 const [width,height]=renderDimensions(1080,kit.aspect||'9:16');
 const frames=value=>Math.round(Number(value||0)*fps), time=value=>frames(value)+'/'+fps+'s';
 const duration=main.reduce((n,c)=>n+c.length,0), media=[],byId=new Map();
 function source(clip,audio=false){
  const key=clip.sourceId||clip.id;
  if(byId.has(key))return byId.get(key);
  const safe=String(clip.name||'media').replace(/[^\p{L}\p{N}._ -]/gu,'_').slice(-100);
  const item={id:'r'+(media.length+2),file:(media.length+1)+'-'+safe,blob:clip.blob,duration:clip.duration,audio};
  if(!item.blob)throw Error('An original media file is missing.');
  media.push(item);byId.set(key,item);return item;
 }
 const primary=main.map(c=>({source:source(c),name:c.name,at:c.at,in:c.start,out:c.end,markers:c.markers||[]}));
 const extras=clips.filter(c=>c.role==='broll'&&c.include!==false).flatMap(c=>{
  const start=Math.max(0,Number(c.startAt)||0),inside=Number(c.trimStart)||0,length=Math.min((c.trimEnd??c.duration)-inside,duration-start);
  return length>0?[{source:source(c),name:c.name,at:start,in:inside,out:inside+length,muted:true}]:[];
 });
 const audio=[];
 for(const [clip,offset,lane] of [[voiceover,Math.max(0,Number(kit.voiceOffset)||0),-1],[music,0,-2]]){
  if(!clip?.blob||!(clip.duration>0)||offset>=duration)continue;
  audio.push({source:source(clip,true),name:clip.name,at:offset,in:0,out:Math.min(clip.duration,duration-offset),lane});
 }
 const resources=media.map(m=>`<asset id="${m.id}" name="${xml(m.file)}" start="0s" duration="${time(m.duration)}" hasVideo="${m.audio?0:1}" hasAudio="1"${m.audio?'':' format="r1"'}><media-rep kind="original-media" src="${xml(link(m))}"/></asset>`).join('');
 function fcClip(c,{offset=c.at,lane,children=''}={}){
  const marks=(c.markers||[]).filter(m=>m.sourceTime>=c.in&&m.sourceTime<c.out).map(m=>`<marker start="${time(m.sourceTime)}" duration="1/${fps}s" value="${xml(m.label||m.color+' marker')}"/>`).join('');
  return `<asset-clip ref="${c.source.id}" name="${xml(c.name)}" offset="${time(offset)}" start="${time(c.in)}" duration="${Math.max(1,frames(c.out)-frames(c.in))}/${fps}s"${lane?` lane="${lane}"`:''}${c.muted?' audioRole="dialogue"':''}>${c.muted?'<adjust-volume amount="-96dB"/>':''}${children}${marks}</asset-clip>`;
 }
 const spine=primary.map((c,i)=>{
  const list=[...extras.map((v,j)=>({...v,lane:j+1})),...audio];
  const boundary=primary[i+1]?.at??duration;
  const children=list.flatMap(v=>{
   const start=Math.max(v.at,c.at),end=Math.min(v.at+v.out-v.in,boundary);
   if(end-start<.5/fps)return [];
   return [fcClip({...v,in:v.in+start-v.at,out:v.in+end-v.at},{lane:v.lane,offset:c.in+start-c.at})];
  }).join('');
  return fcClip(c,{children});
 }).join('');
 const fcpxml=`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n<fcpxml version="1.10"><resources><format id="r1" frameDuration="1/${fps}s" width="${width}" height="${height}"/>${resources}</resources><library><event name="ReadyTake"><project name="${xml(name)}"><sequence format="r1" duration="${time(duration)}" tcStart="0s" tcFormat="NDF"><spine>${spine}</spine></sequence></project></event></library></fcpxml>`;
 const rate=`<rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>`;
 let next=0;
 function legacy(c,video){
  const n=++next,m=c.source,path=link(m);
  return `<clipitem id="clip-${n}"><name>${xml(c.name)}</name><duration>${frames(m.duration)}</duration>${rate}<start>${frames(c.at)}</start><end>${frames(c.at+c.out-c.in)}</end><in>${frames(c.in)}</in><out>${frames(c.out)}</out><file id="file-${n}"><name>${xml(m.file)}</name><pathurl>${xml(path)}</pathurl>${rate}<duration>${frames(m.duration)}</duration><media>${m.audio?'':`<video><samplecharacteristics><width>${width}</width><height>${height}</height></samplecharacteristics></video>`}<audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media></file><sourcetrack><mediatype>${video?'video':'audio'}</mediatype><trackindex>1</trackindex></sourcetrack></clipitem>`;
 }
 const track=content=>'<track>'+content+'</track>';
 const premiere=`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="5"><sequence><name>${xml(name)}</name><duration>${frames(duration)}</duration>${rate}<media><video><format><samplecharacteristics>${rate}<width>${width}</width><height>${height}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>${track(primary.map(c=>legacy(c,true)).join(''))}${extras.map(c=>track(legacy(c,true))).join('')}</video><audio>${track(primary.map(c=>legacy(c,false)).join(''))}${audio.map(c=>track(legacy(c,false))).join('')}</audio></media></sequence></xmeml>`;
 return {fcpxml,premiere,media};
}
