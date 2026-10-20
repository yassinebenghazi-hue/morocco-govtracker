import { useEffect, useMemo, useState } from 'react';
import KPIS from './data/kpis.json';
import { changeSinceLaunch, progressPct, valueAtPct, youtubeUrl } from './lib/progress.js';

const VIDEO_ID = 'iTP6pC-r9_o';
const STORE_KEY = 'govtracker.records.v1';
const LANG_KEY = 'govtracker.lang';

const T = {
  ar: {
    title: 'مرصد التعهدات الحكومية',
    period: '2026–2031',
    subtitle: 'تتبع التعهدات التي أعلنتها رئيسة الحكومة فاطمة الزهراء المنصوري خلال الجلسة البرلمانية المشتركة ليوم 19 أكتوبر 2026',
    toggle: 'English',
    overall: 'التقدم الإجمالي',
    commitments: 'تعهد',
    achieved: 'منجز',
    inProgress: 'قيد الإنجاز',
    notStarted: 'عند خط الأساس',
    simulator: 'محاكي المراحل',
    launch: 'الانطلاق (أكتوبر 2026)',
    midterm: 'منتصف الولاية (2028)',
    end: 'نهاية الولاية (2031)',
    recorded: 'القيم المسجلة',
    simulated: 'محاكاة',
    simPace: 'نسبة التقدم المحاكاة',
    launchNote: 'وضع الانطلاق: كل القيم الحالية = خط الأساس، أي 0% تقدم.',
    endNote: 'نهاية الولاية: كل التعهدات محققة بالكامل (100%).',
    recordedNote: 'اضغط على أي بطاقة لتحديث القيمة الحالية وإضافة ملاحظات التحقق.',
    simNote: 'محاكاة: كل المؤشرات على نفس النسبة. القيم المسجلة لا تتغير.',
    all: 'الكل',
    print: 'نسخة الطباعة',
    baseline: 'خط الأساس',
    current: 'الحالي',
    target: 'الهدف',
    deadline: 'الأجل',
    watch: 'شاهد',
    progress: 'التقدم',
    pillar: 'المحور',
    commitment: 'التعهد',
    source: 'المصدر',
    notes: 'ملاحظات التحقق',
    notesPh: 'المصدر، التاريخ، رابط الوثيقة الرسمية…',
    save: 'حفظ',
    cancel: 'إلغاء',
    reset: 'إرجاع إلى خط الأساس',
    edit: 'تحديث المؤشر',
    quote: 'الاقتباس من الخطاب',
    updated: 'آخر تحديث',
    hasNotes: 'ملاحظات',
    delivered: 'المُنجز منذ أكتوبر 2026',
    promised: 'الموعود',
    from: 'من',
    to: 'إلى',
    pts: 'نقطة',
    backwards: 'تراجع',
    direction: { increase: 'مؤشر تصاعدي', decrease: 'مؤشر تنازلي' },
    printedView: 'العرض',
    footer: 'الأرقام والطوابع الزمنية كما وردت في ملف المشروع. تحقق من المصادر الرسمية قبل النشر. التحديثات محفوظة في هذا المتصفح فقط.',
    exportBtn: 'تصدير البيانات',
    resetAll: 'مسح كل التحديثات',
    confirmReset: 'مسح كل القيم والملاحظات المسجلة في هذا المتصفح؟',
  },
  en: {
    title: 'Morocco GovTracker',
    period: '2026–2031',
    subtitle: 'Tracking the commitments made by Prime Minister Fatima Ezzahra El Mansouri at the joint parliamentary session of October 19, 2026',
    toggle: 'العربية',
    overall: 'Overall progress',
    commitments: 'commitments',
    achieved: 'Achieved',
    inProgress: 'In progress',
    notStarted: 'At baseline',
    simulator: 'Milestone simulator',
    launch: 'Launch (Oct 2026)',
    midterm: 'Mid-Term Check (2028)',
    end: 'End of Mandate (2031)',
    recorded: 'Recorded values',
    simulated: 'Simulate',
    simPace: 'Simulated progress',
    launchNote: 'Launch view: every current value = baseline, so every bar reads 0%.',
    endNote: 'End of mandate: every commitment fully delivered (100%).',
    recordedNote: 'Click any card to update its current value and add verification notes.',
    simNote: 'Simulation: every KPI at the same pace. Your recorded values are untouched.',
    all: 'All',
    print: 'One-pager / PDF',
    baseline: 'Baseline',
    current: 'Current',
    target: 'Target',
    deadline: 'Deadline',
    watch: 'Watch',
    progress: 'Progress',
    pillar: 'Pillar',
    commitment: 'Commitment',
    source: 'Source',
    notes: 'Verification notes',
    notesPh: 'Source, date, link to the official document…',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset to baseline',
    edit: 'Update KPI',
    quote: 'Quote from the speech (Arabic original)',
    updated: 'Last updated',
    hasNotes: 'Notes',
    delivered: 'Delivered since Oct 2026',
    promised: 'Promised',
    from: 'From',
    to: '→',
    pts: 'pts',
    backwards: 'Going backwards',
    direction: { increase: 'Higher is better', decrease: 'Lower is better' },
    printedView: 'View',
    footer: 'Figures and timestamps as provided in the project brief. Verify against official sources before publishing. Updates are saved in this browser only.',
    exportBtn: 'Export data',
    resetAll: 'Clear all updates',
    confirmReset: 'Clear every recorded value and note saved in this browser?',
  },
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    /* storage blocked: the app keeps working in memory */
  }
}

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { maximumFractionDigits: n !== 0 && Math.abs(n) < 10 ? 2 : 1 });

