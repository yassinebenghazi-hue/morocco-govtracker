# Morocco GovTracker 2026–2031 · مرصد التعهدات الحكومية

**Morocco GovTracker** follows the 24 measurable commitments in the government program that Prime Minister Fatima Ezzahra El Mansouri presented to Parliament on October 19, 2026. Every commitment starts at zero on the day of the speech and is tracked toward the target she promised: pensions, direct cash aid, school dropouts, housing, youth jobs, energy, water, debt and more. Each card shows what has been delivered so far, what was promised, and a link to the exact moment in the speech video where the promise was made. Available in Arabic and English, with a one-page printable summary.

**مرصد التعهدات الحكومية 2026–2031** يتتبع 24 تعهداً قابلاً للقياس من البرنامج الحكومي الذي قدمته رئيسة الحكومة فاطمة الزهراء المنصوري أمام البرلمان يوم 19 أكتوبر 2026. كل تعهد يبدأ من الصفر يوم الخطاب، ويُقاس تقدمه نحو الهدف الموعود. تعرض كل بطاقة ما أُنجز وما وُعد به، مع رابط إلى اللحظة الدقيقة في الفيديو.

Source video: <https://www.youtube.com/watch?v=iTP6pC-r9_o>

## How progress is measured

The status quo on the day of the speech is **0%**; the promised target is **100%**.

- Increasing metrics: `(current − baseline) / (target − baseline)`
- Decreasing metrics: `(baseline − current) / (baseline − target)`
- Always clamped between 0% and 100%.

## Updating a figure

All data lives in [`src/data/kpis.json`](src/data/kpis.json). To publish a new value, edit the KPI's `"current"` field (the actual level as reported by an official source) and commit. The site rebuilds and redeploys automatically in about two minutes.

The in-page "Update KPI" editor saves to the viewer's own browser only. It is for drafting, not publishing.

## Publishing from the laptop

`bash publish.sh "What changed"` runs the tests, commits, pulls any edits made on github.com, and pushes. The site redeploys in about two minutes. `bash publish.sh --pull` only brings github.com edits down to the laptop.

## Run locally

```bash
npm install
npm run dev     # local preview
npm test        # progress-math tests
npm run build   # production build in dist/
```

Built with React, Vite and Tailwind CSS. Deployed to GitHub Pages by `.github/workflows/deploy.yml`.

*Figures are taken from the speech; verify them against official sources. Corrections welcome via issues.*
