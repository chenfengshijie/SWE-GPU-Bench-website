import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const data=JSON.parse(await readFile(resolve(root,'data/results.json'),'utf8'));
assert.equal(data.results.length,29);assert.equal(data.perfResults.length,5);
assert.equal(data.generalTasks+data.perfTasks,data.paperTasks);
for(const r of data.results){
 assert.ok(['current','historical'].includes(r.coverage));
 for(const k of ['patch','compile','test'])assert.ok(Number.isFinite(r[k])&&r[k]>=0&&r[k]<=100);
 assert.equal(r.denominator,r.coverage==='current'?378:null);
 assert.ok(r.source);assert.ok(r.framework);
}
for(const language of ['', 'zh/']){
 const file=resolve(root,'dist',language,'index.html');const html=await readFile(file,'utf8');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const link=m[1];if(/^(https?:|mailto:)/.test(link))continue;
  if(link.startsWith('#')){assert.ok(ids.has(link.slice(1)),`Missing anchor: ${link}`);continue;}
  const path=resolve(dirname(file),link.split('#')[0]);await stat(path.endsWith('/')?path+'index.html':path);
 }
 for(const image of html.matchAll(/<img\b[^>]+>/g))assert.match(image[0],/\balt="/);
 assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));
 const embedded=JSON.parse(html.match(/<script type="application\/json" id="page-data">(.*?)<\/script>/s)[1]);
 assert.deepEqual(embedded.results,data.results);
}
const pdf=await readFile(resolve(root,'public/assets/SWE-GPU-Bench.pdf'));assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
console.log('Validated bilingual pages, asset links, anchors, result ranges, coverage metadata, and PDF.');
