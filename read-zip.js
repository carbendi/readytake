import {crc32} from './zip.js';
export async function readZip(blob,{accept=()=>true,maxBytes=100*1024*1024,maxEntries=200}={}){
 if(blob.size>maxBytes)throw Error('ZIP exceeds the 100 MB import limit.');
 const bytes=new Uint8Array(await blob.arrayBuffer()),view=new DataView(bytes.buffer),decode=new TextDecoder();let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(view.getUint32(p,true)===0x06054b50&&p+22+view.getUint16(p+20,true)===bytes.length){end=p;break}
 if(end<0)throw Error('This file is not a supported ZIP archive.');
 const count=view.getUint16(end+10,true);if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||count===65535)throw Error('Multipart and ZIP64 archives are not supported.');if(count>maxEntries)throw Error('ZIP contains too many files.');
 let pos=view.getUint32(end+16,true),total=0;const entries=[];
 for(let i=0;i<count;i++){
  if(pos+46>end||view.getUint32(pos,true)!==0x02014b50)throw Error('Invalid ZIP directory.');
  const flags=view.getUint16(pos+8,true),method=view.getUint16(pos+10,true),crc=view.getUint32(pos+16,true),compressed=view.getUint32(pos+20,true),size=view.getUint32(pos+24,true),nameLength=view.getUint16(pos+28,true),extra=view.getUint16(pos+30,true),comment=view.getUint16(pos+32,true),offset=view.getUint32(pos+42,true);
  if(pos+46+nameLength+extra+comment>end)throw Error('Invalid ZIP entry name.');const name=decode.decode(bytes.subarray(pos+46,pos+46+nameLength));pos+=46+nameLength+extra+comment;
  if(name.endsWith('/')||name.startsWith('__MACOSX/')||name.split('/').some(v=>v.startsWith('.')))continue;
  if(!accept(name))continue;if(flags&1)throw Error('Password-protected ZIP files are not supported.');if(![0,8].includes(method))throw Error('Unsupported ZIP compression for '+name);
  total+=size;if(size>25*1024*1024||total>maxBytes)throw Error('Expanded ZIP assets exceed the import size limit.');
  if(offset+30>bytes.length||view.getUint32(offset,true)!==0x04034b50)throw Error('Invalid ZIP entry.');const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true);if(start+compressed>bytes.length)throw Error('Truncated ZIP entry.');let data=bytes.slice(start,start+compressed);
  if(method===8){let decompressor;try{decompressor=new DecompressionStream('deflate-raw')}catch{throw Error('This browser cannot unpack this ZIP. Extract it in Files, then import its assets individually.');}const reader=new Blob([data]).stream().pipeThrough(decompressor).getReader(),chunks=[];let length=0;try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>size||length>maxBytes){await reader.cancel();throw Error('Expanded ZIP exceeds its declared size.');}chunks.push(part.value)}}finally{reader.releaseLock()}data=new Uint8Array(length);let cursor=0;for(const chunk of chunks){data.set(chunk,cursor);cursor+=chunk.length}}
  if(data.length!==size||crc32(data)!==crc)throw Error('ZIP integrity check failed for '+name);entries.push({name,blob:new Blob([data])});
 }
 return entries;
}
