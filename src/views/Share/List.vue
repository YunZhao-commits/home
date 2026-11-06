<template>
  <div class="share-page">
    <div class="share-container">
      <SiteHeader active="share" @search="focusSearch" />

      <!-- 页面主横幅 -->
      <section class="banner-section">
        <h1 class="page-title">
          <span class="accent-bar"></span>
          <span>精选分享</span>
        </h1>
        <p class="page-subtitle">
          我在使用中发现的实用工具、会员权益与合适优惠，经过筛选与体验后，整理成这份持续更新的精选清单。
        </p>
      </section>

      <!-- 搜索与分类筛选栏 -->
      <section class="filter-toolbar">
        <div class="search-box">
          <Search theme="outline" size="18" fill="rgba(255, 255, 255, 0.6)" class="search-icon" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            aria-label="搜索精选分享"
            placeholder="搜索你感兴趣的工具、会员或优惠..."
            @input="handleSearch"
          />
        </div>

        <div class="category-pills">
          <button
            v-for="cat in categories"
            :key="cat.key"
            :class="['pill-btn', { active: currentCategory === cat.key }]"
            @click="selectCategory(cat.key)"
          >
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- 本期推荐横幅（若有置顶推荐） -->
      <section class="featured-card" v-if="featuredPost" role="link" tabindex="0" @click="goDetail(featuredPost.id)" @keydown.enter="goDetail(featuredPost.id)" @keydown.space.prevent="goDetail(featuredPost.id)">
        <div class="featured-badge">★ 本期推荐</div>
        <div class="featured-content">
          <div class="f-icon">✦</div>
          <div class="f-info">
            <h3 class="f-title">{{ featuredPost.title }}</h3>
              <p v-if="featuredPost.summary" class="f-desc">{{ featuredPost.summary }}</p>
          </div>
        </div>
        <div class="f-action">
          <span>查看详情</span>
          <span class="arrow">→</span>
        </div>
      </section>

      <!-- 内容卡片流 -->
      <section class="cards-stream">
        <div v-if="loading" class="stream-status">
          <LoadingFour theme="outline" size="24" fill="#00e5c9" class="spin" />
          <span>正在加载精选内容...</span>
        </div>

        <div v-else-if="errorMessage" class="stream-empty stream-error">
          <div class="empty-icon" aria-hidden="true"><span></span></div>
          <div class="empty-title">精选内容暂时无法显示</div>
          <div class="empty-subtitle">{{ errorMessage }}</div>
          <button class="retry-button" type="button" @click="fetchPosts">重新加载</button>
        </div>

        <div v-else-if="posts.length === 0" class="stream-empty">
          <div class="empty-icon" aria-hidden="true"><span></span></div>
          <div class="empty-title">内容正在整理，稍后再来看看</div>
          <div class="empty-subtitle">新的精选内容准备好后，会在这里更新。</div>
        </div>

        <div v-else class="cards-grid">
          <article
            v-for="item in posts"
            :key="item.id"
            class="deal-card card-blur"
            @click="goDetail(item.id)"
          >
            <div class="card-art" :class="`art-${item.category || 'default'}`" aria-hidden="true">
              <span class="art-orbit"></span>
              <span class="art-symbol">{{ getCategorySymbol(item.category) }}</span>
            </div>
            <div class="card-body">
              <div class="card-header">
                <h2 class="card-title">{{ item.title }}</h2>
                <span v-if="item.link_type === 'invite'" class="invite-badge" title="包含邀请/推广合作">
                  🔗 邀请链接
                </span>
              </div>

              <!-- 邀请链接透明度披露 -->
              <div v-if="item.link_type === 'invite' && item.disclosure" class="disclosure-box">
                <span class="info-tag">ⓘ 说明</span>
                <span>{{ item.disclosure }}</span>
              </div>

              <p class="card-summary">{{ item.summary }}</p>

              <div class="tags-group">
                <span class="cat-tag">{{ getCategoryLabel(item.category) }}</span>
                <span :class="['status-tag', item.status]">
                  <i class="dot"></i>
                  {{ item.status === 'expired' ? '已结束' : '正常可用' }}
                </span>
              </div>
            </div>
            <aside class="card-meta">
              <span v-if="item.updated_at" class="meta-line"><span aria-hidden="true">◌</span> 更新：{{ formatDate(item.updated_at) }}</span>
              <span v-if="item.provider" class="meta-line"><span aria-hidden="true">▤</span> 提供方：{{ item.provider }}</span>
              <button class="btn-detail" type="button" @click.stop="goDetail(item.id)">
                <span>查看详情</span><span class="arr" aria-hidden="true">→</span>
              </button>
            </aside>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Search, LoadingFour } from "@icon-park/vue-next";
