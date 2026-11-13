import {readZip} from './read-zip.js';
import {readClientDocument} from './client-documents.js';
export async function readBrandPackage(file){
 const entries=await readZip(file,{accept:name=>/\.(png|ttf|otf|txt|md|docx|pdf)$/i.test(name)}),logos=[],fonts=[],briefs=[],callSheets=[];
 for(const entry of entries){
  const ext=entry.name.split('.').at(-1).toLowerCase();
  if(ext==='png')logos.push(entry);
  else if(['ttf','otf'].includes(ext))fonts.push(entry);
  else{
   const doc=await readClientDocument(Object.assign(entry.blob,{name:entry.name}));
   (/call[\s_.-]*sheet/i.test(entry.name)?callSheets:briefs).push(doc);
  }
 }
 logos.sort((a,b)=>Number(/logo/i.test(b.name))-Number(/logo/i.test(a.name)));return {logos,fonts,briefs,callSheets};
}
