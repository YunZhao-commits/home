<template>
  <div class="cover-uploader">
    <div v-if="modelValue" class="cover-preview"><img :src="modelValue" alt="文章封面预览" /><button type="button" @click="$emit('update:modelValue', '')">移除封面</button></div>
    <label class="upload-button"><input type="file" accept="image/png,image/jpeg,image/webp" :disabled="busy" @change="upload" />{{ busy ? '正在压缩并上传…' : modelValue ? '更换封面' : '上传封面' }}</label>
    <span class="upload-hint">PNG / JPEG / WebP，原图不超过 10MB；自动压缩到 256KB 内。发布后无需重新部署。</span>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { managementRequest } from '@/api/management';
import { compressCover } from '@/utils/coverCompression';
const props = defineProps({ modelValue: { type: String, default: '' }, token: { type: String, required: true } });
const emit = defineEmits(['update:modelValue', 'busy']);
const busy = ref(false);
const error = ref('');
async function upload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  busy.value = true; emit('busy', true); error.value = '';
  try {
    const blob = await compressCover(file);
    const result = await managementRequest('upload', props.token, { method: 'POST', file: blob });
    if (!result.url) throw new Error('上传没有返回封面地址');
    emit('update:modelValue', result.url);
  } catch (e) { console.error('封面处理或上传失败', e); error.value = e.message || '上传失败'; }
  finally { busy.value = false; emit('busy', false); event.target.value = ''; }
}
</script>
<style scoped>
.cover-uploader{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.cover-preview{width:100%;display:flex;gap:12px;align-items:center}.cover-preview img{width:170px;height:105px;object-fit:cover;border-radius:12px}.upload-button,.cover-preview button{position:relative;padding:10px 16px;border:1px solid #67cfda88;background:#0c556a88;color:#e9fcff;border-radius:10px;cursor:pointer}.upload-button input{position:absolute;inset:0;width:100%;opacity:0;cursor:pointer}.upload-hint{font-size:12px;color:#c3dfe6;line-height:1.7;flex:1;min-width:180px}.upload-error{width:100%;color:#ffc6bd;font-size:13px}
</style>
