import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clockParts, capsuleProgress, preferredTimeZone } from '../shared/visitor-time.js';
import { onRequest as visitor } from '../functions/api/visitor-context.js';
import { onRequest as weather } from '../functions/api/weather.js';
const cf = { timezone:'Asia/Kathmandu', city:'Kathmandu', country:'NP', latitude:'27.717245', longitude:'85.323958' };
function request(metadata = cf) { const r = new Request('https://example.com/api/weather', { headers: { Cookie:'secret', 'CF-Connecting-IP':'203.0.113.22' } }); r.cf = metadata; return r; }
test('IP timezone clock handles fractional offsets and date line independently of browser zone', () => {
  const t = Date.parse('2026-11-06T20:00:00Z');
  assert.equal(clockParts(t,'Asia/Kathmandu').hour,'01');
  assert.equal(clockParts(t,'Asia/Kathmandu').minute,'45');
  assert.equal(clockParts(t,'Asia/Kathmandu').day,'07');
  assert.equal(clockParts(t,'Pacific/Kiritimati').hour,'10');
  assert.equal(clockParts(t,'America/Los_Angeles').day,'06');
  assert.equal(clockParts(t,null),null);
});
test('device timezone takes priority; valid network IP timezone is the fallback', () => {
  assert.deepEqual(preferredTimeZone('Europe/Paris', 'America/New_York'), { timeZone:'Europe/Paris', source:'device' });
  assert.deepEqual(preferredTimeZone('Invalid/Zone', 'America/New_York'), { timeZone:'America/New_York', source:'network-ip' });
  assert.deepEqual(preferredTimeZone(null, null), { timeZone:null, source:null });
});
test('capsule uses completed calendar days, Monday weeks, leap years and local midnight', () => {
  const p = capsuleProgress(Date.parse('2024-03-01T00:00:00Z'),'UTC');
  assert.equal(p[0].passed,0); assert.equal(p[1].passed,4);
  assert.equal(p[2].passed,0); assert.equal(p[3].passed,60); assert.equal(p[3].total,366);
});
test('DST day length is 23/25 hours, half-hour DST also supported', () => {
  assert.equal(capsuleProgress(Date.parse('2026-03-08T16:00:00Z'),'America/New_York')[0].total,23);
  assert.equal(capsuleProgress(Date.parse('2026-11-01T17:00:00Z'),'America/New_York')[0].total,25);
  assert.equal(capsuleProgress(Date.parse('2026-10-04T04:00:00Z'),'Australia/Lord_Howe')[0].total,23.5);
});
test('visitor response is private, contains no IP or coordinates, ignores spoofed query', async () => {
  const r = await visitor({request:request()}); const body = await r.json();
  assert.equal(body.timeZone,cf.timezone); assert.ok(r.headers.get('Cache-Control').includes('no-store'));
  assert.ok(!JSON.stringify(body).includes('203.0.113')); assert.equal(body.latitude,undefined);
  const missing = await (await visitor({request:request({})})).json();
  assert.equal(missing.timeZone,null);
});
test('weather never forwards visitor identity; failures do not fabricate a default city', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.ok(url.startsWith('https://api.open-meteo.com/'));
      assert.ok(url.includes('latitude=27.72'));
      assert.equal(init.redirect,'manual');
      assert.equal(init.headers.Cookie,undefined);
      assert.equal(init.headers['CF-Connecting-IP'],'0.0.0.0');
      return Response.json({current:{temperature_2m:13.6,weather_code:2,is_day:1}});
    };
    const body = await (await weather({request:request()})).json();
    assert.equal(body.weather.temperature,14); assert.equal(body.location.city,'Kathmandu');
    globalThis.fetch = async () => { throw Error('offline'); };
    assert.equal((await (await weather({request:request()})).json()).weather,null);
    assert.equal((await (await weather({request:request({})})).json()).weather,null);
  } finally { globalThis.fetch = original; }
});
