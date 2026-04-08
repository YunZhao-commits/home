<template>
  <div class="terminal-mini">
    <div class="terminal-body" ref="scrollBody">
      <div v-for="msg in messages" :key="msg.id" class="feed-item">
        <span class="timestamp">[{{ formatTime(msg.created_at) }}]</span>
        <span class="author">@{{ msg.author }}</span>
        <span class="content">{{ msg.content }}</span>
      </div>
    </div>
    <div class="terminal-input-zone">
      <input v-model="newMsg" placeholder="COMMAND >>" @keyup.enter="sendBroadcast" />
    </div>
  </div>
</template>

<script setup>
/* ...保持之前的 JS 逻辑不变... */
</script>

<style lang="scss" scoped>
.terminal-mini {
  height: 200px; /* 限制高度，适合放进面板 */
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
  /* 💥 关键修复：抬高底部，防止被遮挡 💥 */
  margin-bottom: 20px; 
  
  .terminal-body { flex: 1; overflow-y: auto; font-family: monospace; font-size: 12px; color: #4ade80; }
  .terminal-input-zone {
    border-top: 1px solid #4ade8050;
    padding-top: 8px;
    input { background: transparent; border: none; color: #fff; width: 100%; outline: none; }
  }
}
</style>
