import { visitorContext, privateJson } from '../_lib/visitor.js';
export async function onRequest({ request }) {
  if (request.method !== 'GET') return privateJson({ error: 'Method not allowed' }, 405);
  const context = visitorContext(request), cf = request.cf || {};
  const lat = Number.parseFloat(cf.latitude), lon = Number.parseFloat(cf.longitude);
  if (!context.timeZone || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180)
    return privateJson({ ...context, weather: null, error: 'Network region unavailable' });
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
  try {
    const params = new URLSearchParams({ latitude: lat.toFixed(2), longitude: lon.toFixed(2),
      current:'temperature_2m,weather_code,is_day', timezone:'UTC', forecast_days:'1' });
    // Never forward the incoming request, cookies, IP or browser headers upstream.
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal, redirect:'error', headers: { Accept:'application/json',
        'CF-Connecting-IP':'0.0.0.0', 'X-Real-IP':'0.0.0.0', 'X-Forwarded-For':'0.0.0.0' },
      cf: { cacheEverything:true, cacheTtlByStatus: { '200-299':600, '400-599':0 } },
    });
    if (!response.ok) throw new Error('Weather unavailable');
    const { current } = await response.json();
    if (typeof current?.temperature_2m !== 'number' || !Number.isFinite(current.temperature_2m) || !Number.isInteger(current.weather_code)) throw new Error('Invalid weather');
    return privateJson({ ...context, weather: { temperature: Math.round(current.temperature_2m), code:current.weather_code, isDay:current.is_day===1 } });
  } catch { return privateJson({ ...context, weather:null, error:'Weather temporarily unavailable' }); }
  finally { clearTimeout(timer); }
}
