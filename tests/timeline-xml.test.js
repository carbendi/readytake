import test from 'node:test';
import assert from 'node:assert/strict';
import {makeTimelineExchange} from '../timeline-xml.js';

test('timeline exchange retains original media, trims, timed B-roll and editable voice',()=>{
 const clip={id:'first',name:'A & B.mov',duration:10,trimStart:2,trimEnd:6,role:'aroll',blob:new Blob(['original'])};
 const broll={...clip,id:'broll',name:'B-roll.mov',role:'broll',startAt:1,trimStart:1,trimEnd:3};
 const voiceover={id:'voice',name:'Voice.m4a',duration:2,blob:new Blob(['audio'])};
 const out=makeTimelineExchange({clips:[clip,broll],voiceover,kit:{aspect:'9:16',fps:25,voiceOffset:1},name:'A & B',mediaFolder:'/Volumes/My Drive/Media'});
 assert.equal(out.media[0].blob,clip.blob);
 assert.match(out.fcpxml,/project name="A &amp; B"/);
 assert.match(out.fcpxml,/file:\/\/\/Volumes\/My%20Drive\/Media\//);
 assert.match(out.fcpxml,/start="50\/25s" duration="100\/25s"/);
 assert.match(out.fcpxml,/lane="1"/);assert.match(out.fcpxml,/lane="-1"/);
 assert.match(out.premiere,/<xmeml version="5">/);assert.match(out.premiere,/<in>50<\/in><out>150<\/out>/);
});
