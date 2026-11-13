import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';

const port=8787, host='127.0.0.1:'+port;
const routes={
 openai:{base:'https://api.openai.com/v1/',generate:'responses',headers:key=>({Authorization:'Bearer '+key})},
 claude:{base:'https://api.anthropic.com/v1/',generate:'messages',headers:key=>({'x-api-key':key,'anthropic-version':'2023-06-01'})}
};
const reply=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(data));
createServer(async(req,res)=>{
 if(req.headers.host!==host||(req.headers.origin&&req.headers.origin!=='http://'+host))return reply(res,403,{});
 const path=(req.url||'/').split('?')[0];
 if(path==='/api/ai/health'&&req.method==='GET')return reply(res,200,{readyTakeAI:true});
 const match=/^\/api\/ai\/(openai|claude)\/(models|generate)$/.exec(path);
 if(match){
  const [,provider,action]=match,route=routes[provider],key=req.headers['x-readytake-key'],generate=action==='generate';
  if(req.method!==(generate?'POST':'GET')||!key)return reply(res,400,{});
  try{
   let body;
   if(generate){
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>1024*1024)return reply(res,413,{});chunks.push(chunk);}
    body=Buffer.concat(chunks).toString('utf8');
   }
   const upstream=await fetch(route.base+(generate?route.generate:'models'+(provider==='claude'?'?limit=100':'')),{
    method:req.method,headers:{...route.headers(key),...(generate?{'Content-Type':'application/json'}:{})},body,redirect:'error',signal:AbortSignal.timeout(180000)
   });
   return reply(res,upstream.status,upstream.ok?await upstream.json():{});
  }catch{return reply(res,502,{});}
 }
 const file=path==='/'?'index.html':path.slice(1);
 if(req.method!=='GET'||!(/^[a-z][a-z0-9-]*\.js$/.test(file)&&file!=='ai-local-server.js'||['styles.css','index.html','icon.svg','manifest.webmanifest'].includes(file)))return reply(res,404,{});
 try{const data=await readFile(new URL('./'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.webmanifest')?'application/manifest+json':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(data);}
 catch{return reply(res,404,{});}
}).listen(port,'127.0.0.1',()=>process.stdout.write('ReadyTake: http://'+host+'\n'));
