import test from 'node:test';
import assert from 'node:assert/strict';
import {fontStack,selectedFont} from '../fonts.js';
test('caption font stacks preserve generic families and named font fallbacks',()=>{assert.equal(fontStack('serif'),'serif');assert.equal(fontStack('monospace'),'monospace');assert.equal(fontStack('Georgia'),'"Georgia",serif');assert.equal(fontStack('Courier New'),'"Courier New",monospace');assert.equal(fontStack('ReadyTake-font-client'),'"ReadyTake-font-client",sans-serif')});
test('existing client fonts stay selected while built-ins remain independently selectable',()=>{assert.equal(selectedFont({fontId:'client'}),'custom');assert.equal(selectedFont({fontId:'client',fontChoice:'serif'}),'serif');assert.equal(selectedFont({fontChoice:'custom'}),'system-ui');assert.equal(selectedFont({fontChoice:'unknown'}),'system-ui');assert.equal(selectedFont({}),'system-ui')});
