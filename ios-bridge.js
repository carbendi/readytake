// The web prototype never calls the native bridge.
export const isIPhoneApp=()=>globalThis.Capacitor?.getPlatform?.()==='ios'&&globalThis.Capacitor.isNativePlatform();

let sharing=false;
export async function shareIPhoneFile(blob,name){
 if(sharing)throw Error('Finish sharing the current file first.');
 if(!blob.size)throw Error('This file is empty.');
 sharing=true;
 const bridge=globalThis.Capacitor;
 const native=(plugin,method,options)=>bridge.nativePromise(plugin,method,options);
 const folder='readytake-share-'+globalThis.crypto.randomUUID();
 const safeName=String(name).replace(/[^\p{L}\p{N}._ -]/gu,'_').replace(/^\.+/,'').slice(-120)||'ReadyTake-file';
 const path=folder+'/'+safeName;
 try{
  const chunkSize=768*1024;
  for(let start=0;start<blob.size;start+=chunkSize){
   const bytes=new Uint8Array(await blob.slice(start,start+chunkSize).arrayBuffer());
   let raw='';
   for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));
   await native('Filesystem',start===0?'writeFile':'appendFile',{path,directory:'CACHE',data:btoa(raw),...(start===0?{recursive:true}:{})});
  }
  const {uri}=await native('Filesystem','getUri',{path,directory:'CACHE'});
  await native('Share','share',{title:safeName,files:[uri],dialogTitle:'Share from ReadyTake'});
 }catch(error){
  if(error?.message!=='Share canceled')throw error;
 }finally{
  try{await native('Filesystem','rmdir',{path:folder,directory:'CACHE',recursive:true});}catch{}
  sharing=false;
 }
}

export function nativeReadyTake(method, options={}){
 return globalThis.Capacitor.nativePromise('ReadyTakeNative',method,options);
}

export function nativeReadyTakeTask(method,options,signal){
 if(signal?.aborted)return Promise.reject(new DOMException('Cancelled','AbortError'));
 const id=crypto.randomUUID();
 const cancel=()=>nativeReadyTake('cancel',{id}).catch(()=>{});
 signal?.addEventListener('abort',cancel,{once:true});
 return nativeReadyTake(method,{...options,id}).then(result=>{
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  return result;
 },error=>{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');throw error;})
 .finally(()=>signal?.removeEventListener('abort',cancel));
}

// Matches the small SpeechRecognition interface used by the existing prompter.
export class IPhoneSpeechRecognition {
 start(){
  this.subscription=globalThis.Capacitor.addListener('ReadyTakeNative','speech',event=>{
   if(event.text){this.lastText=event.text;this.receivedFinal=Boolean(event.final);const result=[{transcript:event.text}];result.isFinal=Boolean(event.final);this.onresult?.({resultIndex:0,results:[result]});}
   if(event.ended){if(!this.interimResults&&this.lastText&&!this.receivedFinal){const result=[{transcript:this.lastText}];result.isFinal=true;this.onresult?.({resultIndex:0,results:[result]});}this.finish();this.onend?.();}
  });
  nativeReadyTake('speechStart',{language:this.lang,words:this.words||[]}).catch(error=>{
   if(!this.subscription)return;
   this.finish();this.onerror?.({error:error.message||'Speech recognition unavailable'});this.onend?.();
  });
 }
 finish(){this.subscription?.remove();this.subscription=null;}
 stop(){if(!this.subscription)return;if(!this.interimResults&&this.lastText&&!this.receivedFinal){const result=[{transcript:this.lastText}];result.isFinal=true;this.onresult?.({resultIndex:0,results:[result]});}this.finish();nativeReadyTake('speechStop').catch(()=>{});this.onend?.();}
}
