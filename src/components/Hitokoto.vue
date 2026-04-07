<template>
  <div class="hitokoto cards" @click="console.log('欢迎进入 Yunchu Studio 核心档案库')">
    <div class="open-quotes">
      <Quote fill="rgba(255, 255, 255, 0.8)" size="26" />
    </div>
    
    <span class="text">
      {{ hitokotoData.text || "EXPLORING THE DIGITAL UNKNOWN…" }}
    </span>
    
    <div class="close-quotes">
      <Quote fill="rgba(255, 255, 255, 0.8)" size="26" />
    </div>
  </div>
</template>

<script setup>
import { Quote } from "@icon-park/vue-next";
import { onMounted, reactive } from "vue";

// 响应式数据：保留动态随机金句的核心灵魂
const hitokotoData = reactive({
  text: "",
});

// 核心修改：使用原项目的API获取动态极客金句，绝对不是网抑云
const getHitokoto = async () => {
  try {
    const response = await fetch("https://v1.hitokoto.cn/?c=i&c=k&c=b");
    const data = await response.json();
    hitokotoData.text = data.hitokoto;
  } catch {
    hitokotoData.text = " khám phá sự không rõ ràng.";
  }
};

onMounted(() => {
  getHitokoto();
});
</script>

<style lang="scss" scoped>
.hitokoto {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: fade 0.5s;
  
  /* 高级毛玻璃微光质感 — 彻底告别模糊丑马赛克 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  /* 鼠标悬停时的发光交互效果（吸引点击） */
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    cursor: pointer;
  }

  .open-quotes {
    width: 100%;
    position: absolute;
    top: 15px;
    left: 15px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    opacity: 0.4;
  }

  .text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: bold;
    letter-spacing: 0.05em;
    line-height: 1.8;
    padding: 0 10px;
  }

  .close-quotes {
    width: 100%;
    position: absolute;
    bottom: 15px;
    left: -15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    opacity: 0.4;
  }
}
</style>
