export function duplicateBrandKit(source,items,id){
 const kit=JSON.parse(JSON.stringify(source));kit.id=id();kit.name=source.name+' copy';delete kit.placeholder;
 const slotIds=new Map((kit.slots||[]).map(slot=>[slot.id,id()]));
 for(const slot of kit.slots||[])slot.id=slotIds.get(slot.id);
 kit.activeSlotId=slotIds.get(source.activeSlotId)||kit.slots?.[0]?.id;
 const clips=items.filter(c=>c.kind==='clip'&&c.kitId===source.id).map(c=>{const {blob,...metadata}=c;return {...metadata,id:id(),kitId:kit.id,slotId:slotIds.get(c.slotId||source.slots?.[0]?.id),sourceId:c.sourceId||c.id,markers:(c.markers||[]).map(m=>({...m}))};});
 return {kit,clips};
}
