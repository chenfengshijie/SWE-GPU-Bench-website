'use strict';
const {results,labels}=JSON.parse(document.querySelector('#page-data').textContent);
let setting='agent';
const search=document.querySelector('#model-search');
const sort=document.querySelector('#sort-results');
function render(){
 let shown=0;
 for(const coverage of ['current','historical']){
  const rows=results.filter(r=>r.setting===setting&&r.coverage===coverage&&r.model.toLowerCase().includes(search.value.trim().toLowerCase())).sort((a,b)=>sort.value==='model'?a.model.localeCompare(b.model):b[sort.value]-a[sort.value]||a.model.localeCompare(b.model));
  const table=document.querySelector(`#${coverage}-table`);
  table.querySelector('tbody').replaceChildren(...rows.map(r=>{
   const tr=document.createElement('tr');
   for(const key of ['model','framework','patch','compile','test']){
    const cell=document.createElement(key==='model'?'th':'td');
    if(key==='model')cell.scope='row';
    if(key==='test'){
     cell.className='test-column';const score=document.createElement('span');score.className='score';score.style.setProperty('--score',`${r.test}%`);score.textContent=r.test.toFixed(1);cell.append(score);
    }else cell.textContent=typeof r[key]==='number'?r[key].toFixed(1):r[key];
    tr.append(cell);
   }
   return tr;
  }));
  const headers=table.querySelectorAll('thead th');
  for(const [i,key] of ['model','framework','patch','compile','test'].entries()){
   headers[i].removeAttribute('aria-sort');
   headers[i].textContent=headers[i].textContent.replace(/ [↓↑]$/,'');
   if(key===sort.value){headers[i].setAttribute('aria-sort',key==='model'?'ascending':'descending');headers[i].textContent+=key==='model'?' ↑':' ↓';}
  }
  table.parentElement.querySelector('.empty-state').hidden=rows.length!==0;
  if(coverage==='current')shown=rows.length;
 }
 document.querySelector('#results-count').textContent=`${shown} ${labels.resultCount}`;
}
document.querySelectorAll('[data-setting]').forEach(button=>button.addEventListener('click',()=>{
 setting=button.dataset.setting;
 document.querySelectorAll('[data-setting]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 render();
}));
search.addEventListener('input',render);sort.addEventListener('change',render);render();
const languageLink=document.querySelector('[data-language-link]');
const languageBase=languageLink.getAttribute('href');
function syncLanguageLink(){languageLink.setAttribute('href',languageBase+location.hash);}
window.addEventListener('hashchange',syncLanguageLink);syncLanguageLink();
const dialog=document.querySelector('#figure-dialog');
let lastFigure;
document.querySelectorAll('[data-figure]').forEach(button=>button.addEventListener('click',()=>{
 lastFigure=button;
 const img=dialog.querySelector('img');img.src=button.dataset.figure;img.alt=button.querySelector('img').alt;
 dialog.querySelector('p').textContent=button.closest('figure').querySelector('figcaption').textContent;
 dialog.showModal();document.querySelector('#close-figure').focus();
}));
document.querySelector('#close-figure').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>lastFigure?.focus());
document.querySelector('#copy-citation').addEventListener('click',async()=>{
 const status=document.querySelector('#copy-status');
 try{await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);status.textContent=labels.copied;}
 catch{const range=document.createRange();range.selectNodeContents(document.querySelector('#bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent=labels.copyFailed;}
});
