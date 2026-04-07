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
      <span>{{ description }}</span>
    </div>
  </div>
</template>

<script setup>
// 极简简介，可以自己在这里修改想说的话
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
      border-radius: 50%; /* 强制圆形头像 */
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
    margin-top: 15px;
    font-size: 1.1rem;
    opacity: 0.8;
    letter-spacing: 0.05em;
    color: #ffffff;
  }
}

/* 移动端优雅缩放 */
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
    .description { margin-top: 10px; font-size: 1rem; }
  }
}
</style>
