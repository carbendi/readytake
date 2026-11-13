import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';

const root=new URL('../',import.meta.url), out=new URL('native-web/',root);
await rm(out,{recursive:true,force:true});
await mkdir(new URL('pdf-reader/',out),{recursive:true});
for(const file of await readdir(root)){
 if((/^[a-z][a-z0-9-]*\.js$/.test(file)&&file!=='ai-local-server.js')||['styles.css','ios-interface.css','icon.svg'].includes(file)){
  await cp(new URL(file,root),new URL(file,out));
 }
}
const pdf=new URL('node_modules/pdfjs-dist/',root);
for(const file of ['legacy/build/pdf.min.mjs','legacy/build/pdf.worker.min.mjs','LICENSE','cmaps','standard_fonts']){
 await cp(new URL(file,pdf),new URL('pdf-reader/'+file.split('/').at(-1).replace(/\.mjs$/,'.js'),out),{recursive:true});
}
const tabIcons=[
 ['kits','<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3m-11 6h16"/>','Kits'],
 ['clips','<rect x="4" y="5" width="16" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>','Clips'],
 ['audio','<path d="M4 10v4m4-7v10m4-13v16m4-13v10m4-7v4"/>','Audio'],
 ['timeline','<path d="M4 6h7m3 0h6M4 12h12m2 0h2M4 18h4m3 0h9"/>','Timeline'],
 ['export','<path d="M12 15V3m-4 4 4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/>','Export']
];
const tabs='<nav aria-label="App sections">'+tabIcons.map(([id,path,label])=>`<button data-page="${id}"><svg aria-hidden="true" viewBox="0 0 24 24" class="tab-icon">${path}</svg><span class="tab-label">${label}</span>${id==='clips'?'<span id="clip-count" aria-hidden="true">0</span>':''}</button>`).join('')+'</nav>';
const html=(await readFile(new URL('index.html',root),'utf8'))
 .replace(/<nav[^>]*>[\s\S]*?<\/nav>/,tabs)
 .replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self' blob:; worker-src 'self' blob:; font-src 'self' blob: data:; object-src 'none'; base-uri 'none'">`)
 .replace('WORKING WEB PROTOTYPE · v0.1','iPHONE · v0.1')
 .replace('ReadyTake · Local-first browser test build','ReadyTake · iPhone')
 .replace(/<link rel="manifest"[^>]+>/,'')
 .replace(/<meta name="apple-mobile-web-app-[^>]+>/g,'')
 .replace('ReadyTake · Working camera','ReadyTake')
 .replace(/href="styles.css[^"]*"/,'href="styles.css"><link rel="stylesheet" href="ios-interface.css"');
await writeFile(new URL('index.html',out),html);
