import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import {content} from '../src/content.mjs';
const data=JSON.parse(await readFile(new URL('../data/results.json',import.meta.url),'utf8'));
const root=new URL('../',import.meta.url);
const figureSizes={};
for(const name of ['EvaluationPipeline','DataPipeline','fig_repo_pie','fig_lang_bar','fig_task_bar']){
 const png=await readFile(new URL(`public/assets/${name}.png`,root));
 figureSizes[name]={width:png.readUInt32BE(16),height:png.readUInt32BE(20)};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url='https://chenfengshijie.github.io/SWE-GPU-Bench-website/';
const icons={
 paper:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 data:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
 chart:'<path d="M4 3v17h17M9 15V9M14 15V5M19 15v-4"/>',
 code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 expand:'<path d="M14 3h7v7m0-7-7 7M3 14v7h7m-7 0 7-7"/>',
 check:'<path d="m5 12 4 4L19 6"/>'
};
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const bib=`@misc{chen2026swegpubench,
  title = {SWE-GPU-Bench: Can Language Models Solve Real-World GPU Software Engineering Tasks?},
  author = {Chen, Feng and Liu, Binbin and Han, Wenhan and Zheng, Yin},
  year = {2026},
  url = {${url}}
}`;
await rm(new URL('dist/',root),{recursive:true,force:true});
await mkdir(new URL('dist/zh/',root),{recursive:true});
await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
await cp(new URL('data/',root),new URL('dist/data/',root),{recursive:true});
await cp(new URL('src/styles.css',root),new URL('dist/assets/styles.css',root));
await cp(new URL('src/app.js',root),new URL('dist/assets/app.js',root));
for(const locale of ['en','zh']){
 const t=content[locale],p=locale==='en'?'./':'../';
 const figure=(name,caption,cls='')=>{
  const index=['EvaluationPipeline','DataPipeline','fig_repo_pie','fig_lang_bar','fig_task_bar'].indexOf(name);
  return `<figure class="paper-figure ${cls}"><button class="figure-button" type="button" data-figure="${p}assets/${name}.png" aria-label="${esc(t.zoom+': '+caption)}"><span class="figure-topline"><span>${t.figureLabels[index]}</span><span class="expand-mark">${icon('expand')}</span></span><img src="${p}assets/${name}.png" alt="${esc(caption)}" width="${figureSizes[name].width}" height="${figureSizes[name].height}" loading="lazy"></button><figcaption>${caption}</figcaption></figure>`;
 };
 const table=(rows,id)=>`<div class="table-scroll" tabindex="0" role="region" aria-label="${esc(id==='current'?t.currentTitle:t.historicalTitle)}"><table class="results-table" id="${id}-table"><caption class="sr-only">${id==='current'?t.currentTitle:t.historicalTitle}</caption><thead><tr><th scope="col">${t.model}</th><th scope="col">${t.framework}</th><th scope="col">Patch %</th><th scope="col">Compile %</th><th scope="col" class="test-column">Test % ↓</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${esc(r.model)}</th><td><span class="framework-badge">${esc(r.framework)}</span></td><td>${r.patch.toFixed(1)}</td><td>${r.compile.toFixed(1)}</td><td class="test-column"><span class="score" style="--score:${r.test}%">${r.test.toFixed(1)}</span></td></tr>`).join('')}</tbody></table><p class="empty-state" hidden>${t.noResults}</p></div>`;
 const rows=coverage=>data.results.filter(r=>r.setting==='agent'&&r.coverage===coverage).sort((a,b)=>b.test-a.test);
 const best=rows('current')[0];
 const html=`<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SWE-GPU-Bench${locale==='zh'?' · 论文展示':''}</title><meta name="description" content="${esc(t.intro)}"><meta name="theme-color" content="#087f75"><link rel="icon" href="${p}assets/favicon.png" type="image/png"><link rel="canonical" href="${url}${locale==='zh'?'zh/':''}"><link rel="alternate" hreflang="en" href="${url}"><link rel="alternate" hreflang="zh-CN" href="${url}zh/"><link rel="alternate" hreflang="x-default" href="${url}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(data.title)}"><meta property="og:description" content="${esc(t.intro)}"><meta property="og:url" content="${url}${locale==='zh'?'zh/':''}"><meta property="og:image" content="${url}assets/gpu-llama.png"><meta name="twitter:card" content="summary_large_image"><link rel="preload" href="${p}assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${p}assets/styles.css"><script src="${p}assets/app.js" defer></script></head>
