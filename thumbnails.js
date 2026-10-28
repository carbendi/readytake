// Decode one small still at a time to avoid opening many video decoders on phones.
const cache=new Map();let queue=Promise.resolve();
export function thumbnailFor(clip){
 const at=Math.max(0,Math.min(Number(clip.trimStart)||0,Math.max(0,clip.duration-.05))),key=clip.id+':'+at;
 if(cache.has(key))return cache.get(key);
 const result=queue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{
  const video=document.createElement('video'),url=URL.createObjectURL(clip.blob);let done=false;
  video.muted=true;video.playsInline=true;video.preload='auto';
  const finish=(error,data)=>{if(done)return;done=true;clearTimeout(timer);video.onloadeddata=video.onseeked=video.onerror=null;video.removeAttribute('src');video.load();URL.revokeObjectURL(url);error?reject(error):resolve(data)};
  const timer=setTimeout(()=>finish(Error('Thumbnail unavailable')),8000);
  const draw=()=>{try{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=Math.max(1,Math.round(160*video.videoHeight/video.videoWidth));if(!video.videoWidth)throw Error('No frame');canvas.height=Math.min(284,canvas.height);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);finish(null,canvas.toDataURL('image/jpeg',.65));}catch(err){finish(err)}};
  video.onerror=()=>finish(Error('Thumbnail unavailable'));
  video.onloadeddata=()=>{if(at>.025){video.onseeked=draw;video.currentTime=at;}else draw()};video.src=url;video.load();
 }));
 queue=result.catch(()=>{});cache.set(key,result);result.catch(()=>cache.delete(key));if(cache.size>100)cache.delete(cache.keys().next().value);return result;
}
