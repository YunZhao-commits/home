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
const props = defineProps({ modelValue: { type: String, default: '' }, token: { type: String, required: true } });
const emit = defineEmits(['update:modelValue', 'busy']);
const busy = ref(false);
const error = ref('');
async function compress(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('请选择 10MB 内的 PNG、JPEG 或 WebP 图片');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 50000000) throw new Error('图片尺寸过大，请先缩小图片');
    const canvas = document.createElement('canvas');
    const ratio = Math.min(1, 1280 / image.naturalWidth, 900 / image.naturalHeight);
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器无法处理图片');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [.84, .7, .55, .4]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && ['image/webp', 'image/png', 'image/jpeg'].includes(blob.type) && blob.size <= 262144) return blob;
    }
    throw new Error('图片细节过多，压缩后仍超过 256KB，请选择更小的图片');
  } finally { URL.revokeObjectURL(url); }
}
async function upload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  busy.value = true; emit('busy', true); error.value = '';
  try {
    const blob = await compress(file);
    const result = await managementRequest('upload', props.token, { method: 'POST', file: blob });
    if (!result.url) throw new Error('上传没有返回封面地址');
    emit('update:modelValue', result.url);
  } catch (e) { error.value = e.message || '上传失败'; }
  finally { busy.value = false; emit('busy', false); event.target.value = ''; }
}
</script>
<style scoped>
.cover-uploader{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.cover-preview{width:100%;display:flex;gap:12px;align-items:center}.cover-preview img{width:170px;height:105px;object-fit:cover;border-radius:12px}.upload-button,.cover-preview button{position:relative;padding:10px 16px;border:1px solid #67cfda88;background:#0c556a88;color:#e9fcff;border-radius:10px;cursor:pointer}.upload-button input{position:absolute;inset:0;width:100%;opacity:0;cursor:pointer}.upload-hint{font-size:12px;color:#c3dfe6;line-height:1.7;flex:1;min-width:180px}.upload-error{width:100%;color:#ffc6bd;font-size:13px}
</style>
