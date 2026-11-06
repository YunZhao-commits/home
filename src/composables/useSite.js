import { ref, onMounted } from 'vue';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../../shared/site-config.js';

const settings = ref({ ...DEFAULT_SETTINGS });
const categories = ref(DEFAULT_CATEGORIES.map(item => ({ ...item })));
let pending = null;

export async function refreshSite() {
  if (pending) return pending;
  pending = (async () => {
    try {
      const response = await fetch('/api/catalog', { cache: 'no-store' });
      if (!response.ok) throw new Error('无法读取站点配置');
      const data = await response.json();
      if (!Array.isArray(data.categories) || !data.settings) throw new Error('站点配置格式错误');
      categories.value = data.categories;
      settings.value = { ...DEFAULT_SETTINGS, ...data.settings };
      document.title = settings.value.site_name;
      return true;
    } catch { return false; }
    finally { pending = null; }
  })();
  return pending;
}

export function useSite() {
  onMounted(refreshSite);
  return {
    settings, categories, refreshSite,
    categoryName: id => categories.value.find(item => item.id === id)?.name || id || '精选',
  };
}
