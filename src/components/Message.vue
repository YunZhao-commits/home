<template>
  <div class="message">
    <div class="header">
      <img class="logo-img" src="/images/avatar.png" alt="logo" />
      <div class="name text-hidden">
        <span class="bg">Yunchu</span>
        <span class="sm">Studio</span>
      </div>
    </div>
    
    <div class="description text-hidden">
      <Quote class="quote-icon left" fill="rgba(255, 255, 255, 0.7)" size="18" />
      <span class="desc-text">{{ description }}</span>
      <Quote class="quote-icon right" fill="rgba(255, 255, 255, 0.7)" size="18" />
    </div>
  </div>
</template>

<script setup>
import { Quote } from "@icon-park/vue-next";

// 这里的文字你可以随意改成你的专属 Slogan
const description = "A Private Digital Infrastructure";
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
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
  
  /* 左下角引号区域的终极美化 */
  .description {
    margin-top: 15px;
    display: flex;
    align-items: center;
    /* 去掉原来厚重的模糊，换成极其微弱的高级黑底 */
    background: rgba(0, 0, 0, 0.15); 
    padding: 8px 15px;
    border-radius: 8px;
    backdrop-filter: blur(4px); /* 仅保留极轻微的毛玻璃 */

    .quote-icon {
      opacity: 0.8;
    }
    .quote-icon.right {
      transform: scaleX(-1); /* 将右侧的引号水平翻转，形成对称 */
    }
    .desc-text {
      margin: 0 10px;
      font-size: 1.1rem;
      opacity: 0.9;
      letter-spacing: 0.05em;
      color: #ffffff;
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
    .description { margin-top: 10px; padding: 6px 12px; }
    .desc-text { font-size: 1rem !important; }
  }
}
</style>
