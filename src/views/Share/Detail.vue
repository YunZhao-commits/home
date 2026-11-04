<template>
  <div class="detail-page">
    <div class="detail-container">
      <!-- 顶部返回条与面包屑 -->
      <header class="detail-topbar">
        <div class="back-link" @click="router.push('/share')">
          <Left theme="outline" size="18" fill="#00e5c9" />
          <span>返回列表</span>
        </div>
        <div class="breadcrumbs">
          <span class="crumb-link" @click="router.push('/')">首页</span>
          <span class="sep">/</span>
          <span class="crumb-link" @click="router.push('/share')">精选分享</span>
          <span class="sep">/</span>
          <span class="crumb-cur">详情</span>
        </div>
      </header>

      <div v-if="loading" class="detail-loading">
        <LoadingFour theme="outline" size="26" fill="#00e5c9" class="spin" />
        <span>正在载入内容详情...</span>
      </div>

      <div v-else-if="!post" class="detail-empty">
        <div class="empty-icon">⚠️</div>
        <h3>未找到该分享条目</h3>
        <p>可能已被下架或链接有误。</p>
        <button class="btn-back" @click="router.push('/share')">返回精选列表</button>
      </div>

      <div v-else class="detail-layout">
        <!-- 左侧主内容区 -->
        <main class="main-card card-blur">
          <div class="article-header">
            <h1 class="article-title">{{ post.title }}</h1>
            <button class="btn-share-icon" @click="copyShareUrl" title="分享本页链接">
              <ShareTwo theme="outline" size="20" fill="rgba(255, 255, 255, 0.8)" />
            </button>
          </div>

          <div class="meta-badges">
            <span class="badge cat">{{ getCategoryLabel(post.category) }}</span>
            <span :class="['badge', 'status', post.status]">
              <i class="dot"></i>
              {{ post.status === 'expired' ? '已结束' : '正常可用' }}
            </span>
            <span class="badge time" v-if="post.updated_at">
              更新于 {{ formatDate(post.updated_at) }}
            </span>
            <span class="badge src" v-if="post.provider">
              来源: {{ post.provider }}
            </span>
          </div>

          <!-- 导读摘要框 -->
          <div class="intro-box" v-if="post.summary">
            <p>{{ post.summary }}</p>
          </div>

          <!-- 结构化文章内容 (支持 Markdown / 换行) -->
          <div class="content-body markdown-body" v-html="renderedContent"></div>

          <!-- 推广/邀请链接合规透明度披露说明 -->
          <section v-if="post.link_type === 'invite'" class="disclosure-section">
            <h3 class="section-title">
              <span class="bar"></span>
              <span>邀请链接说明</span>
            </h3>
            <div class="disclosure-content">
              <span class="info-icon">ⓘ</span>
              <p>
                {{ post.disclosure || '说明：此内容包含推荐或邀请链接。如果你通过此链接注册或开通，站长可能会获得平台提供的奖励（如积分或时长），你不会因此产生额外费用。仅在知情自愿情况下使用。' }}
              </p>
            </div>
          </section>

          <!-- 底部操作按钮 -->
          <div class="actions-row">
            <a
              :href="post.link_url"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="btn-primary"
            >
              <span>前往领取</span>
              <span class="icon">↗</span>
            </a>
            <button class="btn-secondary" @click="copyTargetUrl">
              <span>复制链接</span>
              <span class="icon">📋</span>
            </button>
          </div>
        </main>

        <!-- 右侧侧边栏摘要卡片 (桌面端) -->
        <aside class="sidebar-card card-blur">
          <div class="sidebar-header">
            <FileText theme="outline" size="18" fill="#00e5c9" />
            <span class="title">文章摘要</span>
          </div>

          <p class="sidebar-summary">
            {{ post.summary || '通过提供的信息了解该项目的相关权益、领取步骤与适用条件。' }}
          </p>

          <div class="meta-list">
            <div class="meta-row">
              <span class="label">🏷️ 分类</span>
              <span class="val">{{ getCategoryLabel(post.category) }}</span>
            </div>
            <div class="meta-row">
              <span class="label">⚡ 状态</span>
              <span :class="['val', 'status-val', post.status]">
                ● {{ post.status === 'expired' ? '已结束' : '正常可用' }}
              </span>
            </div>
            <div class="meta-row" v-if="post.updated_at">
              <span class="label">📅 更新</span>
              <span class="val">{{ formatDate(post.updated_at) }}</span>
            </div>
            <div class="meta-row" v-if="post.provider">
              <span class="label">🏛️ 来源</span>
              <span class="val">{{ post.provider }}</span>
            </div>
            <div class="meta-row">
              <span class="label">🔗 类型</span>
              <span class="val">{{ post.link_type === 'invite' ? '邀请/推广' : '普通链接' }}</span>
            </div>
          </div>

          <div class="sidebar-actions">
            <a
              :href="post.link_url"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="btn-primary"
            >
              <span>前往领取</span>
              <span class="icon">↗</span>
            </a>
            <button class="btn-secondary" @click="copyTargetUrl">
              <span>复制链接</span>
              <span class="icon">📋</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Left, ShareTwo, LoadingFour, FileText } from "@icon-park/vue-next";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ElMessage } from "element-plus";
