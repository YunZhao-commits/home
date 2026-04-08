<template>
  <div class="message">
    <div class="header">
      <img class="logo-img" src="/images/avatar.png" alt="logo" />
      <div class="name text-hidden">
        <span class="bg">Yunchu</span>
        <span class="sm">Studio</span>
      </div>
    </div>
    
    <div class="description" @click="store.boxOpenState = !store.boxOpenState">
      <div class="content">
        <Quote class="quote-icon left" fill="rgba(255, 255, 255, 0.6)" size="22" />
        <span class="desc-text" ref="typedElement"></span>
        <Quote class="quote-icon right" fill="rgba(255, 255, 255, 0.6)" size="22" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Quote } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import Typed from "typed.js"; // 💥 引入打字机引擎 💥

const store = mainStore();
const typedElement = ref(null);
let typedInstance = null;

onMounted(() => {
  // 💥 引擎点火 💥
  typedInstance = new Typed(typedElement.value, {
    strings: [
      "A Private Digital Infrastructure",
      "Decentralized Edge Node",
      "System Secure & Encrypted",
      "Explore The Cyber Space"
    ],
    typeSpeed: 60,     // 打字速度
    backSpeed: 30,     // 回退速度
    backDelay: 2500,   // 停留时间
    loop: true,        // 无限循环
    showCursor: true,  // 显示光标
    cursorChar: "_"    // 极客下划线
  });
});

onBeforeUnmount(() => {
  if (typedInstance) typedInstance.destroy(); // 卸载清理内存
});
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    
    .logo-img {
      width: 60px; 
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .name {
      display: flex;
      align-items: baseline;
      
      .bg {
        font-size: 3.5rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        color: #ffffff;
      }
      
      .sm {
        font-size: 1.8rem;
        font-weight: bold;
        margin-left: 10px;
        opacity: 0.8;
        color: #ffffff;
      }
    }
  }
  
  .description {
    margin-top: 2.5rem;
    width: 100%;
    max-width: 460px; 
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }

    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .quote-icon {
        opacity: 0.8;
      }
      .quote-icon.right {
        transform: scaleX(-1); 
      }
      
      .desc-text {
        flex: 1; 
        text-align: center;
        font-size: 1.15rem;
        color: rgba(255, 255, 255, 0.9);
        font-weight: bold;
        letter-spacing: 0.05em;
        padding: 0 10px;
      }
    }
  }
}

@media (max-width: 720px) {
  .message {
    align-items: center;
    .header {
      .logo-img { width: 50px; height: 50px; margin-right: 10px; }
      .name {
        .bg { font-size: 2.5rem; }
        .sm { font-size: 1.2rem; margin-left: 5px; }
      }
    }
    .description {
      margin-top: 20px;
      padding: 12px 15px;
      max-width: 100%;
      .content .desc-text { font-size: 1rem; }
    }
  }
}
</style>
