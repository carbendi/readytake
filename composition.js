import {drawCaption,drawLogo} from './renderer.js';

// Both playback and export use these rules for overlaps and graphics.
export function frameAt(main,broll,time){
 const base=main.find(c=>time>=c.at&&time<c.at+c.length)||main.at(-1);
 let visual=base;
 for(const c of broll){const at=Number(c.startAt)||0,length=(c.trimEnd??c.duration)-(c.trimStart||0);if(time>=at&&time<at+length)visual=c;}
 return {base,visual,sourceTime:visual===base?(base?.start||0)+time-(base?.at||0):(visual?.trimStart||0)+time-(Number(visual?.startAt)||0)};
}
export function paintComposition({ctx,renderer,offscreen,video,w,h,kit,logo,options,time}){
 renderer.draw(video,w,h,Number(kit.lutStrength)/100);ctx.drawImage(offscreen,0,0,w,h);
 if(options.logo)drawLogo(ctx,logo,w,h,{size:kit.logoSize,position:kit.logoPosition});
 if(options.captions){const text=options.cues.length?options.cues.filter(c=>time>=c.start&&time<c.end).map(c=>c.text).join('\n'):options.captionText;drawCaption(ctx,text,w,h,{size:kit.captionSize,color:kit.captionColor,font:kit.fontFamily||'system-ui'});}
}
