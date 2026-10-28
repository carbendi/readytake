export const builtInFonts=[['system-ui','System sans'],['sans-serif','Sans serif'],['serif','Serif'],['monospace','Monospace'],['Arial','Arial'],['Georgia','Georgia'],['Verdana','Verdana'],['Trebuchet MS','Trebuchet MS'],['Courier New','Courier New']];
export function fontStack(family='system-ui'){
 const generic=['system-ui','sans-serif','serif','monospace'];
 if(generic.includes(family))return family;
 const fallback=family==='Georgia'?'serif':family==='Courier New'?'monospace':'sans-serif';
 return JSON.stringify(family)+','+fallback;
}
export function selectedFont(kit){const choice=kit.fontChoice||(kit.fontId?'custom':'system-ui');return choice==='custom'&&kit.fontId?'custom':builtInFonts.some(([value])=>value===choice)?choice:'system-ui';}
