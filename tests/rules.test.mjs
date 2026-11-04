import test from 'node:test';
import assert from 'node:assert/strict';
import bank from '../data.js';
import {valid,countSolutions} from '../puzzle-engine.mjs';
for(const level of bank)for(const p of level)test(p.id+' has exactly one valid solution',()=>{assert(valid(p,p.solution));assert.equal(countSolutions(p),1);assert(!valid(p,Array(p.n*p.n).fill(0)));});
