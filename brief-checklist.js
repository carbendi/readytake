const words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,twenty:20,thirty:30};
const quantity='(\\d+|'+Object.keys(words).join('|')+')';
export function checklistFromBrief(text){
 const result=[];
 for(let line of text.split(/\r?\n|;/)){line=line.replace(/^\s*(?:[-*•]|\[[ xX]\]|\d+[.)])\s*/, '').trim();if(!line||line.endsWith(':'))continue;
  const specific=new RegExp('\\b'+quantity+'\\s+(talking[ -]heads?(?:\\s+videos?)?|product\\s+(?:videos?|shots?)|testimonials?(?:\\s+videos?)?|tutorials?(?:\\s+videos?)?|unboxing(?:\\s+videos?)?)','gi');
  let matches=[...line.matchAll(specific)];if(!matches.length)matches=[...line.matchAll(new RegExp('\\b'+quantity+'\\s+(videos?)','gi'))];
  if(matches.length){for(const match of matches){const count=Number(match[1])||words[match[1].toLowerCase()],label=match[2].replace(/^./,v=>v.toUpperCase());if(count+result.length>200)throw Error('Drafts support up to 200 checklist items. Split this brief into smaller sections.');for(let i=1;i<=count;i++)result.push(label+' · '+i+' of '+count);}}
  else result.push(line);
  if(result.length>200)throw Error('Drafts support up to 200 checklist items. Split this brief into smaller sections.');
 }
 return result.slice(0,200);
}
