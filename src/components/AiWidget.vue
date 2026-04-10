<template>
  <div class="ai-widget-wrapper">
    <button class="ai-fab" @click="toggleChat" :class="{ 'is-open': isOpen }">
      <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="chat-panel">
        <div class="chat-header">
          <span class="title">AI 分身终端 (RAG)</span>
          <span class="status">● STREAMING ACTIVE</span>
        </div>
        
        <div class="chat-body" ref="chatBody">
          <div v-for="(msg, index) in messages" :key="index" :class="['msg-bubble', msg.role]">
            <div 
              v-if="msg.role === 'assistant'" 
              class="msg-text markdown-body" 
              v-html="renderMarkdown(msg.content)"
            ></div>
            <div v-else class="msg-text">{{ msg.content }}</div>

            <div v-if="msg.context" class="msg-context">🔍 {{ msg.context.substring(0, 40) }}...</div>
          </div>
          <div v-if="isLoading" class="msg-bubble assistant loading">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>

        <div class="chat-footer">
          <input 
            type="text" 
            v-model="inputText" 
            @keypress.enter="sendMessage"
            placeholder="询问关于云初的任何事..." 
            :disabled="isGenerating"
          />
          <button @click="sendMessage" :disabled="isGenerating || !inputText.trim()">发送</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { marked } from 'marked';

const isOpen = ref(false);
const inputText = ref('');
const messages = ref([
  { role: 'assistant', content: '你好！我是云初的赛博分身。我已经读取了他的知识库，有什么我可以帮你的吗？' }
]);
const isLoading = ref(false); 
const isGenerating = ref(false); 
const chatBody = ref(null);

let sessionId = localStorage.getItem('yunchu_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('yunchu_session_id', sessionId);
}

const toggleChat = () => { isOpen.value = !isOpen.value; };

const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
};

const renderMarkdown = (text) => {
  if (!text) return '';
  return marked.parse(text);
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || isGenerating.value) return;

  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  isLoading.value = true;
  isGenerating.value = true;
  scrollToBottom();

  try {
    const res = await fetch('https://ai.191607.xyz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, sessionId })
    });
    
    if (!res.ok) {
      const errData = await res.json();
      messages.value.push({ role: 'assistant', content: `[系统提示] ${errData.error || '服务器异常'}` });
      return;
    }

    isLoading.value = false; 

    messages.value.push({ role: 'assistant', content: '', context: '' });
    const aiMessageIndex = messages.value.length - 1;

    // 💥 修复核心：不再读 Header，改为从数据流中截取上下文
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); 

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            // 收到流中的上下文
            if (data.context !== undefined) {
               messages.value[aiMessageIndex].context = data.context;
            }
            // 收到流中的回答片段
            if (data.response) {
              messages.value[aiMessageIndex].content += data.response;
              scrollToBottom();
            }
          } catch(e) {}
        }
      }
    }
  } catch (error) {
    isLoading.value = false;
    messages.value.push({ role: 'assistant', content: `[网络错误] 无法连接到赛博大脑。详细原因：${error.message}` });
  } finally {
    isLoading.value = false;
    isGenerating.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.ai-widget-wrapper { position: fixed; bottom: 60px; right: 20px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; font-family: 'JetBrains Mono', sans-serif; }
.ai-fab { width: 50px; height: 50px; border-radius: 50%; background: rgba(15, 23, 42, 0.8); border: 1px solid #38bdf8; color: #38bdf8; cursor: pointer; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px); transition: all 0.3s ease; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
.ai-fab:hover { transform: scale(1.05); background: #38bdf8; color: #0f172a; }
.icon { width: 24px; height: 24px; }
.chat-panel { width: 340px; height: 500px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(15px); border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 15px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.chat-header { padding: 15px; background: rgba(11, 17, 32, 0.9); border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
.title { color: #e2e8f0; font-weight: bold; font-size: 0.9rem; }
.status { color: #10b981; font-size: 0.7rem; }
.chat-body { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.msg-bubble { max-width: 85%; padding: 10px 12px; border-radius: 8px; font-size: 0.85rem; line-height: 1.5; }
.msg-bubble.user { align-self: flex-end; background: #38bdf8; color: #0f172a; border-bottom-right-radius: 2px; }
.msg-bubble.assistant { align-self: flex-start; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-bottom-left-radius: 2px; }
.msg-context { font-size: 0.65rem; color: #64748b; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; }
.chat-footer { padding: 10px; border-top: 1px solid #1e293b; display: flex; gap: 8px; background: rgba(11, 17, 32, 0.9); }
.chat-footer input { flex: 1; padding: 8px 12px; background: #1e293b; border: 1px solid #334155; color: #e2e8f0; border-radius: 6px; outline: none; font-size: 0.85rem; }
.chat-footer input:focus { border-color: #38bdf8; }
.chat-footer button { padding: 0 15px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
.chat-footer button:disabled { background: #475569; cursor: not-allowed; }
.loading .dot { display: inline-block; width: 4px; height: 4px; background: #38bdf8; border-radius: 50%; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.loading .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }

.markdown-body :deep(p) { margin: 0 0 8px 0; }
.markdown-body :deep(p:last-child) { margin-bottom: 0; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { margin: 0 0 8px 0; padding-left: 20px; }
.markdown-body :deep(li) { margin-bottom: 4px; }
.markdown-body :deep(strong) { color: #38bdf8; font-weight: bold; }
.markdown-body :deep(pre) { background: #0b1120; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 8px 0; border: 1px solid #334155; }
.markdown-body :deep(code) { font-family: 'JetBrains Mono', Consolas, monospace; background: #0b1120; padding: 2px 4px; border-radius: 3px; font-size: 0.8rem; }
</style>
