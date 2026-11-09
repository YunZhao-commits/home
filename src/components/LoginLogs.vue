<template>
  <section class="login-logs" aria-label="登录记录">
    <p class="hint">仅管理员可查看。记录从功能启用后开始保存；同一 IP 在一分钟内被拦截的重复请求合并记录。时间和日期筛选均为 UTC。</p>
    <form class="filters" @submit.prevent="search">
      <input v-model.trim="ip" placeholder="筛选 IP 地址" aria-label="筛选 IP 地址" />
      <select v-model="result" aria-label="筛选登录结果"><option value="">全部结果</option><option value="success">登录成功</option><option value="failed">登录失败</option><option value="blocked">已拦截</option></select>
      <input v-model="day" type="date" aria-label="按 UTC 日期筛选" />
      <button type="submit" :disabled="loading">查询</button>
    </form>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-else-if="loading">正在读取登录记录…</p>
    <p v-else-if="!rows.length">暂无符合条件的记录。</p>
    <div v-else class="records">
      <article v-for="row in rows" :key="row.id" class="record">
        <div class="record-head"><strong :class="row.result">{{ labels[row.result] || row.result }}</strong><time>{{ row.created_at.replace('T', ' ').replace('Z', ' UTC') }}</time></div>
        <div><span>IP</span> {{ row.ip }}</div>
        <div><span>地区</span> {{ [row.city, row.country].filter(Boolean).join(' · ') || '未知' }}</div>
        <div class="agent"><span>设备 / 浏览器</span> {{ row.user_agent || '未知' }}</div>
      </article>
    </div>
    <div class="pager"><button type="button" :disabled="loading || page === 0" @click="changePage(-1)">上一页</button><span>第 {{ page + 1 }} 页</span><button type="button" :disabled="loading || !hasMore" @click="changePage(1)">下一页</button></div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const props = defineProps({ token: { type: String, required: true } });
const rows = ref([]), ip = ref(''), result = ref(''), day = ref(''), page = ref(0), hasMore = ref(false), loading = ref(false), error = ref('');
const labels = { success: '登录成功', failed: '登录失败', blocked: '已拦截' };
let filters = {};
async function load() {
  loading.value = true; error.value = '';
  try {
    const params = new URLSearchParams({ action: 'login-logs', page: String(page.value), ...filters });
    const response = await fetch(`/api/admin?${params}`, { headers: { Authorization: `Bearer ${props.token}` }, cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(response.status === 401 ? '登录已过期，请退出后重新登录。' : data.error || '读取失败');
    rows.value = data.data; hasMore.value = data.hasMore;
  } catch (e) { error.value = e.message || '网络异常，请重试。'; rows.value = []; hasMore.value = false; }
  finally { loading.value = false; }
}
function search() { filters = { ip: ip.value, result: result.value, day: day.value }; page.value = 0; load(); }
function changePage(offset) { page.value += offset; load(); }
onMounted(load);
</script>

<style scoped>
.login-logs { color: #eaf9fb; }
.hint { color: #b0ced3; line-height: 1.7; margin-bottom: 1rem; }
.filters { display: flex; flex-wrap: wrap; gap: .7rem; margin-bottom: 1rem; }
.filters input, .filters select, .filters button, .pager button { background: #103c49; border: 1px solid #54838c; border-radius: 9px; color: #fff; min-height: 44px; padding: .6rem .8rem; }
.filters input { flex: 1 1 150px; min-width: 0; } .filters select { flex: 1 1 120px; }
.records { display: grid; gap: .65rem; }
.record { background: rgba(7,48,58,.75); border: 1px solid #376b75; border-radius: 12px; padding: 1rem; line-height: 1.7; overflow-wrap: anywhere; }
.record-head { display: flex; gap: .8rem; justify-content: space-between; flex-wrap: wrap; } .record-head time { color: #b5d0d5; }
.record span { color: #a3c4ca; margin-right: .4rem; } .success { color: #6bf0b3; } .failed, .blocked, .error { color: #ffb4a9; }
.agent { font-size: .85rem; } .pager { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
button:disabled { opacity: .45; }
</style>