// Signed change for display. Zero keeps the direction's sign (+0 / −0) so launch day reads as a start line.
function fmtChange(n, direction) {
  if (n > 0) return `+${fmt(n)}`;
  if (n < 0) return `−${fmt(-n)}`;
  return direction === 'decrease' ? '−0' : '+0';
}

// Unit for a change: a move in a "%" metric is in percentage points.
function changeUnit(k, isAr, t) {
  return k.unitEn.trim().startsWith('%') ? t.pts : isAr ? k.unitAr : k.unitEn;
}

function statusOf(pct) {
  if (pct >= 100) return 'achieved';
  if (pct > 0) return 'inProgress';
  return 'notStarted';
}

const STATUS_STYLE = {
  achieved: 'bg-emerald-100 text-emerald-800',
  inProgress: 'bg-saffron-soft text-amber-800',
  notStarted: 'bg-slate-100 text-slate-600',
};

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'ar'; } catch { return 'ar'; }
  });
  const [mode, setMode] = useState('midterm'); // launch | midterm | end
  const [midSource, setMidSource] = useState('recorded'); // recorded | simulated
  const [simPct, setSimPct] = useState(40);
  const [records, setRecords] = useState(() => loadJSON(STORE_KEY, {}));
  const [pillar, setPillar] = useState('all');
  const [editing, setEditing] = useState(null);

  const t = T[lang];
  const isAr = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.title = isAr ? 'مرصد التعهدات الحكومية 2026–2031' : 'Morocco GovTracker 2026–2031';
    saveJSON(LANG_KEY, lang);
  }, [lang, isAr]);

  useEffect(() => saveJSON(STORE_KEY, records), [records]);

  const valueFor = (k) => {
    if (mode === 'launch') return k.baseline;
    if (mode === 'end') return k.target;
    if (midSource === 'simulated') return valueAtPct(k, simPct);
    return records[k.id]?.current ?? k.baseline;
  };

  const rows = useMemo(
    () =>
      KPIS.map((k) => {
        const current = valueFor(k);
        const pct = progressPct(k, current);
        return { ...k, current, pct, status: statusOf(pct) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, midSource, simPct, records]
  );

  const pillars = useMemo(() => {
    const seen = new Map();
    for (const k of KPIS) if (!seen.has(k.pillar)) seen.set(k.pillar, k.pillarAr);
    return [...seen.entries()].map(([en, ar]) => ({ en, ar }));
  }, []);

  const visible = pillar === 'all' ? rows : rows.filter((r) => r.pillar === pillar);
  const overall = rows.reduce((s, r) => s + r.pct, 0) / rows.length;
  const counts = rows.reduce((c, r) => ({ ...c, [r.status]: (c[r.status] || 0) + 1 }), {});

  const pillarStats = pillars.map((p) => {
    const rs = rows.filter((r) => r.pillar === p.en);
    return { ...p, n: rs.length, pct: rs.reduce((s, r) => s + r.pct, 0) / rs.length };
  });

  const modeLabel =
    mode === 'launch' ? t.launch : mode === 'end' ? t.end : `${t.midterm} · ${midSource === 'simulated' ? `${t.simulated} ${simPct}%` : t.recorded}`;

  const saveRecord = (id, current, notes) => {
    setRecords((r) => ({ ...r, [id]: { current, notes, updatedAt: new Date().toISOString() } }));
    setMode('midterm');
    setMidSource('recorded');
    setEditing(null);
  };

  const resetRecord = (id) => {
    setRecords((r) => {
      const next = { ...r };
      delete next[id];
      return next;
    });
    setEditing(null);
  };

  const exportData = () => {
    const out = KPIS.map((k) => ({
      ...k,
      current: records[k.id]?.current ?? k.baseline,
      notes: records[k.id]?.notes ?? '',
      updatedAt: records[k.id]?.updatedAt ?? null,
    }));
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `govtracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearAll = () => {
    if (window.confirm(t.confirmReset)) setRecords({});
  };

  return (
    <>
      <div className="screen-only min-h-screen">
        {/* Header */}
        <header className="zellige text-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl font-extrabold sm:text-4xl">{t.title}</h1>
                  <span className="rounded-md bg-saffron px-2 py-0.5 text-sm font-bold">{t.period}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-emerald-50/90 sm:text-base">{t.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
                >
                  🖨 {t.print}
                </button>
                <button
                  onClick={() => setLang(isAr ? 'en' : 'ar')}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-brand hover:bg-emerald-50"
                >
                  {t.toggle}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="rounded-xl bg-emerald-deep/70 p-4 ring-1 ring-white/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-emerald-100">{t.overall}</span>
                  <span className="text-3xl font-extrabold tabular-nums">{overall.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div className="bar-fill h-full rounded-full bg-saffron" style={{ width: `${overall}%` }} />
                </div>
                <div className="mt-2 text-xs text-emerald-100/80">
                  {KPIS.length} {t.commitments} · {modeLabel}
                </div>
              </div>
              {[
                ['achieved', '✓'],
                ['inProgress', '◐'],
                ['notStarted', '○'],
              ].map(([key, icon]) => (
                <div key={key} className="rounded-xl bg-emerald-deep/70 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-emerald-100">
                    {icon} {t[key]}
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tabular-nums">{counts[key] || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* Simulator */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-emerald-brand">⏳ {t.simulator}</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportData} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50">
                  ⬇ {t.exportBtn}
                </button>
                <button onClick={clearAll} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50">
                  {t.resetAll}
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {['launch', 'midterm', 'end'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    mode === m
                      ? 'bg-emerald-brand text-white shadow'
                      : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t[m]}
                </button>
              ))}
            </div>

            {mode === 'midterm' && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-saffron-soft/60 p-3">
                <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-amber-300">
                  {['recorded', 'simulated'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setMidSource(s)}
                      className={`px-3 py-1.5 text-sm font-semibold ${
                        midSource === s ? 'bg-saffron text-white' : 'bg-white text-amber-800'
                      }`}
                    >
                      {t[s]}
                    </button>
                  ))}
                </div>
                {midSource === 'simulated' && (
                  <label className="flex flex-1 items-center gap-3 text-sm text-amber-900">
                    <span className="whitespace-nowrap">{t.simPace}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={simPct}
                      onChange={(e) => setSimPct(Number(e.target.value))}
                      className="w-full accent-[#d97706]"
                    />
                    <span className="w-12 font-bold tabular-nums">{simPct}%</span>
                  </label>
                )}
              </div>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {mode === 'launch' ? t.launchNote : mode === 'end' ? t.endNote : midSource === 'simulated' ? t.simNote : t.recordedNote}
            </p>
          </section>

          {/* Pillar filter */}
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <PillarChip active={pillar === 'all'} onClick={() => setPillar('all')} label={t.all} pct={overall} n={KPIS.length} />
            {pillarStats.map((p) => (
              <PillarChip
                key={p.en}
                active={pillar === p.en}
                onClick={() => setPillar(p.en)}
                label={isAr ? p.ar : p.en}
                pct={p.pct}
                n={p.n}
              />
            ))}
          </nav>

          {/* Cards */}
          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((k) => (
              <KpiCard key={k.id} k={k} t={t} isAr={isAr} record={records[k.id]} onOpen={() => setEditing(k.id)} />
            ))}
          </section>

          <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
            {t.footer}{' '}
            <a className="text-emerald-brand underline" href={`https://www.youtube.com/watch?v=${VIDEO_ID}`} target="_blank" rel="noreferrer">
              youtube.com/watch?v={VIDEO_ID}
            </a>
          </footer>
        </main>

        {editing && (
          <Editor
            k={KPIS.find((x) => x.id === editing)}
            record={records[editing]}
            t={t}
            isAr={isAr}
            onClose={() => setEditing(null)}
            onSave={saveRecord}
            onReset={resetRecord}
          />
        )}
      </div>

      <PrintView rows={rows} t={t} isAr={isAr} overall={overall} modeLabel={modeLabel} />
    </>
  );
}

function PillarChip({ active, onClick, label, pct, n }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-emerald-brand text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label} <span className={active ? 'text-emerald-100' : 'text-slate-400'}>· {n} · {pct.toFixed(0)}%</span>
    </button>
  );
}

