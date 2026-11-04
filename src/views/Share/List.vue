<template>
  <div class="share-page">
    <div class="share-container">
      <!-- 顶部轻量导航 -->
      <header class="share-header">
        <div class="brand" @click="router.push('/')">
          <img class="avatar" src="/images/avatar.png" alt="Yunchu" />
          <div class="brand-text">
            <span class="main">Yunchu Studio</span>
            <span class="sub">云初工作室</span>
          </div>
        </div>

        <nav class="nav-links">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/share" class="nav-item active">精选分享</router-link>
          <router-link to="/about" class="nav-item">关于本站</router-link>
        </nav>
      </header>

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
            v-model="searchQuery"
            type="text"
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
      <section class="featured-card" v-if="featuredPost" @click="goDetail(featuredPost.id)">
        <div class="featured-badge">★ 本期推荐</div>
        <div class="featured-content">
          <div class="f-icon">✦</div>
          <div class="f-info">
            <h3 class="f-title">{{ featuredPost.title }}</h3>
            <p class="f-desc">{{ featuredPost.summary || '重点推荐方案，稳定好用，性价比高。' }}</p>
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
              <span class="art-label">{{ getCategoryLabel(item.category) }}</span>
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

              <div class="card-footer">
                <div class="tags-group">
                  <span class="cat-tag">{{ getCategoryLabel(item.category) }}</span>
                  <span :class="['status-tag', item.status]">
                    <i class="dot"></i>
                    {{ item.status === 'expired' ? '已结束' : '正常可用' }}
                  </span>
                </div>

                <div class="meta-group">
                  <span class="meta-item" v-if="item.updated_at">
                    🔄 更新: {{ formatDate(item.updated_at) }}
                  </span>
                  <span class="meta-item" v-if="item.provider">
                    🏛️ 提供方: {{ item.provider }}
                  </span>
                </div>

                <div class="action-wrap">
                  <button class="btn-detail">
                    <span>查看详情</span>
                    <span class="arr">→</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, LoadingFour } from "@icon-park/vue-next";
import { getPublicPosts } from "@/api/posts";

const router = useRouter();

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

const fetchPosts = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { list, error } = await getPublicPosts({
      category: currentCategory.value,
      keyword: searchQuery.value,
    });
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
    loading.value = false;
  }
};

const selectCategory = (key) => {
  currentCategory.value = key;
  fetchPosts();
};

let searchTimer = null;
const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchPosts();
  }, 300);
};

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
