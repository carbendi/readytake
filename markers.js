export function normalizeMarker(marker,duration){
 const color=['yellow','green','red'].includes(marker.color)?marker.color:(marker.priority==='exclude'?'red':'green');
 const result={...marker,color,priority:color==='red'?'exclude':color==='green'?'prefer':'review',label:String(marker.label||'').slice(0,120)};
 if(color==='red'){
  result.sourceEnd=marker.sourceEnd??Math.min(duration,marker.sourceTime+1);
  if(!Number.isFinite(result.sourceEnd)||result.sourceEnd<=marker.sourceTime||result.sourceEnd>duration)throw Error('A red marker needs an end time after its start and inside the clip.');
 }else delete result.sourceEnd;
 return result;
}
