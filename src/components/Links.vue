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

// 核心修复②：从 @icon-park/vue-next 导入，替换 @vicons/fa 体系
import {
  LinkTwo,        // 标题图标
  CloudStorage,   // Nextcloud  · 私有云
  DiamondThree,   // Obsidian   · 第二大脑
  Robot,          // Dify       · AI 工作流
  GlobeNetworkSecurity, // Cloudflare · 边缘部署
  DesignThinking, // Figma      · 设计系统
  DataScreen,     // Grafana    · 可观测性
} from '@icon-park/vue-next'

import siteLinks from '@/assets/siteLinks.json'

// ─────────────────────────────────────────────────────────────
// 布局常量（修改这里即可全局调整，不用到处找魔法数字）
// ─────────────────────────────────────────────────────────────
const PAGE_COLS = 3  // 列数
const PAGE_ROWS = 2  // 行数
const PAGE_SIZE = PAGE_COLS * PAGE_ROWS  // 单页容量 = 6

// ─────────────────────────────────────────────────────────────
// 图标映射表：JSON 中的 icon 字符串 → 实际组件引用
// 新增图标：在此处 import 后加一行即可，无需改 template
// ─────────────────────────────────────────────────────────────
const iconMap = {
  CloudStorage,
  DiamondThree,
  Robot,
  GlobeNetworkSecurity,
  DesignThinking,
  DataScreen,
}

// ─────────────────────────────────────────────────────────────
// Swiper 配置
// ─────────────────────────────────────────────────────────────
const swiperModules = [Pagination, Mousewheel]

const paginationConfig = {
  el: '.swiper-pagination',
  clickable: true,
  bulletElement: 'div',
}

// ─────────────────────────────────────────────────────────────
// 数据计算
// ─────────────────────────────────────────────────────────────

/** 将 siteLinks 按 PAGE_SIZE 分组，天然支持将来扩展到 N 页 */
const pagedLinks = computed(() => {
  const pages = []
  for (let i = 0; i < siteLinks.length; i += PAGE_SIZE) {
    pages.push(siteLinks.slice(i, i + PAGE_SIZE))
  }
  return pages
})

/**
 * 核心修复①：分页器显示逻辑
 * 链接数 ≤ 单页容量 → false → Swiper 不初始化分页器模块
 */
const needsPagination = computed(() => siteLinks.length > PAGE_SIZE)

// ─────────────────────────────────────────────────────────────
// 链接跳转 · 协议分发器
// ─────────────────────────────────────────────────────────────
/**
 * 核心修复②：统一协议路由，彻底绕开 Vue Router 拦截
 *
 * 分发策略：
 *  ┌─ https:// / http:// ──→ window.open（新标签，安全属性）
 *  └─ 自定义 URI Scheme  ──→ window.location.href（交给 OS 处理）
 *     例：obsidian://、notion://、vscode://、raycast://
 *
 * 注意：所有外部跳转均不经过 router.push，从根源避免 SPA 拦截
 */
const jumpLink = (item) => {
  const url = item.url

  if (!url) {
    console.warn(`[Links.vue] 导航项 "${item.name}" 缺少 url 字段，请检查 siteLinks.json`)
    return
  }

  const isWebUrl = url.startsWith('https://') || url.startsWith('http://')

  if (isWebUrl) {
    // noopener noreferrer：防止新页面访问 window.opener，XSS 安全最佳实践
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    /**
     * 自定义 URI Scheme（obsidian://、vscode:// 等）
     * 用 location.href 而非 window.open：
     *   1. 部分浏览器会阻止 open() 唤起本地 App
     *   2. location.href 让浏览器原生处理协议，更可靠
     *   3. 若协议未注册，浏览器静默忽略，不会导致页面跳转
     */
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