import { getPublicPosts } from "@/api/posts";
import SiteHeader from "@/components/SiteHeader.vue";

const router = useRouter();
const route = useRoute();
const searchInput = ref(null);

const categories = [
  { key: "all", label: "全部" },
  { key: "tools", label: "工具" },
  { key: "vip", label: "会员" },
  { key: "deals", label: "优惠" },
];

const currentCategory = ref("all");
const searchQuery = ref("");
const posts = ref([]);
const featuredPost = ref(null);
const loading = ref(true);
const errorMessage = ref("");
let latestRequest = 0;

const fetchPosts = async () => {
  const request = ++latestRequest;
  loading.value = true;
  errorMessage.value = "";
  try {
    const { list, error } = await getPublicPosts({
      category: currentCategory.value,
      keyword: searchQuery.value,
    });
    if (request !== latestRequest) return;
    if (error) {
      console.error("[share] Failed to load curated posts", error);
      errorMessage.value = "请稍后重试，或返回首页继续浏览。";
      posts.value = [];
      featuredPost.value = null;
    } else {
      posts.value = list;
      featuredPost.value = list.find((p) => p.is_featured) || null;
    }
  } finally {
    if (request === latestRequest) loading.value = false;
  }
};

const selectCategory = (key) => {
  currentCategory.value = key;
  fetchPosts();
};

let searchTimer = null;
const handleSearch = () => {
  latestRequest += 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchPosts();
  }, 300);
};

const focusSearch = () => searchInput.value?.focus();

const goDetail = (id) => {
  router.push(`/share/${id}`);
};

const getCategoryLabel = (cat) => {
  const map = { tools: "工具", vip: "会员", deals: "优惠" };
  return map[cat] || "精选";
};

const getCategorySymbol = (cat) => ({ tools: "⌘", vip: "✦", deals: "％" }[cat] || "✧");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

onMounted(() => {
  fetchPosts();
  if (route.query.focus === "search") nextTick(focusSearch);
});

watch(() => route.query.focus, (value) => {
  if (value === "search") nextTick(focusSearch);
});

onBeforeUnmount(() => {
  latestRequest += 1;
  clearTimeout(searchTimer);
});
</script>

