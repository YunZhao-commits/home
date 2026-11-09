import { reactive, ref, computed, onMounted, onBeforeUnmount, readonly } from 'vue';
import { clockParts, capsuleProgress, preferredTimeZone, validTimeZone } from '../../shared/visitor-time.js';
function readDeviceTimeZone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return validTimeZone(zone) ? zone : null;
  } catch { return null; }
}
let deviceTimeZone = readDeviceTimeZone();
let networkTimeZone = null;
const context = reactive({ timeZone:deviceTimeZone, timeZoneSource:deviceTimeZone ? 'device' : null,
  location:{}, status:'loading', weather:null, weatherStatus:'loading' });
const now = ref(Date.now());
let anchor = 0, received = 0, users = 0, tick, refreshTimer, pending, lastRefresh = 0;
async function read(path) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(path, { cache:'no-store', credentials:'omit', signal:controller.signal });
    if (!response.ok) throw new Error('Unavailable');
    return await response.json();
  } finally { clearTimeout(timer); }
}
export function refreshVisitorContext() {
  if (pending) return pending;
  deviceTimeZone = readDeviceTimeZone();
  const latestPreferred = preferredTimeZone(deviceTimeZone, networkTimeZone);
  if (latestPreferred.timeZone) {
    Object.assign(context, { timeZone:latestPreferred.timeZone, timeZoneSource:latestPreferred.source });
  }
  pending = (async () => {
    let contextLoaded = false;
    try {
      const started = performance.now(), data = await read('/api/visitor-context');
      received = performance.now();
      if (!Number.isFinite(data.serverTime)) throw new Error('Unknown server time');
      networkTimeZone = validTimeZone(data.timeZone) ? data.timeZone : null;
      const preferred = preferredTimeZone(deviceTimeZone, networkTimeZone);
      if (!preferred.timeZone) throw new Error('Unknown region');
      anchor = data.serverTime + (received-started)/2;
      now.value = anchor;
      Object.assign(context, { timeZone:preferred.timeZone, timeZoneSource:preferred.source,
        location:data.location || {}, status:'ready', weather:null, weatherStatus:'loading' });
      contextLoaded = true;
      const weather = await read('/api/weather');
      // A connection can switch countries between requests; never mix two regions.
      const sameLocation = ['city','region','country'].every(k => weather.location?.[k] === context.location[k]);
      context.weather = networkTimeZone && weather.timeZone === networkTimeZone && sameLocation ? weather.weather : null;
      context.weatherStatus = context.weather ? 'ready' : 'error';
    } catch {
      if (!contextLoaded) Object.assign(context, { status:deviceTimeZone ? 'ready' : 'error',
        timeZone:deviceTimeZone, timeZoneSource:deviceTimeZone ? 'device' : null });
      context.weather = null; context.weatherStatus = 'error';
    } finally { pending = null; lastRefresh = performance.now(); }
  })();
  return pending;
}
function onResume() { if (document.visibilityState === 'visible' && performance.now()-lastRefresh>30000) refreshVisitorContext(); }
export function useVisitorContext() {
  onMounted(() => {
    if (++users !== 1) return;
    refreshVisitorContext();
    // Keep the clock alive even when the IP context endpoint is unavailable.
    // Once Cloudflare time arrives, use it as a monotonic anchor to avoid
    // browser clock drift without making the page depend on the network.
    tick = setInterval(() => {
      now.value = anchor ? anchor + performance.now() - received : Date.now();
    }, 1000);
    refreshTimer = setInterval(refreshVisitorContext, 300000);
    document.addEventListener('visibilitychange',onResume);
    window.addEventListener('online',refreshVisitorContext);
  });
  onBeforeUnmount(() => {
    if (--users !== 0) return;
    clearInterval(tick); clearInterval(refreshTimer);
    document.removeEventListener('visibilitychange',onResume);
    window.removeEventListener('online',refreshVisitorContext);
  });
  return { context:readonly(context), now, clock:computed(() => clockParts(now.value,context.timeZone)),
    progress:computed(() => capsuleProgress(now.value,context.timeZone)),
    locationLabel:computed(() => context.location.city || context.location.region || context.location.country || '网络地区') };
}