<body data-locale="${locale}"><a class="skip-link" href="#main">${t.skip}</a>
<header class="site-header"><div class="header-inner"><a href="${locale==='en'?'./':'./'}" class="brand"><img src="${p}assets/gpu-llama.webp" alt="" width="40" height="40">SWE-GPU-Bench</a><nav aria-label="${locale==='en'?'Main navigation':'主导航'}">${['overview','benchmark','results','resources'].map((id,i)=>`<a href="#${id}">${t.nav[i]}</a>`).join('')}</nav><a class="language-switch" href="${locale==='en'?'./zh/':'../'}" lang="${locale==='en'?'zh-CN':'en'}" data-language-link>${icon('globe')}${t.switchLabel}</a></div></header>
<main id="main">
<section class="hero wrap" aria-labelledby="paper-title">
 <p class="hero-eyebrow"><span class="status-dot"></span>${t.eyebrow}</p>
 <div class="hero-masthead"><img src="${p}assets/gpu-llama.webp" alt="${t.mascotAlt}" class="hero-mascot" width="180" height="180" fetchpriority="high"><div class="hero-wordmark"><p class="project-name">SWE-<span>GPU</span>-Bench</p><div class="hero-topics">${t.heroTopics.map(v=>`<span>${v}</span>`).join('')}</div></div></div>
 <h1 id="paper-title">${t.title.replace('Real-World','<span class="nowrap">Real-World</span>')}</h1>${locale==='zh'?`<p class="english-title">${data.title}</p>`:''}
 <p class="hero-intro">${t.intro}</p>
 <p class="authors">${data.authors.map((a,i)=>`<span>${esc(a)}${i===data.authors.length-1?'<sup>*</sup>':''}</span>`).join('')}</p>
 <p class="affiliation">${t.affiliation} <span>·</span> <span>* ${t.corresponding}</span></p>
 <div class="hero-actions"><a class="button primary" href="${p}assets/SWE-GPU-Bench.pdf">${icon('paper')}${t.paper}</a><a class="button secondary" href="https://huggingface.co/datasets/Froze/SWE-GPU-Bench">${icon('data')}${t.data}</a><a class="button secondary" href="#results">${icon('chart')}${t.viewResults}</a></div>
 <div class="stats">${[data.paperTasks,data.repositories,data.generalTasks,data.perfTasks].map((v,i)=>`<div><strong>${v}</strong><span>${t.stats[i]}</span></div>`).join('')}</div>
</section>
<section class="section wrap" id="overview"><div class="section-heading"><p class="eyebrow">${t.overviewLabel}</p><h2>${t.overviewTitle}</h2><p>${t.overviewText}</p></div><div class="overview-grid"><div class="stack-diagram" aria-label="${locale==='en'?'GPU software stack':'GPU 软件栈'}">${t.layers.map((l,i)=>`<div class="stack-layer"><span class="layer-symbol" aria-hidden="true">${['▦','⌘','✓'][i]}</span><div><strong>${l[0]}</strong><span>${l[1]}</span></div></div>`).join('<div class="stack-connector" aria-hidden="true">↕</div>')}</div><div class="overview-points">${t.overviewDetails.map((d,i)=>`<article><span class="point-icon">${icon(['code','data','check'][i])}</span><div><h3>${d[0]}</h3><p>${d[1]}</p></div></article>`).join('')}</div></div>${figure('EvaluationPipeline',t.evalCaption,'wide-figure')}<p class="figure-help">${t.figureHelp}</p></section>
<section class="benchmark-band" id="benchmark"><div class="wrap section"><div class="section-heading"><p class="eyebrow">${t.benchmarkLabel}</p><h2>${t.benchmarkTitle}</h2><p>${t.benchmarkText}</p></div>${figure('DataPipeline',t.constructionCaption,'wide-figure')}<div class="distribution-grid">${figure('fig_repo_pie',t.repoCaption)}${figure('fig_lang_bar',t.langCaption)}${figure('fig_task_bar',t.taskCaption)}</div><aside class="version-note"><h3>${t.versionTitle}</h3><p>${t.versionText}</p></aside></div></section>
<section class="section wrap" id="results"><div class="section-heading"><p class="eyebrow">${t.resultsLabel}</p><h2>${t.resultsTitle}</h2><p>${t.resultsText}</p></div><aside class="result-insight" aria-label="${t.resultInsightLabel}">
 <div class="insight-copy"><p class="eyebrow">${t.resultInsightLabel}</p><h3>${t.resultInsightTitle}</h3><p>${t.resultInsightText}</p></div>
 <div class="insight-score" aria-live="polite" aria-atomic="true"><span>${t.bestScore}</span><strong id="best-score">${best.test.toFixed(1)}<small>%</small></strong><p id="best-model">${esc(best.model)} · Agent</p></div>
 <div class="stage-chart"><p>${t.pipelineLabel} <strong id="stage-model">${esc(best.model)}</strong></p>${['patch','compile','test'].map((key,i)=>`<div class="stage-row"><span>${t.metricNames[i]}</span><span class="stage-track"><span id="stage-${key}" style="--stage:${best[key]}%"></span></span><strong id="stage-${key}-value">${best[key].toFixed(1)}%</strong></div>`).join('')}<small>${t.metricHelp}</small></div>
 <p class="insight-source">${t.scoreScope} <span>${t.paperReported}</span></p>
 </aside><div class="result-toolbar"><div class="segmented" role="group" aria-label="${locale==='en'?'Evaluation setting':'评测设置'}"><button type="button" data-setting="agent" aria-pressed="true">${t.agent}</button><button type="button" data-setting="oracle" aria-pressed="false">${t.oracle}</button></div><label class="search-label">${icon('search')}<span class="sr-only">${t.search}</span><input type="search" id="model-search" placeholder="${t.searchPlaceholder}" autocomplete="off"></label><label class="sort-label"><span class="sr-only">${t.sort}</span><select id="sort-results" aria-label="${t.sort}">${['test','compile','patch','model'].map((s,i)=>`<option value="${s}">${t.sortOptions[i]}</option>`).join('')}</select></label></div><div class="table-heading"><h3>${t.currentTitle}</h3><span class="tag">${t.paperReported}</span></div><p class="table-note">${t.currentNote}</p><p class="mobile-table-help">${t.tableHelp}</p>${table(rows('current'),'current')}<p id="results-count" class="table-note" aria-live="polite">5 ${t.resultCount}</p><details class="historical-results"><summary>${t.historicalToggle}</summary><h3>${t.historicalTitle}</h3><p class="table-note">${t.historicalNote}</p>${table(rows('historical'),'historical')}</details><noscript><p>${locale==='en'?'The default Agent results are shown. Enable JavaScript to switch settings, filter, or sort.':'当前展示默认 Agent 结果。启用 JavaScript 后可切换设置、搜索与排序。'}</p></noscript></section>
