// True-baseline calibration: baseline (Oct 2026, day of the speech) = 0%, target = 100%.
// Never Current / Target.

export function clamp(n, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, n));
}

export function progressPct({ baseline, target, direction }, current) {
  if (current === null || current === undefined || Number.isNaN(Number(current))) return 0;
  const c = Number(current);
  if (target === baseline) return c === target ? 100 : 0;
  const raw =
    direction === 'decrease'
      ? ((baseline - c) / (baseline - target)) * 100
      : ((c - baseline) / (target - baseline)) * 100;
  return clamp(raw);
}

// Change since the speech (Oct 2026). `delivered` starts at 0 on launch day; `promised` is the full
// change the government committed to. Both are signed raw changes (debt 71 -> 62 promises -9).
// `backwards` = the metric moved away from the target.
export function changeSinceLaunch({ baseline, target, direction }, current) {
  const round = (n) => Math.round(n * 1000) / 1000;
  const delivered = round(Number(current) - baseline);
  const promised = round(target - baseline);
  const backwards = direction === 'decrease' ? delivered > 0 : delivered < 0;
  return { delivered, promised, backwards };
}

export function youtubeUrl(videoId, seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `https://www.youtube.com/watch?v=${videoId}&t=${m}m${s}s`;
}
