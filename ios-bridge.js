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