<section class="perf-band" id="perf"><div class="wrap section"><div class="perf-intro"><div class="section-heading"><p class="eyebrow">${t.perfLabel}</p><h2>${t.perfTitle}</h2><p>${t.perfText}</p></div><div class="perf-track"><span class="tag">${t.perfBadge}</span><div class="gate-diagram" aria-hidden="true"><span>Patch</span><i>→</i><span>Test ✓</span><i>→</i><span>Perf</span></div><p>${t.perfEyebrow}</p></div></div><div class="table-scroll" tabindex="0" role="region" aria-label="${t.perfTable}"><table class="perf-table"><caption class="sr-only">${t.perfTable}</caption><thead><tr><th scope="col">${t.model}</th><th scope="col">Patch</th><th scope="col">Compile</th><th scope="col">Test</th><th scope="col">${t.gain}</th></tr></thead><tbody>${data.perfResults.map((r,i)=>`<tr${i===0?' class="reference-row"':''}><th scope="row">${esc(r.model)}${i===0?` <small>${t.reference}</small>`:''}</th><td>${r.patch}/${r.total}</td><td>${r.compile}/${r.total}</td><td>${r.test}/${r.total}</td><td>${r.gain.toFixed(1)}%</td></tr>`).join('')}</tbody></table></div><p class="perf-note">${t.perfNote}</p></div></section>
<section class="section wrap" id="resources"><div class="section-heading"><p class="eyebrow">${t.resourcesLabel}</p><h2>${t.resourcesTitle}</h2></div><div class="resource-grid">${t.resourceCards.map((r,i)=>`<article class="resource"><span class="resource-symbol" aria-hidden="true">${icon(['paper','data','code'][i])}</span><h3>${r[0]}</h3><p>${r[1]}</p>${i===2?`<span class="unavailable">${r[2]}</span>`:`<a href="${i===0?p+'assets/SWE-GPU-Bench.pdf':'https://huggingface.co/datasets/Froze/SWE-GPU-Bench'}" ${i===0?'download':''}>${r[2]} <span aria-hidden="true">↗</span></a>`}</article>`).join('')}</div><div class="citation-block"><div class="citation-heading"><h3>${t.citation}</h3><button id="copy-citation" type="button">${t.copy}</button></div><pre class="citation"><code id="bibtex">${esc(bib)}</code></pre><span id="copy-status" role="status"></span></div><div class="contact-row"><p>${t.contact} <a href="mailto:${data.contact}">${data.contact}</a></p><p>${t.snapshot}</p></div></section>
</main><footer class="site-footer"><div class="wrap"><p>${t.footer}</p><p>${t.inspiration} <a href="https://swe-perf.github.io/">SWE-Perf</a> · <a href="https://www.swebench.com/">SWE-bench</a></p><div class="footer-links"><a href="${p}assets/gpu-llama.png" download>${t.logoDownload} ↓</a><a href="${p}data/results.json">${t.sourceData} ↗</a><a href="https://github.com/chenfengshijie/SWE-GPU-Bench-website">${t.source} ↗</a></div></div></footer>
<dialog id="figure-dialog" aria-label="${t.zoom}"><button type="button" id="close-figure">${t.close} <span aria-hidden="true">×</span></button><img alt=""><p></p></dialog>
<script type="application/json" id="page-data">${JSON.stringify({results:data.results,labels:{noResults:t.noResults,resultCount:t.resultCount,copied:t.copied,copyFailed:t.copyFailed,copy:t.copy},assetPrefix:p}).replace(/</g,'\\u003c')}</script>
</body></html>`;
 await writeFile(new URL(`dist/${locale==='zh'?'zh/':''}index.html`,root),html);
}
await writeFile(new URL('dist/.nojekyll',root),'');
await writeFile(new URL('dist/robots.txt',root),`User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`);
await writeFile(new URL('dist/sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url><url><loc>${url}zh/</loc></url></urlset>`);
console.log('Built English and Chinese pages in dist/');
