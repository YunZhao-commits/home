<template>
  <div class="more-content">
    <h2 class="brand">Yunchu <span>Studio</span></h2>
    <p class="desc">致力于探索前沿技术与极简设计的个人数字实验室。</p>
    
    <div class="tech-stack">
      <div class="tech-item">
        <span class="label">SECURITY</span>
        <span class="value">Zero Trust Enabled</span>
      </div>
      <div class="tech-item">
        <span class="label">NETWORK</span>
        <span class="value">Cloudflare Global Edge</span>
      </div>
      <div class="tech-item">
        <span class="label">FRAMEWORK</span>
        <span class="value">Vue 3 & Vite CI/CD</span>
      </div>
    </div>

    <div class="author-sign">
      -- ALL SYSTEMS ONLINE --
    </div>
  </div>
</template>

<script setup>
// 纯静态高级展示面板，无需复杂逻辑
</script>

<style lang="scss" scoped>
.more-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 10px 5px;
  color: rgba(255, 255, 255, 0.9);
  
  /* 品牌标题样式 */
  .brand {
    font-size: 1.6rem;
    margin: 0 0 10px 0;
    font-weight: bold;
    letter-spacing: 0.05em;
    span {
      font-weight: normal;
      opacity: 0.6;
    }
  }
  
  /* 描述文本样式 */
  .desc {
    font-size: 0.95rem;
    opacity: 0.8;
    margin: 0 0 25px 0;
    line-height: 1.6;
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    padding-left: 12px;
  }
  
  /* 技术栈雷达面板样式 */
  .tech-stack {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: rgba(0, 0, 0, 0.15);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    
    .tech-item {
      display: flex;
      justify-content: space-between;
      font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      
      .label {
        opacity: 0.5;
      }
      .value {
        color: #00ff88; /* 极客绿，呼应底部的安全状态 */
        opacity: 0.9;
        font-weight: bold;
      }
    }
  }
  
  /* 底部状态签名 */
  .author-sign {
    margin-top: auto;
    align-self: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
    opacity: 0.3;
    letter-spacing: 0.1em;
    padding-top: 20px;
  }
}

/* 移动端适配 */
@media (max-width: 720px) {
  .more-content {
    padding: 0;
    .brand { font-size: 1.4rem; }
    .desc { font-size: 0.85rem; margin-bottom: 15px; }
    .tech-stack .tech-item { font-size: 0.75rem; }
  }
}
</style>
