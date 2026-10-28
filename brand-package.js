import {readZip} from './read-zip.js';
export async function readBrandPackage(file){
 const entries=await readZip(file,{accept:name=>/\.(png|ttf|otf|txt|md|docx)$/i.test(name)}),logos=[],fonts=[],briefs=[];
 for(const entry of entries){const ext=entry.name.split('.').at(-1).toLowerCase();if(ext==='png')logos.push(entry);else if(['ttf','otf'].includes(ext))fonts.push(entry);else if(ext==='docx'){const parts=await readZip(entry.blob,{accept:name=>name==='word/document.xml'}),part=parts[0];if(part){const xml=new DOMParser().parseFromString(await part.blob.text(),'application/xml');if(xml.querySelector('parsererror'))throw Error('Could not read the Word brief.');const text=[...xml.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).join('\n');briefs.push({name:entry.name,text});}}else briefs.push({name:entry.name,text:await entry.blob.text()});}
 logos.sort((a,b)=>Number(/logo/i.test(b.name))-Number(/logo/i.test(a.name)));return {logos,fonts,briefs};
}
