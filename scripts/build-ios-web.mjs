import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';

const root=new URL('../',import.meta.url), out=new URL('native-web/',root);
await rm(out,{recursive:true,force:true});
await mkdir(new URL('pdf-reader/',out),{recursive:true});
for(const file of await readdir(root)){
 if((/^[a-z][a-z0-9-]*\.js$/.test(file)&&file!=='ai-local-server.js')||['styles.css','icon.svg'].includes(file)){
  await cp(new URL(file,root),new URL(file,out));
 }
}
const pdf=new URL('node_modules/pdfjs-dist/',root);
for(const file of ['legacy/build/pdf.min.mjs','legacy/build/pdf.worker.min.mjs','LICENSE','cmaps','standard_fonts']){
 await cp(new URL(file,pdf),new URL('pdf-reader/'+file.split('/').at(-1),out),{recursive:true});
}
const html=(await readFile(new URL('index.html',root),'utf8'))
 .replace('WORKING WEB PROTOTYPE · v0.1','iPHONE · v0.1')
 .replace('ReadyTake · Local-first browser test build','ReadyTake · iPhone')
 .replace(/<link rel="manifest"[^>]+>/,'')
 .replace(/<meta name="apple-mobile-web-app-[^>]+>/g,'')
 .replace('ReadyTake · Working camera','ReadyTake')
 .replace(/href="styles.css[^"]*"/,'href="styles.css"');
await writeFile(new URL('index.html',out),html);