function KpiCard({ k, t, isAr, record, onOpen }) {
  const unit = isAr ? k.unitAr : k.unitEn;
  const chg = changeSinceLaunch(k, k.current);
  return (
    <article
      onClick={onOpen}
      className="group flex cursor-pointer flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-300"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-brand">
          {isAr ? k.pillarAr : k.pillar}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[k.status]}`}>{t[k.status]}</span>
      </div>

      <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">{isAr ? k.titleAr : k.titleEn}</h3>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tabular-nums text-emerald-brand">{k.pct.toFixed(k.pct % 1 ? 1 : 0)}%</span>
        <span className="text-xs text-slate-500">
          {t.direction[k.direction]} {k.direction === 'increase' ? '↑' : '↓'}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${t.progress} ${k.pct.toFixed(1)}%`}>
        <div
          className={`bar-fill h-full rounded-full ${k.pct >= 100 ? 'bg-emerald-brand' : 'bg-saffron'}`}
          style={{ width: `${k.pct}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className={`rounded-lg p-2 ring-1 ${chg.backwards ? 'bg-red-50 ring-red-200' : 'bg-emerald-50 ring-emerald-200'}`}>
          <dt className="text-[11px] text-slate-500">{chg.backwards ? `⚠ ${t.backwards}` : t.delivered}</dt>
          <dd className={`text-lg font-extrabold tabular-nums ${chg.backwards ? 'text-red-700' : 'text-emerald-brand'}`}>
            <bdi dir="ltr">{fmtChange(chg.delivered, k.direction)}</bdi>
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-[11px] text-slate-500">{t.promised}</dt>
          <dd className="text-lg font-extrabold tabular-nums text-slate-900">
            <bdi dir="ltr">{fmtChange(chg.promised, k.direction)}</bdi>
          </dd>
        </div>
      </dl>
      <div className="mt-1 text-center text-xs text-slate-500">{changeUnit(k, isAr, t)}</div>
      <div className="mt-2 text-center text-xs text-slate-500">
        {t.from} <bdi dir="ltr" className="font-semibold text-slate-700">{fmt(k.baseline)}</bdi> {t.to}{' '}
        <bdi dir="ltr" className="font-semibold text-slate-700">{fmt(k.target)}</bdi> {unit}
        {chg.delivered !== 0 && (
          <>
            {' · '}
            {t.current}: <b className="tabular-nums text-slate-700">{fmt(k.current)}</b>
          </>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs">
        <span className="text-slate-500">
          {t.deadline}: <b className="text-slate-700"><bdi dir="ltr">{k.deadline}</bdi></b>
          {record?.notes ? <span className="ms-2 text-saffron">📝 {t.hasNotes}</span> : null}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="ms-auto rounded-lg px-2.5 py-1 font-semibold text-emerald-brand ring-1 ring-emerald-200 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
        >
          ✎ {t.edit}
        </button>
        <a
          href={youtubeUrl(VIDEO_ID, k.seconds)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700"
          dir="ltr"
        >
          ▶ {k.timestamp}
        </a>
      </div>
    </article>
  );
}

function Editor({ k, record, t, isAr, onClose, onSave, onReset }) {
  const [value, setValue] = useState(String(record?.current ?? k.baseline));
  const [notes, setNotes] = useState(record?.notes ?? '');
  const num = value === '' ? NaN : Number(value);
  const valid = !Number.isNaN(num);
  const pct = valid ? progressPct(k, num) : 0;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="text-xs font-semibold text-saffron">{t.edit}</div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{isAr ? k.titleAr : k.titleEn}</h3>

        <blockquote dir="rtl" lang="ar" className="mt-3 rounded-lg border-s-4 border-saffron bg-saffron-soft/50 p-3 text-sm text-slate-800" style={{ fontFamily: 'Cairo, sans-serif' }}>
          «{k.quoteAr}»
        </blockquote>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>{t.quote}</span>
          <a href={youtubeUrl(VIDEO_ID, k.seconds)} target="_blank" rel="noreferrer" className="font-semibold text-red-600 hover:underline" dir="ltr">
            ▶ {t.watch} {k.timestamp}
          </a>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">{t.baseline}</div>
            <b className="tabular-nums">{fmt(k.baseline)}</b>
          </div>
          <label className="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-300">
            <div className="text-[11px] text-slate-500">{t.current}</div>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              dir="ltr"
              className="w-full bg-transparent text-center font-bold tabular-nums outline-none"
            />
          </label>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">{t.target}</div>
            <b className="tabular-nums">{fmt(k.target)}</b>
          </div>
        </div>
        <div className="mt-1 text-center text-xs text-slate-500">
          {isAr ? k.unitAr : k.unitEn}
          {valid && (
            <>
              {' · '}
              {t.delivered}:{' '}
              <b className={changeSinceLaunch(k, num).backwards ? 'text-red-700' : 'text-emerald-brand'}>
                <bdi dir="ltr">{fmtChange(changeSinceLaunch(k, num).delivered, k.direction)}</bdi>
              </b>{' '}
              / <bdi dir="ltr">{fmtChange(changeSinceLaunch(k, num).promised, k.direction)}</bdi> {changeUnit(k, isAr, t)}
            </>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="bar-fill h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} />
          </div>
          <b className="w-14 text-end tabular-nums text-emerald-brand">{pct.toFixed(1)}%</b>
        </div>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          {t.notes}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPh}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal outline-none focus:border-emerald-brand"
          />
        </label>
        {record?.updatedAt && (
          <div className="mt-1 text-xs text-slate-400">
            {t.updated}: {new Date(record.updatedAt).toLocaleString(isAr ? 'ar-MA' : 'en-CA')}
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <button onClick={() => onReset(k.id)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
            {t.reset}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50">
              {t.cancel}
            </button>
            <button
              disabled={!valid}
              onClick={() => onSave(k.id, num, notes.trim())}
              className="rounded-lg bg-emerald-brand px-4 py-2 text-sm font-bold text-white hover:bg-emerald-deep disabled:opacity-40"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintView({ rows, t, isAr, overall, modeLabel }) {
  return (
    <div className="print-only p-2 text-slate-900">
      <div className="flex items-end justify-between border-b-2 border-emerald-brand pb-1">
        <div>
          <h1 className="text-lg font-extrabold text-emerald-brand">
            {t.title} {t.period}
          </h1>
          <p className="text-[8pt] text-slate-600">{t.subtitle}</p>
        </div>
        <div className="text-end text-[8pt]">
          <div>
            {t.overall}: <b>{overall.toFixed(1)}%</b>
          </div>
          <div>
            {t.printedView}: {modeLabel} · {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'en-CA')}
          </div>
        </div>
      </div>
      <table className="mt-1 w-full border-collapse">
        <thead>
          <tr className="bg-emerald-brand text-white">
            <th className="text-start">#</th>
            <th className="text-start">{t.pillar}</th>
            <th className="text-start">{t.commitment}</th>
            <th>{t.baseline}</th>
            <th>{t.delivered}</th>
            <th>{t.promised}</th>
            <th>{t.target}</th>
            <th className="text-start">{isAr ? 'الوحدة' : 'Unit'}</th>
            <th>{t.deadline}</th>
            <th>{t.progress}</th>
            <th>{t.source}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i % 2 ? 'bg-slate-50' : ''}>
              <td>{i + 1}</td>
              <td>{isAr ? r.pillarAr : r.pillar}</td>
              <td className="font-semibold">{isAr ? r.titleAr : r.titleEn}</td>
              <td className="text-center tabular-nums">{fmt(r.baseline)}</td>
              <td className={`text-center font-bold tabular-nums ${changeSinceLaunch(r, r.current).backwards ? 'text-red-700' : ''}`}>
                <bdi dir="ltr">{fmtChange(changeSinceLaunch(r, r.current).delivered, r.direction)}</bdi>
              </td>
              <td className="text-center tabular-nums">
                <bdi dir="ltr">{fmtChange(changeSinceLaunch(r, r.current).promised, r.direction)}</bdi>
              </td>
              <td className="text-center tabular-nums">{fmt(r.target)}</td>
              <td>{isAr ? r.unitAr : r.unitEn}</td>
              <td className="text-center"><bdi dir="ltr">{r.deadline}</bdi></td>
              <td className="w-24">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-200">
                    <div className="h-full bg-saffron" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="tabular-nums">{r.pct.toFixed(0)}%</span>
                </div>
              </td>
              <td className="text-center" dir="ltr">{r.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-[7pt] text-slate-500">
        {t.footer} youtube.com/watch?v={VIDEO_ID}
      </p>
    </div>
  );
}
