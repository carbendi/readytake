export function normalizeMarker(marker,duration){
 const color=['yellow','green','red'].includes(marker.color)?marker.color:(marker.priority==='exclude'?'red':'green');
 const result={...marker,color,priority:color==='red'?'exclude':color==='green'?'prefer':'review',label:String(marker.label||'').slice(0,120)};
 delete result.sourceEnd;
 if(color==='red')result.boundaryMode='ai';
 else delete result.boundaryMode;
 return result;
}
