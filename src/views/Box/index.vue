<template>
  <div class="box-container">
    <div class="terminal-header">
      <div class="status-indicator">
        <span class="blink-dot"></span>
        LIVE_FEED: GLOBAL_NODE_01
      </div>
      <div class="close-btn" @click="store.boxOpenState = false">
        <CloseSmall theme="outline" size="24" />
      </div>
    </div>

    <div class="terminal-body" ref="scrollBody">
      <div v-if="loading" class="system-msg">正在同步边缘节点数据...</div>
      <div v-else-if="messages.length === 0" class="system-msg">节点暂无广播信号，等待输入...</div>
      
      <div v-for="msg in messages" :key="msg.id" class="feed-item">
        <span class="timestamp">[{{ formatTime(msg.created_at) }}]</span>
        <span class="author">@{{ msg.author }}</span>
        <span class="pointer">>></span>
        <span class="content">{{ msg.content }}</span>
      </div>
    </div>

    <div class="terminal-footer">
      <div class="input-wrapper">
        <span class="input-prefix">YUNCHU_CMD:</span>
        <input 
          v-model="newMsg" 
          placeholder="输入广播内容并回车..." 
          @keyup.enter="sendBroadcast"
          :disabled="sending"
        />
        <SendOne 
          class="send-icon" 
          :class="{ 'sending': sending }"
          theme="outline" 
          size="22" 
          @click="sendBroadcast"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { CloseSmall, SendOne } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { supabase } from "@/utils/supabase"; // 💥 引入咱们刚建的云端大脑 💥
import dayjs from "dayjs";

const store = mainStore();
const messages = ref([]);
const newMsg = ref("");
const loading = ref(true);
const sending = ref(false);
const scrollBody = ref(null);

// 🛠️ 格式化时间
const formatTime = (time) => dayjs(time).format("HH:mm:ss");

// 🔄 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (scrollBody.value) {
    scrollBody.value.scrollTop = scrollBody.value.scrollHeight;
  }
};

// 📡 从云端数据库拉取广播
const fetchMessages = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50);
  
  if (error) console.error("数据链路同步失败:", error);
  else {
    messages.value = data;
    scrollToBottom();
  }
  loading.value = false;
};

// 🚀 发送广播到全球节点
const sendBroadcast = async () => {
  if (!newMsg.value.trim() || sending.value) return;
  
  sending.value = true;
  const payload = {
    author: "Node_User", // 后期可以改成读取用户的名字
    content: newMsg.value.trim()
  };

  const { error } = await supabase
    .from('broadcasts')
    .insert([payload]);

  if (error) {
    ElMessage.error("信号发射失败，检查链路");
  } else {
    newMsg.value = "";
    // 发送成功后立刻刷新列表
    await fetchMessages();
  }
  sending.value = false;
};

onMounted(() => {
  fetchMessages();
});
</script>

<style lang="scss" scoped>
.box-container {
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0,0,0,0.5);

  .terminal-header {
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .status-indicator {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #4ade80;
      display: flex;
      align-items: center;
      gap: 8px;

      .blink-dot {
        width: 6px; height: 6px; background: #4ade80; border-radius: 50%;
        animation: blink 1s infinite;
      }
    }
    .close-btn { cursor: pointer; opacity: 0.6; &:hover { opacity: 1; } }
  }

  .terminal-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .system-msg { color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; margin: 20px 0; }

    .feed-item {
      margin-bottom: 10px;
      line-height: 1.5;
      font-size: 14px;
      animation: scanline 0.3s ease-out;

      .timestamp { color: rgba(255,255,255,0.3); margin-right: 8px; }
      .author { color: #60a5fa; margin-right: 8px; font-weight: bold; }
      .pointer { color: #4ade80; margin-right: 8px; }
      .content { color: rgba(255,255,255,0.9); word-break: break-all; }
    }
  }

  .terminal-footer {
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .input-prefix { color: #4ade80; font-family: monospace; font-size: 13px; font-weight: bold; }
      
      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #fff;
        font-family: inherit;
        font-size: 14px;
        &::placeholder { color: rgba(255,255,255,0.2); }
      }

      .send-icon {
        cursor: pointer; opacity: 0.5; transition: 0.3s;
        &:hover { opacity: 1; color: #4ade80; transform: scale(1.1); }
        &.sending { animation: spin 1s infinite linear; }
      }
    }
  }
}

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes scanline { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
</style>