import { getPostDetail } from "@/api/posts";

const route = useRoute();
const router = useRouter();

const post = ref(null);
const loading = ref(true);

const fetchDetail = async () => {
  const id = route.params.id;
  if (!id) return;
  loading.value = true;
  try {
    post.value = await getPostDetail(id);
  } finally {
    loading.value = false;
  }
};

const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return "";
  return DOMPurify.sanitize(marked.parse(post.value.content));
});

const getCategoryLabel = (cat) => {
  const map = { tools: "工具", vip: "会员福利", deals: "限时优惠" };
  return map[cat] || "精选分享";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

const copyTargetUrl = async () => {
  if (!post.value || !post.value.link_url) return;
  try {
    await navigator.clipboard.writeText(post.value.link_url);
    ElMessage.success("链接已复制到剪贴板");
  } catch {
    ElMessage.info(`链接: ${post.value.link_url}`);
  }
};

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    ElMessage.success("本页分享链接已复制");
  } catch {
    ElMessage.info("请直接复制浏览器地址栏链接");
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style lang="scss" scoped>
.detail-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.5rem 1rem calc(4rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #efefef;

  .detail-container {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
  }

  .detail-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #00e5c9;
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateX(-3px);
      }
    }

    .breadcrumbs {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);

      .crumb-link {
        cursor: pointer;
        &:hover {
          color: #00e5c9;
        }
      }
      .sep {
        margin: 0 0.4rem;
        opacity: 0.4;
      }
      .crumb-cur {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .detail-loading,
  .detail-empty {
    padding: 5rem 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.65);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .spin {
      animation: spin 1.5s linear infinite;
    }
    .empty-icon {
      font-size: 2.5rem;
    }
    .btn-back {
      padding: 0.6rem 1.5rem;
      border-radius: 50px;
      border: 1px solid #00e5c9;
      background: rgba(0, 229, 201, 0.15);
      color: #00e5c9;
      cursor: pointer;
    }
  }

  .detail-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
    gap: 1.5rem;
    align-items: start;
  }

  .main-card {
    background: rgba(8, 28, 36, 0.7);
    border: 1px solid rgba(0, 229, 201, 0.25);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(14px);

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.85rem;

      .article-title {
        font-size: 1.65rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
        line-height: 1.35;
      }

      .btn-share-icon {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;

        &:hover {
          background: rgba(0, 229, 201, 0.2);
          border-color: #00e5c9;
        }
      }
    }

    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;

      .badge {
        padding: 0.25rem 0.65rem;
        border-radius: 6px;
        font-size: 0.8rem;

        &.cat {
          background: rgba(0, 229, 201, 0.12);
          color: #00e5c9;
          border: 1px solid rgba(0, 229, 201, 0.3);
        }

        &.status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(82, 196, 26, 0.12);
          color: #52c41a;

          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #52c41a;
          }

          &.expired {
            color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.08);
            .dot {
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }

        &.time,
        &.src {
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }

    .intro-box {
      background: linear-gradient(135deg, rgba(8, 36, 42, 0.85), rgba(5, 20, 25, 0.85));
      border: 1px solid rgba(0, 229, 201, 0.3);
      border-radius: 12px;
      padding: 1.15rem 1.4rem;
      margin-bottom: 1.75rem;

      p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.65;
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .content-body {
      font-size: 0.95rem;
      line-height: 1.75;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 2rem;

      :deep(h2),
      :deep(h3) {
        color: #ffffff;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;

        &::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 1.1em;
          background: #00e5c9;
          margin-right: 0.6rem;
          border-radius: 2px;
        }
      }

      :deep(ol),
      :deep(ul) {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
      }

      :deep(li) {
        margin-bottom: 0.4rem;
      }
    }

    .disclosure-section {
      background: rgba(0, 229, 201, 0.06);
      border: 1px dashed rgba(0, 229, 201, 0.35);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.05rem;
        font-weight: 600;
        color: #00e5c9;
        margin: 0 0 0.65rem;

        .bar {
          width: 3px;
          height: 14px;
          background: #00e5c9;
          border-radius: 2px;
        }
      }

      .disclosure-content {
        display: flex;
        gap: 0.65rem;
        font-size: 0.88rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.8);

        .info-icon {
          color: #00e5c9;
          font-weight: bold;
        }
        p {
          margin: 0;
        }
      }
    }

    .actions-row {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);

      .btn-primary,
      .btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.85rem 2rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.25s;
      }

      .btn-primary {
        background: #00e5c9;
        border: 1px solid #00e5c9;
        color: #05161c;
        box-shadow: 0 4px 18px rgba(0, 229, 201, 0.35);

        &:hover {
          background: #1affdf;
          box-shadow: 0 6px 24px rgba(0, 229, 201, 0.5);
          transform: translateY(-2px);
        }
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;

        &:hover {
          border-color: #00e5c9;
          color: #00e5c9;
        }
      }
    }
  }

  // 侧边栏
  .sidebar-card {
    background: rgba(8, 28, 36, 0.65);
    border: 1px solid rgba(0, 229, 201, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(14px);
    position: sticky;
    top: 1.5rem;

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 1rem;
    }

    .sidebar-summary {
      font-size: 0.88rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }

    .meta-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.5rem;

      .meta-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;

        .label {
          color: rgba(255, 255, 255, 0.6);
        }
        .val {
          color: #ffffff;
          font-weight: 500;
        }
        .status-val {
          color: #52c41a;
          &.expired {
            color: rgba(255, 255, 255, 0.45);
          }
        }
      }
    }

    .sidebar-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .btn-primary,
      .btn-secondary {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #00e5c9;
        border: 1px solid #00e5c9;
        color: #05161c;
        &:hover {
          background: #1affdf;
        }
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        &:hover {
          border-color: #00e5c9;
          color: #00e5c9;
        }
      }
    }
  }

  // 移动端适配
  @media (max-width: 820px) {
    padding: 1rem 0.75rem calc(4.5rem + env(safe-area-inset-bottom, 0px));

    .detail-layout {
      grid-template-columns: 1fr;
    }

    .sidebar-card {
      display: none; // 移动端直接使用主卡片底部的双按钮，无需侧边栏重复显示
    }

    .main-card {
      padding: 1.25rem 1rem;
      min-width: 0;

      .article-header .article-title {
        font-size: 1.35rem;
      }

      .actions-row {
        flex-direction: row;

        .btn-primary,
        .btn-secondary {
          flex: 1;
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
          min-height: 44px;
        }
      }
    }
  }

  @media (max-width: 420px) {
    padding-inline: 0.65rem;

    .detail-topbar {
      align-items: flex-start;
      gap: 0.75rem;
      flex-direction: column;

      .breadcrumbs { font-size: 0.78rem; }
    }

    .main-card {
      padding: 1rem 0.85rem;

      .article-header .article-title { font-size: 1.2rem; }
      .actions-row {
        flex-direction: column;
        .btn-primary,
        .btn-secondary { width: 100%; }
      }
    }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
