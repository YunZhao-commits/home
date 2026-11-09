const formatters = new Map();
export function validTimeZone(zone) {
  if (typeof zone !== 'string' || !zone) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
}
export function preferredTimeZone(deviceZone, networkZone) {
  if (validTimeZone(deviceZone)) return { timeZone: deviceZone, source: 'device' };
  if (validTimeZone(networkZone)) return { timeZone: networkZone, source: 'network-ip' };
  return { timeZone: null, source: null };
}
export function clockParts(now, timeZone) {
  if (!validTimeZone(timeZone)) return null;
  if (!formatters.has(timeZone)) formatters.set(timeZone, new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
    minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }));
  const p = Object.fromEntries(formatters.get(timeZone).formatToParts(now).map(p => [p.type, p.value]));
  const weekday = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay();
  return { ...p, weekday: ['周日','周一','周二','周三','周四','周五','周六'][weekday], weekdayIndex: weekday };
}
const dayMs = 86400000;
let cached;
// Find the first instant of a local calendar date, including midnight DST transitions.
function startOfDate(date, zone) {
  const key = date.toISOString().slice(0, 10);
  let lo = +date - 36 * 3600000, hi = +date + 36 * 3600000;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2), p = clockParts(mid, zone);
    if (`${p.year}-${p.month}-${p.day}` < key) lo = mid; else hi = mid;
  }
  return hi;
}
export function capsuleProgress(now, zone) {
  const p = clockParts(now, zone);
  if (!p) return [];
  const date = new Date(Date.UTC(+p.year, +p.month - 1, +p.day));
  const key = `${zone}/${+date}`;
  if (cached?.key !== key) {
    const week = new Date(+date - ((p.weekdayIndex + 6) % 7) * dayMs);
    const month = new Date(Date.UTC(+p.year, +p.month - 1, 1));
    const year = new Date(Date.UTC(+p.year, 0, 1));
    cached = { key, ranges: [
      ['今日','小时',date,new Date(+date + dayMs)],
      ['本周','天',week,new Date(+week + 7 * dayMs)],
      ['本月','天',month,new Date(Date.UTC(+p.year,+p.month,1))],
      ['本年','天',year,new Date(Date.UTC(+p.year+1,0,1))],
    ].map(([name,unit,start,end]) => ({ name,unit,start: startOfDate(start,zone),end: startOfDate(end,zone),
      total: name === '今日' ? null : Math.round((end-start)/dayMs), passed: Math.round((date-start)/dayMs) })) };
  }
  return cached.ranges.map(r => {
    const total = r.total ?? (r.end-r.start)/3600000;
    const passed = r.total === null ? Math.floor((now-r.start)/3600000) : r.passed;
    return { name:r.name,unit:r.unit,total,passed,remaining:total-passed,
      percentage: Math.max(0,Math.min(100,(now-r.start)/(r.end-r.start)*100)).toFixed(2) };
  });
}
