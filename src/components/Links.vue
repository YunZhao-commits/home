<template>
  <div v-if="siteLinks.length" class="links">

    <!-- ── 标题栏 ── -->
    <div class="line">
      <LinkTwo theme="outline" size="20" :stroke-width="3" />
      <span class="title">网站导航</span>
    </div>

    <!-- ── Swiper 轮播 ── -->
    <Swiper
      :modules="swiperModules"
      :slides-per-view="1"
      :space-between="40"
      :pagination="needsPagination ? paginationConfig : false"
      :mousewheel="true"
    >
      <SwiperSlide v-for="(page, pageIndex) in pagedLinks" :key="pageIndex">
        <!--
          抛弃 el-row/el-col + 魔法 margin-bottom hack
          改用原生 CSS Grid，间距由 gap 统一管理
        -->
        <div class="link-grid">
          <div
            v-for="item in page"
            :key="item.id"
            class="item cards"
            @click="jumpLink(item)"
          >
            <component
              :is="iconMap[item.icon]"
              theme="outline"
              size="26"
              :stroke-width="3"
            />
            <span class="name text-hidden">{{ item.name }}</span>
          </div>
        </div>
      </SwiperSlide>

      <!--
        核心修复①：v-if 彻底不渲染 DOM
        而非 v-show 隐藏，Swiper 内部也不会初始化分页器模块
      -->
      <div v-if="needsPagination" class="swiper-pagination" />
    </Swiper>

  </div>
</template>
<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel } from 'swiper/modules'

// 💥 终极修复：使用 100% 存在的骨灰级基础图标，彻底排除幻觉 💥
import {
  LinkTwo,        // 标题图标
  Database,       // 数据库图标 -> 对应私有云
  Book,           // 书本图标 -> 对应第二大脑
  Robot,          // 机器人图标 -> 对应 AI
  Earth,          // 地球图标 -> 对应边缘网络
  Edit,           // 编辑笔图标 -> 对应设计系统
  ChartPie,       // 饼图图标 -> 对应服务监控
} from '@icon-park/vue-next'

import siteLinks from '@/assets/siteLinks.json'

// ─────────────────────────────────────────────────────────────
// 布局常量
const PAGE_COLS = 3  
const PAGE_ROWS = 2  
const PAGE_SIZE = PAGE_COLS * PAGE_ROWS  

// ─────────────────────────────────────────────────────────────
// 图标映射表：必须与 import 保持绝对一致
const iconMap = {
  Database,
  Book,
  Robot,
  Earth,
  Edit,
  ChartPie,
}

// ─────────────────────────────────────────────────────────────
// 下面的 Swiper 配置和跳转逻辑 (jumpLink) 保持原样不用动...
const swiperModules = [Pagination, Mousewheel]
const paginationConfig = {
  el: '.swiper-pagination',
  clickable: true,
  bulletElement: 'div',
}

// ─────────────────────────────────────────────────────────────
// 数据计算
const pagedLinks = computed(() => {
  const pages = []
  for (let i = 0; i < siteLinks.length; i += PAGE_SIZE) {
    pages.push(siteLinks.slice(i, i + PAGE_SIZE))
  }
  return pages
})

const needsPagination = computed(() => siteLinks.length > PAGE_SIZE)

// ─────────────────────────────────────────────────────────────
// 链接跳转 · 协议分发器
const jumpLink = (item) => {
  const url = item.url
  if (!url) {
    console.warn(`[Links.vue] 导航项 "${item.name}" 缺少 url 字段`)
    return
  }
  const isWebUrl = url.startsWith('https://') || url.startsWith('http://')
  if (isWebUrl) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}
</script>


<style lang="scss" scoped>
.links {
  // ── 标题栏 ──────────────────────────────────────────────
  .line {
    margin: 2rem 0.25rem 1rem;
    display: flex;
    align-items: center;
    gap: 8px;           // 替换原来的 margin-left: 8px
    animation: fade 0.5s;

    .title {
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }

  // ── Swiper 容器 ─────────────────────────────────────────
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;

    .swiper-slide { height: 100%; }

    // 分页指示器样式保持原有风格
    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;

        &.swiper-pagination-bullet-active,
        &:hover { opacity: 1; }
      }
    }
  }

  // ── 核心改动：CSS Grid 替代 el-row/el-col ────────────────
  .link-grid {
    display: grid;
    grid-template-columns: repeat(v-bind(PAGE_COLS), 1fr);  // 响应常量
    grid-template-rows: repeat(v-bind(PAGE_ROWS), 1fr);
    gap: 20px;
    height: 220px;

    @media (max-width: 720px) { height: 180px; }
  }

  // ── 卡片单元 ────────────────────────────────────────────
  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 0 10px;
    cursor: pointer;
    animation: fade 0.5s;
    // ↑ 删掉了 index < 3 的 margin-bottom hack，grid gap 已处理

    &:hover {
      transform: scale(1.02);
      background: rgb(0 0 0 / 40%);
      transition: 0.3s;
    }
    &:active { transform: scale(1); }

    .name {
      font-size: 1.1rem;
      margin-left: 8px;
    }

    // 宽屏窄区间：只显示图标
    @media (min-width: 720px) and (max-width: 820px) {
      .name { display: none; }
    }

    // 小屏：垂直排列
    @media (max-width: 460px) {
      flex-direction: column;
      .name {
        font-size: 1rem;
        margin-left: 0;
        margin-top: 8px;
      }
    }
  }
}
</style>
