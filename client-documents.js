import {isIPhoneApp} from './ios-bridge.js';
import {readZip} from './read-zip.js';

export const callSheetFields=[
 ['schedule','Schedule / call times'],['shots','What to shoot'],['locations','Locations / access'],
 ['contacts','Contacts'],['invoicing','Invoicing / PO details'],['notes','Other project details']
];

export async function readClientDocument(file,{loadPDF=(base,name)=>import(base+name)}={}){
 const name=file.name||'Client document',ext=name.split('.').at(-1).toLowerCase();
 if(!/^(pdf|docx|txt|md)$/.test(ext))throw Error('Choose a PDF, DOCX, TXT or Markdown file.');
 if(file.size>20*1024*1024)throw Error('Choose a document smaller than 20 MB.');
 let text='',warning='';
 if(ext==='pdf'){
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!new TextDecoder().decode(bytes.subarray(0,1024)).includes('%PDF-'))throw Error('This file is not a valid PDF.');
  let task;
  try{
   const native=isIPhoneApp();
   const base=native?new URL('./pdf-reader/',import.meta.url).href:'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/legacy/build/';
   const pdf=await loadPDF(base,native?'pdf.min.js':'pdf.min.mjs');
   pdf.GlobalWorkerOptions.workerSrc||=base+(native?'pdf.worker.min.js':'pdf.worker.min.mjs');
   task=pdf.getDocument({data:bytes,isEvalSupported:false,disableFontFace:true,useWasm:false,...(native?{cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/'}:{})});
   const doc=await task.promise, pages=[];
   for(let i=1;i<=Math.min(doc.numPages,50);i++){
    const page=await doc.getPage(i),content=await page.getTextContent();
    pages.push(content.items.map(item=>item.str===undefined?'':item.str+(item.hasEOL?'\n':' ')).join('').trim());
    page.cleanup();
   }
   text=pages.join('\n\n').trim();
   if(!text)warning='No selectable text found. You can open the original PDF or paste the details manually.';
   else if(doc.numPages>50)warning='Text was extracted from the first 50 pages. The original PDF has all pages.';
  }catch{warning='Text extraction was unavailable. You can still open the original PDF or paste the details manually.';}
  finally{try{await task?.destroy()}catch{}}
 }else if(ext==='docx'){
  const [part]=await readZip(file,{accept:name=>name==='word/document.xml'});
  if(!part)throw Error('Could not find text in the Word document.');
  const xml=new DOMParser().parseFromString(await part.blob.text(),'application/xml');
  if(xml.querySelector('parsererror'))throw Error('Could not read the Word document.');
  text=[...xml.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).join('\n');
 }else text=await file.text();
 return {name,text:text.slice(0,100000),warning,blob:ext==='pdf'?new Blob([file],{type:'application/pdf'}):null};
}

// Copy only text under explicit headings; keep the full source for anything unmatched.
export function callSheetSections(text){
 const fields={},patterns={
  schedule:/^(?:schedule|shoot schedule|timeline|call times?|shoot times?)/i,
  shots:/^(?:shot list|what to shoot|deliverables|shoot list)/i,
  locations:/^(?:locations?|venue|address|access|parking)/i,
  contacts:/^(?:contacts?|key contacts?|crew contacts?)/i,
  invoicing:/^(?:invoicing(?: details)?|billing(?: details)?|invoice(?: details)?|purchase order|po(?: number)?)/i,
  notes:/^(?:notes|other project details|additional information)/i
 };
 let current;
 for(const line of text.split(/\r?\n/)){
  const value=line.trim();if(!value)continue;
  const heading=Object.entries(patterns).find(([,pattern])=>{const match=pattern.exec(value);return match&&/^\s*(?::|$)/.test(value.slice(match[0].length));});
  if(heading){current=heading[0];const rest=value.replace(heading[1],'').replace(/^\s*:\s*/,'');if(rest)fields[current]=[fields[current],rest].filter(Boolean).join('\n');}
  else if(current)fields[current]=[fields[current],value].filter(Boolean).join('\n');
 }
 return Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,value.slice(0,10000)]));
}
