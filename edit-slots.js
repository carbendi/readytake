export const slotKeys=['script','target','voiceOffset','voiceoverId','voiceoverName','musicId','musicName'];
export function ensureSlots(kit,id){
 if(!kit.slots?.length){const state={script:kit.script||'',target:kit.target||'30',voiceOffset:kit.voiceOffset||0};for(const key of slotKeys)if(kit[key]!==undefined)state[key]=kit[key];kit.slots=[{id:id(),name:'Video 1',state}];}
 if(!kit.slots.some(s=>s.id===kit.activeSlotId))kit.activeSlotId=kit.slots[0].id;
 const selected=kit.slots.find(s=>s.id===kit.activeSlotId);selected.state??={};for(const key of ['voiceoverId','voiceoverName','musicId','musicName'])if(!(key in selected.state))selected.state[key]=null;return selected;
}
export function createEditSlot(kit,id,name){ensureSlots(kit,id);const slot={id:id(),name:String(name||`Video ${kit.slots.length+1}`).trim().slice(0,80),state:{script:'',target:kit.target||'30',voiceOffset:0,voiceoverId:null,voiceoverName:null,musicId:null,musicName:null}};kit.slots.push(slot);return slot;}
export function slotClips(items,kit,slotId){return items.filter(c=>c.kind==='clip'&&c.kitId===kit.id&&(c.slotId||kit.slots[0].id)===slotId).map(c=>({...c,blob:c.sourceId?items.find(s=>s.id===c.sourceId)?.blob:c.blob})).sort((a,b)=>a.order-b.order);}
export function linkClip(source,slotId,id,order){const {blob,...metadata}=source;return {...metadata,id,kind:'clip',sourceId:source.sourceId||source.id,slotId,order,include:true,markers:(source.markers||[]).map(m=>({...m}))};}