<style lang="scss" scoped>
.share-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(1rem, 2.4vw, 2rem) clamp(1rem, 4vw, 4rem) calc(4rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #efefef;
  background: linear-gradient(180deg, rgba(4, 20, 29, 0.38), rgba(4, 20, 29, 0.18) 48%, rgba(4, 20, 29, 0.44));

  .share-container {
    width: 100%;
    max-width: 1180px;
    min-width: 0;
    margin: 0 auto;
    box-sizing: border-box;
  }

  // 顶部导航
  .share-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    background: rgba(5, 23, 31, 0.42);
    backdrop-filter: blur(16px);

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 1.5px solid rgba(0, 229, 201, 0.6);
      }

      .brand-text {
        display: flex;
        flex-direction: column;

        .main {
          font-family: inherit;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #ffffff;
        }

        .sub {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .nav-item {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.95rem;
        padding-bottom: 4px;
        transition: color 0.2s;

        &:hover,
        &.active {
          color: #00e5c9;
          border-bottom: 2px solid #00e5c9;
        }
      }
    }
  }

  // 页面标题
  .banner-section {
    max-width: 760px;
    margin: clamp(2rem, 5vw, 3.5rem) 0 2rem;

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: clamp(1.8rem, 3.6vw, 2.6rem);
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 0.5rem 0;

      .accent-bar {
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        border-radius: 2px;
        background: #00e5c9;
      }
    }

    .page-subtitle {
      font-size: clamp(0.95rem, 1.4vw, 1.08rem);
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.82);
      margin: 0;
    }
  }

  // 搜索与分类
  .filter-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;

    .search-box {
      flex: 1 1 280px;
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 1rem;
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.8rem;
        background: rgba(8, 28, 36, 0.6);
        border: 1px solid rgba(0, 229, 201, 0.25);
        border-radius: 50px;
        color: #ffffff;
        font-size: 0.9rem;
        outline: none;
        backdrop-filter: blur(10px);
        transition: border-color 0.25s, box-shadow 0.25s;

        &::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        &:focus {
          border-color: #00e5c9;
          box-shadow: 0 0 12px rgba(0, 229, 201, 0.25);
        }
      }
    }

    .category-pills {
      display: flex;
      gap: 0.5rem;

      .pill-btn {
        padding: 0.55rem 1.25rem;
        border-radius: 50px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(8, 28, 36, 0.5);
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.85rem;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: all 0.25s;

        &:hover {
          border-color: rgba(0, 229, 201, 0.5);
          color: #ffffff;
        }

        &.active {
          background: #00e5c9;
          border-color: #00e5c9;
          color: #05161c;
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(0, 229, 201, 0.35);
        }
      }
    }
  }

  // 置顶推荐横幅
  .featured-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, rgba(8, 36, 42, 0.85), rgba(5, 22, 28, 0.85));
    border: 1px solid rgba(0, 229, 201, 0.35);
    border-radius: 16px;
    cursor: pointer;
    backdrop-filter: blur(12px);
    transition: all 0.25s;

    &:hover {
      border-color: #00e5c9;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 229, 201, 0.2);
    }

    .featured-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(0, 229, 201, 0.15);
      color: #00e5c9;
      margin-right: 1rem;
      white-space: nowrap;
    }

    .featured-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;

      .f-icon {
        font-size: 1.5rem;
        color: #00e5c9;
      }

      .f-info {
        .f-title {
          font-size: 1.05rem;
          margin: 0 0 0.2rem;
          color: #ffffff;
        }
        .f-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
        }
      }
    }

    .f-action {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #00e5c9;
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      margin-left: 1rem;

      .arrow {
        transition: transform 0.2s;
      }

      &:hover .arrow {
        transform: translateX(4px);
      }
    }
  }

  // 卡片流
  .cards-stream {
    .stream-status,
    .stream-empty {
      width: min(100%, 680px);
      min-height: 220px;
      box-sizing: border-box;
      margin: clamp(1.5rem, 4vw, 2.75rem) auto 0;
      padding: 2rem clamp(1rem, 4vw, 2.5rem);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 22px;
      background: linear-gradient(145deg, rgba(8, 33, 43, 0.78), rgba(6, 21, 32, 0.68));
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(18px);
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      .spin {
        animation: spin 1.5s linear infinite;
      }
      .empty-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(117, 228, 236, 0.35);
        border-radius: 50%;
        background: rgba(69, 195, 205, 0.12);
        color: #a8f3f2;

        span {
          width: 10px;
          height: 10px;
          border: 2px solid currentColor;
          border-radius: 50%;
          box-shadow: 0 0 0 6px rgba(117, 228, 236, 0.12), 0 0 22px rgba(117, 228, 236, 0.4);
        }
      }
      .empty-title {
        font-size: 1.15rem;
        font-weight: 500;
        color: #ffffff;
      }
      .empty-subtitle {
        max-width: 420px;
        font-size: 0.92rem;
        line-height: 1.7;
      }

      .retry-button {
        min-height: 42px;
        padding: 0.55rem 1.1rem;
        border: 1px solid rgba(117, 228, 236, 0.45);
        border-radius: 999px;
        background: rgba(117, 228, 236, 0.1);
        color: #c9ffff;
        font: inherit;
        cursor: pointer;
      }
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .deal-card {
      background: rgba(8, 28, 36, 0.65);
      border: 1px solid rgba(0, 229, 201, 0.2);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      backdrop-filter: blur(12px);
      transition: all 0.25s;
      cursor: pointer;

      &:hover {
        border-color: rgba(0, 229, 201, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;

        .card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .invite-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #00e5c9;
          background: rgba(0, 229, 201, 0.12);
          border: 1px solid rgba(0, 229, 201, 0.25);
          white-space: nowrap;
        }
      }

      .disclosure-box {
        margin: 0.4rem 0 0.75rem;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        background: rgba(0, 229, 201, 0.06);
        border: 1px dashed rgba(0, 229, 201, 0.3);
        font-size: 0.8rem;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.75);

        .info-tag {
          color: #00e5c9;
          font-weight: 500;
          margin-right: 0.35rem;
        }
      }

      .card-summary {
        font-size: 0.9rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.75);
        margin: 0 0 1rem;
      }

      .card-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);

        .tags-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .cat-tag {
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.85);
          }

          .status-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            color: #52c41a;
            background: rgba(82, 196, 26, 0.1);

            .dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #52c41a;
            }

            &.expired {
              color: rgba(255, 255, 255, 0.45);
              background: rgba(255, 255, 255, 0.06);
              .dot {
                background: rgba(255, 255, 255, 0.45);
              }
            }
          }
        }

        .meta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .action-wrap {
          .btn-detail {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.45rem 1.15rem;
            border-radius: 50px;
            border: 1px solid rgba(0, 229, 201, 0.5);
            background: rgba(0, 229, 201, 0.1);
            color: #00e5c9;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;

            .arr {
              transition: transform 0.2s;
            }

            &:hover {
              background: #00e5c9;
              color: #05161c;
              .arr {
                transform: translateX(3px);
              }
            }
          }
        }
      }
    }
  }

  // 移动端排版优化
  @media (max-width: 720px) {
    padding: max(1rem, env(safe-area-inset-top, 0px)) 1rem calc(5rem + env(safe-area-inset-bottom, 0px));

    .share-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.9rem;

      .brand .brand-text .main {
        font-size: 1.1rem;
      }
      .nav-links {
        width: 100%;
        flex-wrap: wrap;
        gap: 0.5rem 1.15rem;
        font-size: 0.85rem;
      }
    }

    .filter-toolbar {
      align-items: stretch;
      gap: 0.75rem;

      .search-box {
        flex: 1 1 100%;
        min-width: 0;

        input {
          min-width: 0;
          box-sizing: border-box;
        }
      }

      .category-pills {
        max-width: 100%;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        -webkit-overflow-scrolling: touch;

        .pill-btn {
          flex: 0 0 auto;
          min-height: 40px;
          padding-inline: 1rem;
        }
      }
    }

    .banner-section {
      margin: 1.6rem 0 1.2rem;
      .page-title {
        font-size: clamp(1.65rem, 7vw, 2rem);
      }
    }

    .featured-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;

      .f-action {
        margin-left: 0;
        align-self: flex-end;
      }
    }

    .stream-status,
    .stream-empty {
      width: 100%;
      min-height: 190px;
      margin-top: 1rem;
      border-radius: 18px;
    }

    .deal-card {
      display: grid;
      grid-template-columns: minmax(150px, 220px) minmax(0, 1fr);
      gap: 1.25rem;
      padding: 1rem;

      .card-art {
        min-height: 150px;
        border-radius: 12px;
      }

      .card-header .card-title {
        font-size: 1.05rem;
      }

      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.65rem;

        .action-wrap {
          width: 100%;
          .btn-detail {
            width: 100%;
            justify-content: center;
            min-height: 44px;
          }
        }
      }
    }
  }

  @media (max-width: 380px) {
    padding-inline: 0.6rem;

    .share-header .nav-links {
      column-gap: 0.8rem;
    }

    .filter-toolbar .search-box input {
      font-size: 0.82rem;
    }
  }

  .deal-card {
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
    align-items: stretch;
    gap: 1.25rem;

    .card-art {
      position: relative;
      min-height: 148px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      border: 1px solid rgba(123, 235, 255, 0.28);
      background: radial-gradient(circle at 72% 24%, rgba(58, 210, 220, 0.42), transparent 36%), linear-gradient(145deg, rgba(21, 86, 112, 0.95), rgba(4, 28, 47, 0.92));
      color: #efffff;

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 180px;
        height: 180px;
        border: 1px solid rgba(198, 248, 255, 0.2);
        border-radius: 50%;
      }

      &::before { transform: translate(-35%, 40%) scaleX(1.5); }
      &::after { transform: translate(40%, 55%) scaleX(1.8); }
      .art-orbit { position: absolute; inset: 16% 20%; border: 1px solid rgba(190, 247, 255, 0.28); border-radius: 50%; transform: rotate(-28deg); }
      .art-symbol { position: relative; z-index: 1; font-size: 2.8rem; text-shadow: 0 0 24px rgba(0, 229, 201, 0.7); }
      .art-label { position: relative; z-index: 1; color: rgba(231, 253, 255, 0.78); font-size: 0.78rem; letter-spacing: 0.18em; }

      &.art-vip { background: radial-gradient(circle at 70% 25%, rgba(186, 140, 255, 0.42), transparent 38%), linear-gradient(145deg, #243c71, #101c39); }
      &.art-deals { background: radial-gradient(circle at 70% 25%, rgba(255, 180, 108, 0.42), transparent 38%), linear-gradient(145deg, #60412f, #211b2e); }
    }

    .card-body { min-width: 0; }
    .card-header { align-items: flex-start; }
    .card-title { overflow-wrap: anywhere; }
  }

  @media (max-width: 720px) {
    .deal-card {
      grid-template-columns: minmax(76px, 28%) minmax(0, 1fr);
      align-items: start;
      gap: 0.75rem;
      padding: 0.85rem;

      .card-art { min-height: 108px; }
      .card-art .art-symbol { font-size: 2rem; }
      .card-art .art-label { font-size: 0.64rem; letter-spacing: 0.08em; }
      .card-body { min-width: 0; }
      .card-header { flex-direction: column; gap: 0.35rem; }
      .card-header .card-title { font-size: 0.98rem; }
      .card-summary { font-size: 0.82rem; margin-bottom: 0.65rem; }
      .card-footer { grid-column: 1 / -1; }
    }
  }

  @media (max-width: 360px) {
    .deal-card { grid-template-columns: 1fr; }
    .deal-card .card-art { min-height: 120px; }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  padding: 0 0 calc(64px + env(safe-area-inset-bottom, 0px));
  color: #f5fcff;
  background: linear-gradient(180deg, rgba(1, 29, 46, 0.3), rgba(1, 27, 43, 0.48)), url("/images/hero-starry-lake.webp") center / cover fixed no-repeat;
  box-sizing: border-box;
}

.share-page .share-container { width: 100%; max-width: 1440px; padding: 0 5.6%; box-sizing: border-box; }
.share-page .banner-section { max-width: none; }
.banner-section { max-width: 820px !important; margin: 26px 8px 20px !important; }
.banner-section .page-title { font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif; font-size: clamp(36px, 4vw, 52px) !important; letter-spacing: .08em; }
.banner-section .page-title .accent-bar { width: 6px !important; height: 1.45em !important; border-radius: 4px !important; box-shadow: 0 0 16px rgba(69, 232, 234, .5); }
.banner-section .page-subtitle { max-width: 720px; font-size: clamp(15px, 1.3vw, 18px) !important; line-height: 1.75 !important; color: rgba(240, 251, 255, .86) !important; }

.filter-toolbar { display: grid !important; grid-template-columns: minmax(260px, 1fr) auto !important; gap: 22px !important; margin: 0 16px 18px !important; }
.filter-toolbar .search-box input { min-height: 46px; border-color: rgba(193, 243, 255, .64) !important; background: rgba(7, 55, 72, .48) !important; color: #fff; font-size: 15px !important; }
.filter-toolbar .category-pills { gap: 12px !important; }
.filter-toolbar .category-pills .pill-btn { min-width: 94px; min-height: 44px; padding-inline: 22px !important; border-color: rgba(191, 232, 244, .5) !important; background: rgba(5, 48, 65, .5) !important; font-size: 15px !important; }
.filter-toolbar .category-pills .pill-btn.active { background: #43e2e4 !important; color: #042d3d !important; border-color: #43e2e4 !important; box-shadow: 0 0 18px rgba(67, 226, 228, .24) !important; }

.featured-card { min-height: 82px; box-sizing: border-box; margin: 0 0 18px !important; padding: 14px 22px !important; border-color: rgba(188, 238, 249, .44) !important; border-radius: 16px !important; background: linear-gradient(110deg, rgba(45, 112, 128, .55), rgba(4, 52, 70, .72)) !important; }
.featured-badge { min-width: 150px; justify-content: center; border-radius: 0 !important; background: transparent !important; border-right: 1px solid rgba(215, 248, 255, .5); color: #70f2ef !important; font-size: 16px !important; }
.featured-content { min-width: 0; }
.featured-content .f-icon { width: 48px; height: 48px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 12px; background: linear-gradient(135deg, #497ec4, #3659a0); color: #fff !important; font-size: 26px !important; }
.featured-content .f-title { font-size: 19px !important; }
.featured-content .f-desc { color: rgba(238, 251, 255, .82) !important; font-size: 14px !important; }
.featured-card .f-action { color: #69f0ee !important; }

.cards-grid { gap: 14px !important; }
.deal-card {
  min-height: 150px;
  display: grid !important;
  grid-template-columns: minmax(180px, 234px) minmax(0, 1fr) minmax(220px, 270px) !important;
  gap: 26px !important;
  align-items: center !important;
  padding: 14px 20px !important;
  border: 1px solid rgba(177, 231, 246, .38) !important;
  border-radius: 17px !important;
  background: linear-gradient(110deg, rgba(30, 97, 118, .54), rgba(5, 45, 63, .72)) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .08), 0 12px 30px rgba(0, 0, 0, .12) !important;
  backdrop-filter: blur(15px) !important;
  cursor: pointer;
}
.deal-card:hover { border-color: rgba(100, 240, 241, .72) !important; transform: translateY(-2px); }
.deal-card .card-art {
  min-height: 116px !important;
  overflow: hidden;
  border: 1px solid rgba(171, 232, 247, .38) !important;
  border-radius: 14px !important;
  background: radial-gradient(circle at 70% 20%, rgba(173, 232, 255, .72), transparent 31%), linear-gradient(155deg, #75a9cc, #255878 64%, #0b344f) !important;
}
.deal-card .card-art::before { width: 180px !important; height: 70px !important; border: 1px solid rgba(244, 253, 255, .38) !important; border-radius: 50%; transform: translate(8%, 42%) rotate(-15deg) !important; }
.deal-card .card-art::after { width: 160px !important; height: 58px !important; border: 1px solid rgba(244, 253, 255, .34) !important; border-radius: 50%; transform: translate(-10%, 75%) rotate(12deg) !important; }
.deal-card .card-art .art-orbit { inset: 21% 28% !important; border-color: rgba(246, 253, 255, .4) !important; }
.deal-card .card-art .art-symbol { font-size: 42px !important; text-shadow: 0 2px 16px rgba(3, 29, 58, .34) !important; }
.deal-card .card-art.art-vip { background: radial-gradient(circle at 70% 20%, rgba(241, 205, 255, .72), transparent 32%), linear-gradient(155deg, #79a8cc, #34577e 68%, #182c55) !important; }
.deal-card .card-art.art-deals { background: radial-gradient(circle at 68% 24%, rgba(255, 228, 190, .78), transparent 34%), linear-gradient(155deg, #c2a4a1, #6c6d84 66%, #263b59) !important; }
.deal-card .card-body { min-width: 0; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
.deal-card .card-header { justify-content: flex-start !important; align-items: center !important; flex-wrap: wrap; gap: 10px !important; margin: 0 0 5px !important; }
.deal-card .card-header .card-title { font-size: 20px !important; line-height: 1.35; }
.deal-card .invite-badge { color: #70f0ef !important; border: 1px solid rgba(79, 229, 229, .6) !important; background: rgba(16, 102, 112, .35) !important; }
.deal-card .disclosure-box { margin: 4px 0 7px !important; border-color: rgba(167, 224, 238, .38) !important; background: rgba(6, 54, 70, .42) !important; }
.deal-card .card-summary { margin: 0 0 10px !important; font-size: 14px !important; line-height: 1.55 !important; color: rgba(243, 250, 255, .86) !important; }
.deal-card .tags-group { display: flex; gap: 10px; align-items: center; }
.deal-card .cat-tag { padding: 5px 14px !important; border: 1px solid rgba(210, 239, 247, .58); border-radius: 999px !important; background: rgba(140, 189, 204, .16) !important; font-size: 13px !important; }
.deal-card .status-tag { padding: 5px 12px !important; border: 1px solid rgba(123, 243, 185, .38); border-radius: 999px !important; background: rgba(16, 110, 82, .32) !important; font-size: 13px !important; }
.deal-card .card-meta { min-width: 0; min-height: 104px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 9px; padding-left: 22px; border-left: 1px solid rgba(187, 232, 244, .32); }
.deal-card .meta-line { display: flex; gap: 10px; align-items: center; color: rgba(241, 250, 255, .88); font-size: 14px; line-height: 1.4; }
.deal-card .meta-line > span { width: 16px; color: rgba(216, 246, 255, .8); font-size: 18px; text-align: center; }
.deal-card .btn-detail { width: 100%; min-height: 42px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; margin-top: 2px; border: 1px solid #58e9e9; border-radius: 999px; background: rgba(4, 58, 73, .48); color: #8ff8f5; font: inherit; cursor: pointer; }
.deal-card .btn-detail:hover { background: #44dcde; color: #043344; }
.stream-status, .stream-empty { background: rgba(5, 54, 72, .62) !important; border-color: rgba(171, 231, 244, .4) !important; }

@media (max-width: 760px) {
  .share-page .share-container { padding: 0 18px; }
  .banner-section { margin: 28px 2px 17px !important; }
  .banner-section .page-title { font-size: 38px !important; }
  .banner-section .page-subtitle { font-size: 15px !important; line-height: 1.7 !important; }
  .filter-toolbar { display: flex !important; flex-direction: column; gap: 14px !important; margin: 0 0 18px !important; }
  .filter-toolbar .search-box { width: 100%; flex: auto !important; }
  .filter-toolbar .search-box input { min-height: 52px; font-size: 15px !important; }
  .filter-toolbar .category-pills { width: 100%; justify-content: space-between; gap: 8px !important; overflow: visible !important; }
  .filter-toolbar .category-pills .pill-btn { min-width: 0; flex: 1 1 0; min-height: 42px; padding: 0 10px !important; }
  .featured-card { min-height: 118px; display: grid !important; grid-template-columns: 1fr auto; gap: 8px !important; padding: 14px !important; }
  .featured-badge { grid-column: 1 / -1; justify-content: flex-start; min-width: 0; padding: 0 0 8px !important; border: 0 !important; border-bottom: 1px solid rgba(215, 248, 255, .24); }
  .featured-content { gap: 12px !important; }
  .featured-content .f-icon { width: 42px; height: 42px; }
  .featured-content .f-title { font-size: 16px !important; }
  .featured-content .f-desc { font-size: 12px !important; line-height: 1.45; }
  .featured-card .f-action { margin: 0 !important; align-self: center; font-size: 13px !important; }
  .cards-grid { gap: 13px !important; }
  .deal-card { grid-template-columns: 104px minmax(0, 1fr) !important; gap: 13px !important; padding: 12px !important; }
  .deal-card .card-art { min-height: 112px !important; }
  .deal-card .card-art .art-symbol { font-size: 34px !important; }
  .deal-card .card-header { flex-direction: row !important; align-items: flex-start !important; }
  .deal-card .card-header .card-title { font-size: 16px !important; }
  .deal-card .invite-badge { font-size: 11px !important; }
  .deal-card .card-summary { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; font-size: 13px !important; }
  .deal-card .tags-group { flex-wrap: wrap; gap: 6px; }
  .deal-card .cat-tag, .deal-card .status-tag { padding: 4px 9px !important; font-size: 11px !important; }
  .deal-card .card-meta { grid-column: 1 / -1; min-height: auto; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 8px; padding: 10px 0 0; border: 0; border-top: 1px solid rgba(187, 232, 244, .22); }
  .deal-card .meta-line { font-size: 12px; }
  .deal-card .btn-detail { grid-column: 1 / -1; min-height: 42px; margin: 0; }
  .stream-status, .stream-empty { min-height: 220px !important; margin-top: 18px !important; }
}

@media (max-width: 390px) {
  .share-page .share-container { padding: 0 14px; }
  .banner-section .page-title { font-size: 34px !important; }
  .filter-toolbar .category-pills .pill-btn { font-size: 13px !important; }
  .deal-card { grid-template-columns: 86px minmax(0, 1fr) !important; gap: 10px !important; }
  .deal-card .card-art { min-height: 100px !important; }
  .deal-card .card-summary { -webkit-line-clamp: 2; }
}

@media (prefers-reduced-motion: reduce) { .deal-card { transition: none !important; } }
</style>
