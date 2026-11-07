<template>
  <section class="management-panel">
    <p v-if="loading" role="status">正在读取云端配置…</p>
    <div v-else-if="error" class="panel-error" role="alert">{{ error }} <button type="button" @click="load">重试</button></div>
    <template v-else-if="tab === 'categories'">
      <p class="panel-intro">分类直接保存在数据库，保存后前台和发帖表单自动更新，无需部署。</p>
      <div v-for="category in categoryList" :key="category.id" class="category-row">
        <code>{{ category.id }}</code><input v-model="category.name" maxlength="20" :aria-label="`${category.id} 分类名称`" /><input v-model.number="category.sort_order" type="number" min="-10000" max="10000" aria-label="分类排序" />
        <button type="button" :disabled="busy" @click="saveCategory(category)">保存</button><button class="danger" type="button" :disabled="busy" @click="deleteCategory(category)">删除</button>
      </div>
      <form class="new-category" @submit.prevent="addCategory">
        <h2>新增分类</h2><label>分类标识<input v-model="newCategory.id" required maxlength="40" pattern="[a-z][a-z0-9-]*" placeholder="例如 resources（不能使用 all）" /></label><label>名称<input v-model="newCategory.name" required maxlength="20" placeholder="例如 精选资源" /></label><label>排序<input v-model.number="newCategory.sort_order" type="number" min="-10000" max="10000" /></label><button class="primary" :disabled="busy">新增分类</button>
      </form>
    </template>
    <form v-else class="settings-form" @submit.prevent="saveSettings">
      <p class="panel-intro">修改文字与联系信息，保存后立即用于前台，无需部署。WhatsApp、Telegram 链接可以留空，填入你的公开联系或频道链接后才可点击。原头像、背景和页面风格保持不变。</p>
      <label v-for="field in fields" :key="field.key">{{ field.label }}
        <textarea v-if="field.multiline" v-model="siteForm[field.key]" :maxlength="field.max" rows="3" :required="field.required !== false"></textarea>
        <input v-else v-model="siteForm[field.key]" :type="field.type || 'text'" :maxlength="field.max" :required="field.required !== false" :placeholder="field.placeholder" />
      </label>
      <button class="primary" :disabled="busy">{{ busy ? '保存中…' : '保存站点设置' }}</button>
      <p class="panel-intro">管理密码请在 Cloudflare Pages 的 ADMIN_PASSWORD 加密变量中设置，不保存在公开站点设置里。</p>
    </form>
  </section>
</template>
<script setup>
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { managementRequest } from '@/api/management';
import { refreshSite } from '@/composables/useSite';
const props = defineProps({ token: { type: String, required: true }, tab: { type: String, required: true } });
const loading=ref(true), busy=ref(false), error=ref(''), categoryList=ref([]), siteForm=ref({});
const newCategory=ref({id:'',name:'',sort_order:40});
const fields=[{key:'site_name',label:'站点名称',max:40},{key:'site_cn',label:'中文名称',max:30},{key:'tagline',label:'首页副标题',max:100},{key:'quote',label:'首页寄语',max:200,multiline:true},{key:'share_intro',label:'精选分享简介',max:500,multiline:true},{key:'about_intro',label:'关于本站简介',max:1000,multiline:true},{key:'contact_email',label:'联系邮箱',type:'email',max:254},{key:'whatsapp_url',label:'WhatsApp 链接（可选）',type:'url',max:2048,required:false,placeholder:'填入你的 https:// 联系或频道链接'},{key:'telegram_url',label:'Telegram 链接（可选）',type:'url',max:2048,required:false,placeholder:'填入你的 https://t.me/… 链接'}];
let sequence=0;
async function load(){const request=++sequence;loading.value=true;error.value='';try{const result=await managementRequest(props.tab,props.token);if(request!==sequence)return;if(props.tab==='categories')categoryList.value=result.data;else siteForm.value=result.data;}catch(e){if(request===sequence)error.value=e.message;}finally{if(request===sequence)loading.value=false;}}
async function mutate(action,options){if(busy.value)return;busy.value=true;try{await managementRequest(action,props.token,options);await refreshSite();await load();ElMessage.success('已保存，前台无需重新部署');return true;}catch(e){ElMessage.error(e.message);return false;}finally{busy.value=false;}}
const saveCategory=category=>mutate('categories',{method:'PUT',data:category});
async function addCategory(){if(await mutate('categories',{method:'POST',data:newCategory.value}))newCategory.value={id:'',name:'',sort_order:40};}
async function deleteCategory(category){try{await ElMessageBox.confirm(`删除空分类“${category.name}”？有文章引用的分类不能删除。`,'删除分类',{type:'warning',confirmButtonText:'删除空分类',cancelButtonText:'取消'});await mutate('categories',{method:'DELETE',id:category.id});}catch{/* User cancelled. */}}
const saveSettings=()=>mutate('settings',{method:'PUT',data:siteForm.value});
watch(()=>props.tab,load,{immediate:true});
</script>
<style scoped>
.management-panel{border:1px solid #9adfe344;border-radius:16px;padding:22px;background:linear-gradient(120deg,#135264bb,#032b3ce0)}.panel-intro{font-size:13px;line-height:1.8;color:#c4e3ec;margin:0 0 20px}.category-row{display:grid;grid-template-columns:120px minmax(100px,1fr) 80px auto auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #b7f3ff22}.category-row code{color:#83f4f1;overflow-wrap:anywhere}.management-panel input,.management-panel textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid #9fe1f060;border-radius:9px;padding:11px;background:#022231bb;color:#f0fcff;font:inherit}.management-panel button{min-height:40px;border:1px solid #9fe1f060;border-radius:9px;padding:8px 16px;background:#0d617266;color:#f0fcff;cursor:pointer}.management-panel .danger{color:#ffc5bc}.management-panel .primary{background:#3bdfe0;color:#052f3e;font-weight:700}.management-panel button:disabled{opacity:.5;cursor:wait}.new-category{display:grid;grid-template-columns:2fr 2fr 1fr auto;gap:14px;margin-top:24px;align-items:end}.new-category h2{grid-column:1/-1;font-size:20px}.management-panel label{display:flex;flex-direction:column;gap:8px;font-size:14px}.settings-form{max-width:850px;display:grid;gap:18px}.settings-form .primary{justify-self:start}.panel-error{color:#ffd0c8;line-height:1.8}@media(max-width:768px){.management-panel{padding:16px}.category-row{grid-template-columns:1fr 70px auto auto;gap:8px}.category-row code{grid-column:1/-1}.category-row input:first-of-type{grid-column:1}.category-row button{padding:8px 10px}.new-category{grid-template-columns:1fr}.new-category h2{grid-column:auto}.settings-form .primary{width:100%}}
</style>
