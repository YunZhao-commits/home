<template>
  <div class="broadcast-terminal">
    <div v-if="wasmMode" class="wasm-overlay">
      <div class="wasm-header">
        <span>[ WebAssembly Python Engine v3.11 ]</span>
        <span class="close-wasm" @click="wasmMode = false">EXIT</span>
      </div>
      <div class="wasm-body" v-html="wasmOutput"></div>
    </div>

    <div class="input-area">
      <input
        v-model="newMsg"
        placeholder="输入广播 / 或输入 /wasm boot 启动引擎..."
        @keyup.enter="sendBroadcast"
      />
    </div>
    <div class="message-list">
      <div v-for="msg in messages" :key="msg.id" class="msg-item">
        <span class="time">[{{ formatTime(msg.created_at) }}]</span>
        <span class="author">@{{ msg.author || 'Node_User' }}:</span>
        <span class="cnt">{{ msg.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from "dayjs";
import DOMPurify from 'dompurify';

const messages = ref([]);
const newMsg = ref("");

// Wasm 引擎状态
const wasmMode = ref(false);
const wasmOutput = ref("");

const API_BASE = '/api/broadcast';

const formatTime = (time) => dayjs(time).format('HH:mm');

const fetchMessages = async () => {
  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) messages.value = data;
    }
  } catch { /* silently ignore fetch errors */ }
};

// 拦截器：发送广播 or 触发 Wasm 引擎
const sendBroadcast = async () => {
  const cmd = newMsg.value.trim();
  if (!cmd) return;

  // 彩蛋触发逻辑
  if (cmd === '/wasm boot') {
    newMsg.value = "";
    wasmMode.value = true;
    wasmOutput.value = "Initializing WebAssembly Environment...<br/>";

    // 动态拉取 Pyodide Wasm 引擎（带 SRI 防篡改）
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.integrity = "sha384-b4IZetZNE8bVncsQqlcH4ZZFC58BslGU2LVj47xUtIMOw72axMESbPe8spBylXnd";
    script.crossOrigin = "anonymous";
    script.onload = async () => {
      wasmOutput.value += "Loading Python 3.11 Core (this may take a few seconds)...<br/>";
      try {
        let pyodide = await window.loadPyodide();
        wasmOutput.value += "<span style='color:#4ade80'>[SYSTEM] Wasm Engine Online. Executing Python Test...</span><br/>";
        let result = await pyodide.runPythonAsync(`
import sys
import math
version = sys.version.split(' ')[0]
calc = math.factorial(10)
f"Python Version: {version} | 10! = {calc}"
        `);
        wasmOutput.value += `<br/><span style='color:#f87171'>> ${DOMPurify.sanitize(result)}</span>`;
      } catch (err) {
        wasmOutput.value += `<br/><span style='color:red'>Error: ${DOMPurify.sanitize(String(err))}</span>`;
      }
    };
    document.head.appendChild(script);
    return;
  }

  // 通过 Worker 代理写入（含服务端限流与校验）
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: "Node_User", content: cmd }),
    });
    if (res.ok) {
      newMsg.value = "";
      fetchMessages();
    } else if (res.status === 429) {
      alert('发送太快啦，请稍等一会儿。');
    }
  } catch { /* silently ignore */ }
};

onMounted(() => { fetchMessages(); });
</script>

<style lang="scss" scoped>
.broadcast-terminal {
  background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 10px; position: relative;

  /* Wasm 引擎界面样式 */
  .wasm-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(10px);
    border-radius: 8px; z-index: 100; display: flex; flex-direction: column;
    padding: 10px; font-family: 'JetBrains Mono', monospace;

    .wasm-header {
      display: flex; justify-content: space-between; color: #60a5fa; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #60a5fa50; padding-bottom: 5px;
      .close-wasm { cursor: pointer; color: #f87171; &:hover { text-decoration: underline; } }
    }
    .wasm-body { color: #fff; font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
  }

  .input-area {
    margin-bottom: 10px;
    input {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: #4ade80; padding: 8px; border-radius: 4px; outline: none; font-family: monospace;
    }
  }
  .message-list {
    max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px;
    .msg-item {
      margin-bottom: 6px;
      .time { color: #666; margin-right: 8px; }
      .author { color: #60a5fa; margin-right: 5px; }
      .cnt { color: #eee; }
    }
  }
}
</style>
