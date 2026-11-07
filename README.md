# SWE-GPU-Bench website

Bilingual paper website: https://chenfengshijie.github.io/SWE-GPU-Bench-website/

English lives at `/`, Chinese at `/zh/`. This is a standalone static site; it does not publish the private benchmark implementation.

## Build and preview

Requires Node.js 22 or newer. No dependencies to install.

```sh
npm run build
npm run check
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/ or http://localhost:8000/zh/.

## Update content

- `src/content.mjs`: both languages. Keep meaning and limitations aligned.
- `data/results.json`: shared experiment data, coverage, and source attribution. `historical` denominators remain null unless a reliable source provides them. Never rank Perf-Replay gains across different passing sets.
- `public/assets/`: current manuscript PDF and paper figures. Replace the PDF and affected figures together when the paper changes; verify rendered pages and refresh the snapshot date and source hash.
- `scripts/build.mjs`: page structure and citation. The citation is a manuscript (`@misc`), without an invented DOI or publication identifier.
- `src/styles.css` and `src/app.js`: presentation and browser interactions.

`npm run build` creates `dist/`, which is ignored by Git. Push to `main` to build, check, and deploy automatically through GitHub Actions. GitHub Pages must use **GitHub Actions** as its build source. To roll back, revert the relevant commit and push; the same workflow deploys the restored version.

## Data provenance

Initial content is transcribed from the local manuscript snapshot of **6 November 2026**, including uncommitted author edits. The SHA-256 of the exact source is recorded in `data/results.json`. Main results are Table 2, Perf-Replay results Table 3, and evaluation coverage Appendix B.1. The manuscript reports 417 tasks (378 + 39); the independently maintained release had 421 records (382 + 39). The linked live dataset can change. All displayed scores are paper-reported; building this website does not re-run or independently validate GPU experiments.

Only the five models explicitly identified by the paper as evaluated on the updated general set are labeled `current`. Other models are in the historical group. The website's two language versions use the same results. The PDF is freshly compiled from the same source snapshot; images are rendered from the paper's original PDFs.

## Attribution

Original website implementation, with presentation references to [SWE-Perf](https://swe-perf.github.io/) and [SWE-bench](https://www.swebench.com/). The alpaca mascot is newly generated with SWE-Perf and SWE-bench as visual references, with an original GPU card, goggles, and wrench composition. Their source code and logo assets are not included. Manuscript and figures belong to their respective authors; upstream dataset licensing is defined on Hugging Face.

## Visual identity

The GPU alpaca mascot appears in the masthead, navigation, favicon, and link previews. Download the transparent original from `public/assets/gpu-llama.png`; the site uses a smaller WebP derivative. The masthead wordmark stays as selectable HTML text, so it scales cleanly and remains accessible. See `BRANDING.md` for the reference and generation brief. Local DM Sans and Space Grotesk fonts are bundled with their SIL Open Font Licenses; reading the page makes no third-party font requests.

The result spotlight is computed from `data/results.json` for the selected Agent/Oracle setting on the current general set. It is unaffected by the table's search filter. Figures reserve their intrinsic dimensions to keep direct section and language links stable during loading. Tables scroll horizontally on small screens while the model column stays visible.
