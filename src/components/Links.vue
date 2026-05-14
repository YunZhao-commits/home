<template>
  <div v-if="siteLinks.length" class="links">

    <div class="line">
      <LinkTwo theme="outline" size="20" :stroke-width="3" />
      <span class="title">网站导航</span>
    </div>

    <Swiper
      :modules="swiperModules"
      :slides-per-view="1"
      :space-between="40"
      :pagination="needsPagination ? paginationConfig : false"
      :mousewheel="true"
    >
      <SwiperSlide v-for="(page, pageIndex) in pagedLinks" :key="pageIndex">
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

      <div v-if="needsPagination" class="swiper-pagination" />
    </Swiper>

  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel } from 'swiper/modules'
import VanillaTilt from 'vanilla-tilt'

import {
  LinkTwo, Folder, Notebook, Cpu, Earth, Picture, ChartLine
} from '@icon-park/vue-next'

import siteLinks from '@/assets/siteLinks.json'

const PAGE_COLS = 3  
const PAGE_ROWS = 2  
const PAGE_SIZE = PAGE_COLS * PAGE_ROWS  

const iconMap = { Folder, Notebook, Cpu, Earth, Picture, ChartLine }

const swiperModules = [Pagination, Mousewheel]
const paginationConfig = { el: '.swiper-pagination', clickable: true, bulletElement: 'div' }

const pagedLinks = computed(() => {
  const pages = []
  for (let i = 0; i < siteLinks.length; i += PAGE_SIZE) {
    pages.push(siteLinks.slice(i, i + PAGE_SIZE))
  }
  return pages
})

const needsPagination = computed(() => siteLinks.length > PAGE_SIZE)

const jumpLink = (item) => {
  const url = item.url
  if (!url) return
  const isWebUrl = url.startsWith('https://') || url.startsWith('http://')
  if (isWebUrl) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}

onMounted(() => {
  nextTick(() => {
    VanillaTilt.init(document.querySelectorAll('.item.cards'), {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.25,
      scale: 1.02,
    })
  })
})
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fade 0.5s;

    .title {
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }

  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;

    .swiper-slide { height: 100%; }

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

  .link-grid {
    display: grid;
    // ── Desktop: 3-col fixed grid (unchanged) ──────────────────────────────
    grid-template-columns: repeat(v-bind(PAGE_COLS), minmax(0, 1fr));
    grid-template-rows: repeat(v-bind(PAGE_ROWS), 1fr);
    gap: 15px;
    height: 220px;

    // ── MOBILE ONLY (≤ 768px) ─────────────────────────────────────────────
    // Uses !important to beat the inline CSS variable injected by v-bind().
    // Does NOT affect any selector outside .link-grid.
    @media (max-width: 768px) {
      // 2 equal columns → each card is ≈ 165 px on a 375 px phone
      grid-template-columns: repeat(2, 1fr) !important;
      // Remove the fixed row count so extra cards wrap instead of overflowing
      grid-template-rows: unset !important;
      // Let the grid expand to fit all cards — no more clipped rows
      height: auto !important;
      // Tighter gap on mobile
      gap: 10px;
    }
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 0 5px;
    cursor: pointer;
    animation: fade 0.5s;
    transform-style: preserve-3d;
    border-radius: 12px;

    &:hover {
      background: rgb(0 0 0 / 40%);
      transition: 0.3s;
    }

    &:active { transform: scale(1) !important; }

    .name {
      font-size: 0.95rem;
      margin-left: 6px;
      white-space: nowrap;
    }

    // Tablet: icon-only to avoid cramping
    @media (min-width: 720px) and (max-width: 820px) {
      .name { display: none; }
    }

    // ── MOBILE ONLY (≤ 768px) ─────────────────────────────────────────────
    @media (max-width: 768px) {
      // Stack icon above label — gives both horizontal room
      flex-direction: column;
      // Consistent card height keeps the 2-col grid rows aligned
      min-height: 72px;
      padding: 10px 4px;

      .name {
        font-size: 0.78rem;
        margin-left: 0;
        margin-top: 6px;
        // Allow wrapping so "全球通信 (Terminal)" breaks to two lines
        // instead of being clipped by ellipsis inside a 165 px card
        white-space: normal !important;
        text-align: center;
        line-height: 1.3;
        word-break: break-word;
      }
    }
  }
}
</style>
