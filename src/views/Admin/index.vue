<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- 1. 未登录状态：口令鉴权卡片 -->
      <div v-if="!isLoggedIn" class="login-box card-blur">
        <div class="login-header">
          <img class="avatar" src="/images/avatar.png" alt="logo" />
          <h2>站长管理终端</h2>
          <p>请输入管理员邮箱和密码</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="input-wrap">
            <span class="input-icon" aria-hidden="true">✉</span>
            <input v-model="email" type="email" placeholder="请输入管理员邮箱" aria-label="管理员邮箱" autocomplete="username" required />
          </div>
          <div class="input-wrap">
            <Lock theme="outline" size="18" fill="rgba(255,255,255,0.6)" class="input-icon" />
            <input
              v-model="password"
              type="password"
              placeholder="请输入管理密码"
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" class="btn-login" :disabled="loggingIn">
            <span v-if="loggingIn">验证中...</span>
            <span v-else>登录后台</span>
          </button>
        </form>

        <div class="login-footer">
          <router-link to="/" class="back-home">← 返回公开站点</router-link>
        </div>
      </div>

      <!-- 2. 已登录状态：内容管理面板 -->
      <div v-else class="dashboard-box card-blur">
        <aside class="admin-sidebar" aria-label="管理导航">
          <RouterLink class="side-brand" to="/">
            <img src="/images/avatar.png" alt="" />
            <span>Yunchu Studio</span>
          </RouterLink>
          <button :class="['side-link', { active: activeTab === 'posts' }]" type="button" @click="switchTab('posts')"><span aria-hidden="true">▦</span> 内容管理</button>
          <button class="side-link" type="button" @click="openCreateModal"><span aria-hidden="true">＋</span> 新增内容</button>
          <button :class="['side-link', { active: activeTab === 'categories' }]" type="button" @click="switchTab('categories')"><span aria-hidden="true">◇</span> 分类管理</button>
          <button :class="['side-link', { active: activeTab === 'settings' }]" type="button" @click="switchTab('settings')"><span aria-hidden="true">⚙</span> 站点设置</button>
          <button :class="['side-link', { active: activeTab === 'login-logs' }]" type="button" @click="switchTab('login-logs')"><span aria-hidden="true">◷</span> 登录记录</button>
          <RouterLink class="side-link public-link" to="/share"><span aria-hidden="true">↗</span> 查看公开站</RouterLink>
        </aside>

        <div class="dashboard-main">
        <!-- 头部栏 -->
        <header class="dash-header">
          <div class="dash-title">
            <div class="brand-row">
              <span class="logo">Yunchu Studio</span>
              <span class="badge">站长后台</span>
            </div>
            <h1>{{ activeTab === "posts" ? "内容管理" : activeTab === "categories" ? "分类管理" : activeTab === "login-logs" ? "登录记录" : "站点设置" }}</h1>
            <p class="subtitle">管理精选分享内容，支持新增、编辑、草稿保存与软下架，数据实时生效。</p>
          </div>

          <div class="dash-actions">
            <button class="btn-add" @click="openCreateModal">
              <span>➕ 新增分享</span>
            </button>
            <button class="btn-logout" @click="handleLogout" title="退出登录">退出</button>
          </div>
        </header>

        <nav class="management-tabs" aria-label="后台功能"><button v-for="tab in [{id:'posts',name:'内容管理'},{id:'categories',name:'分类管理'},{id:'settings',name:'站点设置'},{id:'login-logs',name:'登录记录'}]" :key="tab.id" type="button" :class="{active:activeTab===tab.id}" @click="switchTab(tab.id)">{{tab.name}}</button></nav>
        <div v-if="activeTab === 'posts'">
        <!-- 筛选栏 -->
        <section class="toolbar-section">
          <div class="search-input">
            <Search theme="outline" size="16" fill="rgba(255,255,255,0.6)" class="icon" />
            <input v-model="filterKeyword" type="text" placeholder="搜索标题或简介..." />
          </div>

          <div class="filter-dropdowns">
            <select v-model="filterCategory">
              <option value="all">全部分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
            </select>

            <select v-model="filterStatus">
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="expired">已结束</option>
              <option value="offline">已下架</option>
              <option value="deleted">回收站</option>
            </select>
          </div>
        </section>

        <!-- 内容列表 (桌面端表格 / 移动端卡片) -->
        <section class="content-table-wrap">
          <div v-if="loadingList" class="loading-state">
            <span>正在同步云端内容列表...</span>
          </div>

          <div v-else-if="listError" class="empty-state" role="alert"><span>{{listError}}</span><button type="button" class="btn-action" @click="loadAdminList">重新加载</button></div>
          <div v-else-if="filteredList.length === 0" class="empty-state">
            <span>暂无匹配的内容记录</span>
          </div>

          <!-- 桌面端表格 -->
          <table v-else class="desktop-table">
            <thead>
              <tr>
                <th style="width: 35%;">标题与摘要</th>
                <th>分类</th>
                <th>类型</th>
                <th>状态</th>
                <th>更新时间</th>
                <th style="text-align: right;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredList" :key="item.id">
                <td>
                  <div class="title-cell"><img v-if="item.cover_url" class="admin-cover" :src="item.cover_url" alt="" loading="lazy" />
                    <span class="star" v-if="item.is_featured">★</span>
                    <strong class="item-title">{{ item.title }}</strong>
                    <p class="item-summary">{{ item.summary }}</p>
                  </div>
                </td>
                <td>
                  <span class="cat-pill">{{ getCategoryText(item.category) }}</span>
                </td>
                <td>
                  <span :class="['type-pill', item.link_type]">
                    {{ item.link_type === 'invite' ? '🔗 邀请' : '普通' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-pill', item.status]">
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
                <td class="date-cell">{{ formatDate(item.updated_at) }}</td>
                <td style="text-align: right;">
                  <div class="row-actions">
                    <button class="btn-action edit" @click="openEditModal(item)">编辑</button>
                    <button
                      class="btn-action toggle"
                      @click="togglePublishStatus(item)"
                    >
                      {{ item.status === "deleted" ? "恢复草稿" : item.status === "published" ? "下架" : "发布" }}
                    </button>
                    <button v-if="item.status !== 'deleted'" class="btn-action delete" @click="confirmDelete(item.id)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 移动端卡片流 -->
          <div class="mobile-card-list">
            <div v-for="item in filteredList" :key="item.id" class="m-card">
              <div class="m-card-top">
                <span class="m-title">{{ item.title }}</span>
                <span :class="['status-pill', item.status]">
                  {{ getStatusText(item.status) }}
                </span>
              </div>
              <p class="m-summary">{{ item.summary }}</p>
              <div class="m-meta">
                <span>{{ getCategoryText(item.category) }}</span>
                <span>{{ item.link_type === 'invite' ? '邀请链接' : '普通' }}</span>
                <span>{{ formatDate(item.updated_at) }}</span>
              </div>
              <div class="m-actions">
                <button class="btn-action edit" @click="openEditModal(item)">编辑</button>
                <button class="btn-action toggle" @click="togglePublishStatus(item)">
                  {{ item.status === "deleted" ? "恢复草稿" : item.status === "published" ? "下架" : "发布" }}
                </button>
                <button v-if="item.status !== 'deleted'" class="btn-action delete" @click="confirmDelete(item.id)">删除</button>
              </div>
            </div>
          </div>
        </section>

        </div>
        <LoginLogs v-else-if="activeTab === 'login-logs'" :token="token" />
        <ManagementPanel v-else :key="activeTab" :token="token" :tab="activeTab" />
      <!-- 3. 编辑 / 新增抽屉弹窗 -->
      <div v-if="showModal" class="modal-overlay" @click.self="!uploading && (showModal = false)">
        <div class="modal-window card-blur">
          <div class="modal-header">
            <span class="editor-handle" aria-hidden="true"></span>
            <h3>{{ isEditMode ? '✏️ 编辑分享内容' : '➕ 新增精选分享' }}</h3>
            <button class="btn-close" :disabled="uploading" aria-label="关闭编辑面板" @click="showModal = false">×</button>
          </div>

          <form class="modal-body" @submit.prevent="savePost">
            <div class="form-row">
              <label>标题 <span class="req">*</span></label>
              <input v-model="form.title" type="text" placeholder="输入醒目标题" required />
            </div>

            <div class="form-row"><label>文章封面（可选）</label><CoverUploader v-model="form.cover_url" :token="token" @busy="uploading = $event" /></div>
            <div class="form-row">
              <label>简介摘要 (建议 200 字内)</label>
              <textarea
                v-model="form.summary"
                rows="2"
                placeholder="简明扼要的一两句话介绍"
              ></textarea>
            </div>

            <div class="form-row">
              <label>详细正文与领取步骤 (支持 Markdown 换行) <span class="req">*</span></label>
              <textarea
                v-model="form.content"
                rows="6"
                placeholder="### 福利内容&#10;说明具体权益...&#10;&#10;### 领取步骤&#10;1. 打开链接...&#10;2. 完成注册..."
                required
              ></textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-row">
                <label>所属分类 <span class="req">*</span></label>
                <select v-model="form.category">
                  <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
                </select>
              </div>

              <div class="form-row">
                <label>链接类型</label>
                <div class="radio-group">
                  <label>
                    <input type="radio" value="normal" v-model="form.link_type" />
                    普通参考链接
                  </label>
                  <label>
                    <input type="radio" value="invite" v-model="form.link_type" />
                    邀请/推广链接 (透明披露)
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row" v-if="form.link_type === 'invite'">
              <label>邀请链接透明说明 (若可获得奖励需明确告知)</label>
              <input
                v-model="form.disclosure"
                type="text"
                placeholder="例：通过此邀请链接注册，我可能会获得平台提供的奖励..."
              />
            </div>

            <div class="form-grid-2">
              <div class="form-row">
                <label>跳转链接地址 <span class="req">*</span></label>
                <input v-model="form.link_url" type="url" placeholder="https://..." required />
              </div>

              <div class="form-row">
                <label>来源 / 提供方名称</label>
                <input v-model="form.provider" type="text" placeholder="例：OpenAI / 某云盘" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-row">
                <label>有效期</label>
                <select v-model="form.validity">
                  <option value="permanent">长期有效</option>
                  <option value="limited">短期 / 视平台规则</option>
                </select>
              </div>

              <div class="form-row">
                <label>发布状态 <span class="req">*</span></label>
                <select v-model="form.status">
                  <option value="published">立即发布 (前台可见)</option>
                  <option value="draft">保存为草稿 (仅后台可见)</option>
                  <option value="expired">已结束</option>
                  <option value="offline">下架隐藏</option>
                </select>
              </div>
            </div>

            <div class="form-row checkbox-row">
              <label>
                <input type="checkbox" v-model="form.is_featured" />
                设为本期首页置顶推荐 (Featured)
              </label>
            </div>

            <div class="modal-footer">
              <button v-if="['expired','offline'].includes(form.status)" type="submit" class="btn-draft" :disabled="saving || uploading">按当前状态保存</button>
              <button type="submit" class="btn-draft" :disabled="saving || uploading" @click="form.status = 'draft'">
                保存草稿
              </button>
              <button type="submit" class="btn-submit" :disabled="saving || uploading" @click="form.status = 'published'">
                <span v-if="saving">保存中...</span>
                <span v-else>{{ isEditMode ? '保存并发布' : '发布' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ManagementPanel from '@/components/ManagementPanel.vue';
import LoginLogs from '@/components/LoginLogs.vue';
import CoverUploader from '@/components/CoverUploader.vue';
import { useSite } from '@/composables/useSite';
import { RouterLink } from "vue-router";
import { Lock, Search } from "@icon-park/vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  adminLogin,
  adminGetPosts,
  adminSavePost,
  adminDeletePost,
} from "@/api/posts";

const { categories, categoryName } = useSite();
const activeTab = ref('posts');
const uploading = ref(false);
const listError = ref('');
const switchTab = tab => { if (uploading.value) return; activeTab.value = tab; showModal.value = false; };
const isLoggedIn = ref(false);
const email = ref("");
const password = ref("");
const loggingIn = ref(false);
const token = ref("");

const postsList = ref([]);
const loadingList = ref(false);
const filterKeyword = ref("");
const filterCategory = ref("all");
const filterStatus = ref("all");

// 弹窗状态与表单模型
const showModal = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const form = ref({
  id: "",
  title: "",
  summary: "",
  content: "",
  category: "tools",
  link_type: "normal",
  link_url: "",
  disclosure: "",
  validity: "permanent",
  provider: "",
  status: "draft",
  is_featured: false,
  cover_url: "",
});

// 登录处理
const handleLogin = async () => {
  if (!email.value.trim() || !password.value) return;
  loggingIn.value = true;
  try {
    const res = await adminLogin(email.value.trim(), password.value);
    if (res.token) {
      token.value = res.token;
      sessionStorage.setItem("admin_token", res.token);
      isLoggedIn.value = true;
      ElMessage.success("登录成功");
      loadAdminList();
    } else {
      ElMessage.error(res.error || "口令验证未通过");
    }
  } catch {
    ElMessage.error("登录服务暂时不可用，请稍后重试");
  } finally {
    loggingIn.value = false;
    password.value = "";
  }
};

const handleLogout = () => {
  sessionStorage.removeItem("admin_token");
  token.value = "";
  isLoggedIn.value = false;
  ElMessage.info("已退出后台");
};

// 加载后台列表
const loadAdminList = async () => {
  loadingList.value = true;
  listError.value = "";
  try {
    const res = await adminGetPosts(token.value);
    if (res.status === 401) { handleLogout(); throw new Error('登录已过期，请重新登录'); }
    if (res.error) throw new Error(res.error);
    if (res.data && Array.isArray(res.data)) {
      postsList.value = res.data;
    } else {
      postsList.value = [];
      if (res.error) ElMessage.error(res.error);
    }
  } catch (error) {
    postsList.value = [];
    listError.value = error.message || "无法读取云端内容，请刷新或重新登录";
  } finally {
    loadingList.value = false;
  }
};

// 筛选计算
const filteredList = computed(() => {
  return postsList.value.filter((item) => {
    const matchCat = filterCategory.value === "all" || item.category === filterCategory.value;
    const matchStatus = filterStatus.value === "all" || item.status === filterStatus.value;
    const q = filterKeyword.value.trim().toLowerCase();
    const matchKw =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q));
    return matchCat && matchStatus && matchKw && (filterStatus.value === "deleted" || item.status !== "deleted");
  });
});

// 打开新增弹窗
const openCreateModal = () => {
  if (uploading.value) return;
  activeTab.value = "posts";
  isEditMode.value = false;
  form.value = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: "",
    summary: "",
    content: "",
    category: categories.value[0]?.id || "tools",
    link_type: "normal",
    link_url: "",
    disclosure: "",
    validity: "permanent",
    provider: "",
    status: "draft",
    is_featured: false,
  cover_url: "",
  };
  showModal.value = true;
};

// 打开编辑弹窗
const openEditModal = (item) => {
  isEditMode.value = true;
  form.value = { ...item, is_featured: Boolean(item.is_featured) };
  showModal.value = true;
};

// 保存提交
const savePost = async () => {
  if (saving.value || uploading.value) return;
  saving.value = true;
  try {
    const res = await adminSavePost(form.value, token.value, isEditMode.value);
    if (res.success || res.id) {
      ElMessage.success(
        form.value.status === "draft"
          ? "草稿已保存"
          : form.value.status === "published"
            ? (isEditMode.value ? "内容已更新并发布" : "新内容已发布")
            : "内容已保存",
      );
      showModal.value = false;
      loadAdminList();
    } else {
      ElMessage.error(res.error || "云端保存失败，内容未更改");
    }
  } catch (err) {
    ElMessage.error("保存失败: " + err.message);
  } finally {
    saving.value = false;
  }
};

// 快捷下架/发布切换
const togglePublishStatus = async (item) => {
  const newStatus = item.status === "deleted" ? "draft" : item.status === "published" ? "offline" : "published";
  try {
    const res = await adminSavePost({ id: item.id, status: newStatus }, token.value, true);
    if (!res.success) throw new Error(res.error || "云端更新失败");
    item.status = newStatus;
    ElMessage.success(newStatus === 'draft' ? '已恢复为草稿' : newStatus === 'published' ? '已发布' : '已下架');
  } catch (error) {
    ElMessage.error(error.message || "状态更新失败，云端内容未更改");
  }
};

// 安全删除二次确认
const confirmDelete = (id) => {
  ElMessageBox.confirm("将这篇分享移到回收站？前台将不可见，可在回收站恢复为草稿。", "移到回收站", {
    confirmButtonText: "移到回收站",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await adminDeletePost(id, token.value);
        if (!res.success) throw new Error(res.error || "云端删除失败");
        postsList.value = postsList.value.filter((p) => p.id !== id);
        ElMessage.success("已移到回收站，可在状态筛选中恢复");
      } catch (error) {
        ElMessage.error(error.message || "删除失败，云端内容未更改");
      }
    })
    .catch(() => {});
};

const getCategoryText = categoryName;

const getStatusText = (status) => {
  const map = {
    published: "已发布",
    draft: "草稿",
    expired: "已结束",
    offline: "已下架",
    deleted: "回收站",
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

onMounted(() => {
  const savedToken = sessionStorage.getItem("admin_token");
  if (savedToken) {
    // 清除开发环境遗留的模拟凭据，生产后台只接受服务端签发的令牌。
    if (!import.meta.env.DEV && savedToken.startsWith("mock_token_")) {
      sessionStorage.removeItem("admin_token");
      return;
    }
    token.value = savedToken;
    isLoggedIn.value = true;
    loadAdminList();
  }
});
</script>

<style lang="scss" scoped>
.admin-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 2rem 1rem calc(4rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #efefef;
  overflow-x: hidden;

  .admin-container {
    width: 100%;
    min-width: 0;
    max-width: 1080px;
    margin: 0 auto;
  }

  // 1. 登录卡片
  .login-box {
    max-width: 420px;
    margin: 6rem auto 0;
    padding: 2.5rem 2rem;
    background: rgba(8, 28, 36, 0.8);
    border: 1px solid rgba(0, 229, 201, 0.35);
    border-radius: 20px;
    text-align: center;
    backdrop-filter: blur(16px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

    .login-header {
      margin-bottom: 2rem;

      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid #00e5c9;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.5rem;
        color: #ffffff;
        margin: 0 0 0.5rem;
      }
      p {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .input-wrap {
        position: relative;
        display: flex;
        align-items: center;

        .input-icon {
          position: absolute;
          left: 1rem;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.8rem;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(0, 229, 201, 0.3);
          border-radius: 50px;
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;

          &:focus {
            border-color: #00e5c9;
            box-shadow: 0 0 12px rgba(0, 229, 201, 0.3);
          }
        }
      }

      .btn-login {
        padding: 0.85rem;
        border-radius: 50px;
        border: none;
        background: #00e5c9;
        color: #05161c;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #1affdf;
          box-shadow: 0 4px 20px rgba(0, 229, 201, 0.4);
        }
      }
    }

    .login-footer {
      margin-top: 1.5rem;
      .back-home {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
        text-decoration: none;
        &:hover {
          color: #00e5c9;
        }
      }
    }
  }

  // 2. 仪表板
  .dashboard-box {
    background: rgba(8, 28, 36, 0.75);
    border: 1px solid rgba(0, 229, 201, 0.25);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(14px);

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .brand-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.35rem;

        .logo {
          font-family: "Pacifico-Regular", cursive;
          font-size: 1.4rem;
          color: #ffffff;
        }

        .badge {
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          background: rgba(0, 229, 201, 0.15);
          color: #00e5c9;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(0, 229, 201, 0.3);
        }
      }

      .subtitle {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
      }

      .dash-actions {
        display: flex;
        gap: 0.75rem;

        .btn-add {
          padding: 0.65rem 1.4rem;
          border-radius: 50px;
          border: none;
          background: #00e5c9;
          color: #05161c;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #1affdf;
            box-shadow: 0 4px 16px rgba(0, 229, 201, 0.35);
          }
        }

        .btn-logout {
          padding: 0.65rem 1rem;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;

          &:hover {
            border-color: #ff4d4f;
            color: #ff4d4f;
          }
        }
      }
    }

    .toolbar-section {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      .search-input {
        position: relative;
        flex: 1 1 260px;
        display: flex;
        align-items: center;

        .icon {
          position: absolute;
          left: 0.85rem;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;

          &:focus {
            border-color: #00e5c9;
          }
        }
      }

      .filter-dropdowns {
        display: flex;
        gap: 0.75rem;

        select {
          padding: 0.65rem 1rem;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #ffffff;
          outline: none;
          cursor: pointer;

          option {
            background: #081c24;
            color: #ffffff;
          }
        }
      }
    }

    .desktop-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;

      th {
        text-align: left;
        padding: 0.75rem 0.85rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.55);
        font-weight: 500;
      }

      td {
        padding: 1rem 0.85rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        vertical-align: middle;
      }

      .title-cell {
        .star {
          color: #faad14;
          margin-right: 0.35rem;
        }
        .item-title {
          color: #ffffff;
          font-size: 0.95rem;
        }
        .item-summary {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0.25rem 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .cat-pill {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 0.75rem;
      }

      .type-pill {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        &.invite {
          background: rgba(0, 229, 201, 0.15);
          color: #00e5c9;
        }
      }

      .status-pill {
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        font-size: 0.75rem;

        &.published {
          background: rgba(82, 196, 26, 0.15);
          color: #52c41a;
        }
        &.draft {
          background: rgba(250, 173, 20, 0.15);
          color: #faad14;
        }
        &.expired {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }
        &.offline {
          background: rgba(255, 77, 79, 0.15);
          color: #ff4d4f;
        }
      }

      .date-cell {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
      }

      .row-actions {
        display: inline-flex;
        gap: 0.4rem;

        .btn-action {
          padding: 0.35rem 0.65rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;

          &.edit:hover {
            border-color: #00e5c9;
            color: #00e5c9;
          }
          &.toggle:hover {
            border-color: #faad14;
            color: #faad14;
          }
          &.delete:hover {
            border-color: #ff4d4f;
            color: #ff4d4f;
          }
        }
      }
    }

    .mobile-card-list {
      display: none;
    }
  }

  // 3. 模态窗口
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;

    .modal-window {
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      overflow-y: auto;
      background: rgba(8, 28, 36, 0.95);
      border: 1px solid rgba(0, 229, 201, 0.35);
      border-radius: 20px;
      padding: 1.75rem;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #ffffff;
        }
        .btn-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.5rem;
          cursor: pointer;
          &:hover {
            color: #ffffff;
          }
        }
      }

      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          label {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.8);
            .req {
              color: #ff4d4f;
            }
          }

          input[type="text"],
          input[type="url"],
          input[type="password"],
          textarea,
          select {
            width: 100%;
            box-sizing: border-box;
            padding: 0.65rem 0.85rem;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #ffffff;
            font-size: 0.9rem;
            outline: none;

            &:focus {
              border-color: #00e5c9;
            }
          }

          textarea {
            resize: vertical;
            line-height: 1.5;
          }

          .radio-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem 1.25rem;
            font-size: 0.88rem;
            margin-top: 0.35rem;

            label {
              display: flex;
              align-items: center;
              gap: 0.35rem;
              cursor: pointer;
            }
          }
        }

        .checkbox-row {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);

          .btn-cancel,
          .btn-submit {
            padding: 0.65rem 1.5rem;
            border-radius: 50px;
            font-size: 0.95rem;
            cursor: pointer;
          }

          .btn-cancel {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
          }

          .btn-submit {
            background: #00e5c9;
            border: none;
            color: #05161c;
            font-weight: 600;

            &:hover {
              background: #1affdf;
            }
          }
        }
      }
    }
  }

  // 移动端视图
  @media (max-width: 768px) {
    padding: 1rem 0.5rem calc(4.5rem + env(safe-area-inset-bottom, 0px));

    .dashboard-box {
      width: 100%;
      min-width: 0;
      padding: 1.25rem 1rem;

      .dash-header {
        flex-direction: column;
        gap: 1rem;

        .dash-actions {
          width: 100%;
          .btn-add {
            flex: 1;
            min-height: 44px;
          }
        }
      }

      .toolbar-section {
        flex-direction: column;
        align-items: stretch;

        .filter-dropdowns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-width: 0;

          select { min-width: 0; width: 100%; }
        }
      }

      .desktop-table {
        display: none;
      }

      .mobile-card-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;

        .m-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem;

          .m-card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.4rem;

            .m-title {
              min-width: 0;
              overflow-wrap: anywhere;
              font-weight: 600;
              font-size: 0.95rem;
              color: #ffffff;
            }
          }

          .m-summary {
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 0.65rem;
          }

          .m-meta {
            display: flex;
            flex-wrap: wrap;
            min-width: 0;
            gap: 0.75rem;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.45);
            margin-bottom: 0.75rem;
          }

          .m-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            .btn-action {
              flex: 1;
              min-height: 38px;
              border-radius: 6px;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #ffffff;
              font-size: 0.82rem;
            }
          }
        }
      }
    }

    .login-box {
      width: 100%;
      min-width: 0;
      padding: 1.5rem 1.1rem;
    }

    .modal-overlay {
      padding: 0.5rem;

      .modal-window {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding: 1.25rem 1rem;

        .modal-body .form-grid-2 {
          grid-template-columns: 1fr;
        }
      }
    }
  }

  @media (max-width: 380px) {
    .dashboard-box { padding: 1rem 0.75rem; }
    .dashboard-box .dash-actions { flex-wrap: wrap; }
    .dashboard-box .toolbar-section .filter-dropdowns { grid-template-columns: 1fr; }
    .dashboard-box .mobile-card-list .m-card .m-actions .btn-action { min-width: 84px; }
  }
}
.management-tabs{display:none}.admin-cover{width:66px;height:42px;object-fit:cover;border-radius:7px;float:left;margin:0 10px 5px 0}.admin-page .modal-overlay .modal-window .modal-body > .form-row{min-width:0}.status-pill.deleted{color:#ccd8de;background:#6a7e8844}@media(max-width:768px){.management-tabs{display:flex;gap:8px;margin:0 0 16px}.management-tabs button{flex:1;min-height:42px;padding:8px;border:1px solid #8be0ec44;background:#13465b88;border-radius:10px;color:#daf5ff}.management-tabs button.active{background:#35dadb;color:#053543}.admin-page .modal-overlay .modal-footer{display:flex;flex-wrap:wrap}.admin-page .modal-overlay .modal-footer button{flex:1;min-width:100px}}
</style>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  padding: 28px 24px 70px;
  color: #f4fcff;
  background: linear-gradient(180deg, rgba(0, 25, 41, .3), rgba(0, 25, 40, .62)), url("/images/hero-starry-lake.webp") center / cover fixed no-repeat;
}
.admin-page .admin-container { width: min(1580px, 100%); max-width: none; margin: 0 auto; }
.admin-page .dashboard-box {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 0;
  padding: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(112, 216, 233, .42) !important;
  border-radius: 24px !important;
  background: rgba(2, 31, 45, .78) !important;
  box-shadow: 0 28px 80px rgba(0, 0, 0, .28);
  backdrop-filter: blur(22px) !important;
}
.admin-sidebar { min-height: 0; padding: 24px 14px; border-right: 1px solid rgba(141, 222, 239, .22); background: rgba(3, 39, 55, .58); }
.side-brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 24px; color: #fff; font: 600 16px Georgia, "Noto Serif CJK SC", serif; text-decoration: none; }
.side-brand img { width: 34px; height: 34px; border: 1px solid rgba(187, 239, 249, .64); border-radius: 50%; object-fit: cover; }
.side-link { width: 100%; min-height: 42px; display: flex; align-items: center; gap: 12px; margin: 4px 0; padding: 0 13px; border: 0; border-radius: 10px; background: transparent; color: rgba(240, 249, 252, .78); text-align: left; text-decoration: none; font: inherit; cursor: pointer; }
.side-link > span { width: 20px; color: #7fe9ea; font-size: 19px; text-align: center; }
.side-link:hover, .side-link.active { color: #fff; background: linear-gradient(90deg, rgba(22, 148, 156, .55), rgba(16, 91, 109, .28)); }
.side-link.active { box-shadow: inset 3px 0 #4be4e5; }
.side-link.public-link { margin-top: auto; }
.admin-page .dashboard-main { min-width: 0; padding: 26px 28px 30px; }
.admin-page .dashboard-box .dash-header { align-items: flex-end; gap: 22px; margin-bottom: 22px; padding-bottom: 18px; border-color: rgba(177, 226, 239, .2); }
.admin-page .dashboard-box .dash-header .brand-row { display: none; }
.admin-page .dashboard-box .dash-header h1 { margin: 0 0 6px; color: #fff; font-size: 28px; font-weight: 650; }
.admin-page .dashboard-box .dash-header .subtitle { color: rgba(228, 245, 250, .68); font-size: 13px; line-height: 1.6; }
.admin-page .dashboard-box .dash-header .dash-actions { align-items: center; }
.admin-page .dashboard-box .dash-header .dash-actions .btn-add { min-height: 42px; padding: 0 22px; border-radius: 10px; background: #39dddf; box-shadow: 0 5px 18px rgba(51, 210, 218, .18); }
.admin-page .dashboard-box .dash-header .dash-actions .btn-logout { min-height: 42px; padding-inline: 16px; border-radius: 10px; }
.admin-page .dashboard-box .toolbar-section { gap: 12px; margin-bottom: 16px; }
.admin-page .dashboard-box .toolbar-section .search-input { flex-basis: 360px; }
.admin-page .dashboard-box .toolbar-section .search-input input,
.admin-page .dashboard-box .toolbar-section select { min-height: 42px; border: 1px solid rgba(167, 225, 240, .35); border-radius: 10px; background: rgba(2, 36, 51, .7); }
.admin-page .dashboard-box .desktop-table { border: 1px solid rgba(140, 221, 236, .25); border-radius: 12px; overflow: hidden; }
.admin-page .dashboard-box .desktop-table th { padding: 13px 12px; color: rgba(224, 242, 248, .72); background: rgba(26, 92, 110, .3); }
.admin-page .dashboard-box .desktop-table td { padding: 13px 12px; border-color: rgba(157, 220, 234, .15); }
.admin-page .dashboard-box .desktop-table tbody tr:hover { background: rgba(53, 170, 185, .1); }
.admin-page .dashboard-box .desktop-table .item-title { color: #fff; }
.admin-page .dashboard-box .desktop-table .item-summary { color: rgba(225, 241, 246, .62); }
.admin-page .dashboard-box .desktop-table .row-actions .btn-action { min-height: 32px; border-radius: 7px; }
.admin-page .dashboard-box .desktop-table .row-actions .btn-action.delete { color: #ffc0b9; border-color: rgba(255, 152, 136, .25); }
.admin-page .dashboard-box .mobile-card-list { display: none; }
.admin-page .dashboard-box .loading-state, .admin-page .dashboard-box .empty-state { min-height: 160px; display: grid; place-items: center; border: 1px solid rgba(153, 225, 239, .25); border-radius: 14px; background: rgba(2, 42, 58, .52); color: rgba(237, 249, 252, .78); }

/* 桌面端编辑表单像工作台的一部分，手机端则切成可滚动底部面板。 */
.admin-page .modal-overlay { position: relative; inset: auto; z-index: 2; display: block; margin-top: 16px; padding: 0; background: transparent; backdrop-filter: none; }
.admin-page .modal-overlay .modal-window { width: 100%; max-width: none; max-height: none; overflow: visible; padding: 22px 24px; border: 1px solid rgba(132, 224, 238, .36); border-radius: 16px; background: linear-gradient(120deg, rgba(19, 82, 100, .8), rgba(3, 43, 60, .86)); box-shadow: none; }
.admin-page .modal-overlay .modal-header { position: relative; margin-bottom: 18px; padding-bottom: 12px; }
.admin-page .modal-overlay .modal-header h3 { font-size: 21px; }
.admin-page .modal-overlay .editor-handle { display: none; }
.admin-page .modal-overlay .modal-window .modal-body { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); align-items: start; gap: 14px; }
.admin-page .modal-overlay .modal-window .modal-body > .form-row,
.admin-page .modal-overlay .modal-window .modal-body > .form-grid-2,
.admin-page .modal-overlay .modal-window .modal-body > .modal-footer { grid-column: 1 / -1; }
.admin-page .modal-overlay .modal-window .modal-body .form-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.admin-page .modal-overlay .modal-body .form-row label { color: rgba(236, 249, 252, .84); font-size: 13px; }
.admin-page .modal-overlay .modal-body input[type="text"],
.admin-page .modal-overlay .modal-body input[type="url"],
.admin-page .modal-overlay .modal-body textarea,
.admin-page .modal-overlay .modal-body select { min-height: 42px; border-color: rgba(167, 225, 240, .38); border-radius: 9px; background: rgba(2, 34, 49, .72); }
.admin-page .modal-overlay .modal-body textarea { min-height: 68px; }
.admin-page .modal-overlay .modal-footer { grid-column: 1 / -1; justify-content: flex-end; margin-top: 4px; }
.admin-page .modal-overlay .modal-footer .btn-draft,
.admin-page .modal-overlay .modal-footer .btn-submit { min-width: 136px; min-height: 42px; padding: 0 20px; border-radius: 10px; font: inherit; cursor: pointer; }
.admin-page .modal-overlay .modal-footer .btn-draft { border: 1px solid rgba(157, 232, 242, .6); background: rgba(80, 155, 169, .24); color: #f3fcff; }
.admin-page .modal-overlay .modal-footer .btn-submit { background: #3bdfe0; color: #052f3e; }

@media (max-width: 900px) {
  .admin-page { padding: 14px 12px 60px; }
  .admin-page .dashboard-box { grid-template-columns: 172px minmax(0, 1fr); }
  .admin-page .dashboard-main { padding: 20px 18px; }
  .admin-page .dashboard-box .desktop-table th, .admin-page .dashboard-box .desktop-table td { padding: 10px 8px; }
  .admin-page .dashboard-box .desktop-table .row-actions { flex-wrap: wrap; }
}

@media (max-width: 768px) {
  .admin-page { padding: 0 0 calc(54px + env(safe-area-inset-bottom, 0px)); }
  .admin-page .admin-container { width: 100%; }
  .admin-page .login-box { margin: 11vh 18px 0; width: auto; }
  /* A backdrop-filter ancestor becomes the containing block for fixed descendants.
     Disable it here so the editor sheet is fixed to the actual mobile viewport. */
  .admin-page .dashboard-box { display: block; width: 100%; border: 0 !important; border-radius: 0 !important; background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; overflow: visible; }
  .admin-page .admin-sidebar { display: none; }
  .admin-page .dashboard-main { padding: 0 18px 24px; }
  .admin-page .dashboard-box .dash-header { align-items: stretch; gap: 12px; margin-bottom: 14px; padding: 12px 0 16px; }
  .admin-page .dashboard-box .dash-header .brand-row { display: flex; align-items: center; margin: 0 0 12px; }
  .admin-page .dashboard-box .dash-header .brand-row .logo { font-size: 19px; }
  .admin-page .dashboard-box .dash-header h1 { margin-bottom: 4px; font-size: 24px; }
  .admin-page .dashboard-box .dash-header .subtitle { max-width: 36em; font-size: 12px; }
  .admin-page .dashboard-box .dash-header .dash-actions { width: 100%; }
  .admin-page .dashboard-box .dash-header .dash-actions .btn-add { flex: 1; min-height: 48px; border-radius: 12px; }
  .admin-page .dashboard-box .toolbar-section { flex-direction: column; align-items: stretch; margin-bottom: 12px; }
  .admin-page .dashboard-box .toolbar-section .search-input { width: 100%; flex: auto; }
  .admin-page .dashboard-box .toolbar-section .filter-dropdowns { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .admin-page .dashboard-box .toolbar-section select { width: 100%; min-width: 0; }
  .admin-page .dashboard-box .desktop-table { display: none; }
  .admin-page .dashboard-box .mobile-card-list { display: flex; flex-direction: column; gap: 9px; }
  .admin-page .dashboard-box .mobile-card-list .m-card { border-color: rgba(147, 222, 237, .3); border-radius: 14px; background: rgba(4, 53, 70, .66); }
  .admin-page .dashboard-box .mobile-card-list .m-card .m-title { font-size: 15px; }
  .admin-page .dashboard-box .mobile-card-list .m-card .m-summary { color: rgba(229, 244, 248, .68); line-height: 1.5; }
  .admin-page .dashboard-box .mobile-card-list .m-card .m-meta { color: rgba(220, 241, 246, .62); }
  .admin-page .dashboard-box .mobile-card-list .m-card .m-actions .btn-action { border-color: rgba(156, 225, 239, .35); background: rgba(11, 78, 96, .45); }
  .admin-page .modal-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; margin: 0; padding: 0; background: rgba(0, 13, 23, .58); backdrop-filter: blur(6px); }
  .admin-page .modal-overlay .modal-window { width: 100%; max-height: min(86dvh, 820px); overflow-y: auto; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); border: 1px solid rgba(127, 230, 240, .48); border-bottom: 0; border-radius: 24px 24px 0 0; background: linear-gradient(145deg, rgba(10, 71, 86, .98), rgba(2, 35, 51, .99)); box-shadow: 0 -18px 55px rgba(0,0,0,.3); }
  .admin-page .modal-overlay .editor-handle { position: absolute; top: -4px; left: 50%; width: 58px; height: 5px; display: block; transform: translateX(-50%); border-radius: 5px; background: rgba(226, 246, 250, .65); }
  .admin-page .modal-overlay .modal-header { position: sticky; top: -18px; z-index: 2; margin: -18px -18px 16px; padding: 22px 18px 13px; background: rgba(5, 55, 71, .97); }
  .admin-page .modal-overlay .modal-header h3 { font-size: 21px; }
  .admin-page .modal-overlay .modal-window .modal-body { display: flex; flex-direction: column; align-items: stretch; gap: 13px; }
  .admin-page .modal-overlay .modal-window .modal-body .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .admin-page .modal-overlay .modal-body input[type="text"],
  .admin-page .modal-overlay .modal-body input[type="url"],
  .admin-page .modal-overlay .modal-body textarea,
  .admin-page .modal-overlay .modal-body select { width: 100%; min-width: 0; box-sizing: border-box; }
  .admin-page .modal-overlay .modal-window .modal-body .form-row textarea { min-height: 96px; }
  .admin-page .modal-overlay .modal-footer { position: sticky; bottom: -18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 -18px -18px; padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px)); background: rgba(4, 45, 61, .98); }
  .admin-page .modal-overlay .modal-footer .btn-draft, .admin-page .modal-overlay .modal-footer .btn-submit { width: 100%; min-width: 0; min-height: 48px; }
}

@media (max-width: 430px) {
  .admin-page .dashboard-main { padding-inline: 14px; }
  .admin-page .dashboard-box .toolbar-section .filter-dropdowns { grid-template-columns: 1fr 1fr; }
  .admin-page .modal-overlay .modal-window { padding-inline: 14px; }
  .admin-page .modal-overlay .modal-window .modal-body .form-grid-2 { grid-template-columns: 1fr; }
  .admin-page .modal-overlay .modal-header, .admin-page .modal-overlay .modal-footer { margin-inline: -14px; padding-inline: 14px; }
}
.management-tabs{display:none}.admin-cover{width:66px;height:42px;object-fit:cover;border-radius:7px;float:left;margin:0 10px 5px 0}.admin-page .modal-overlay .modal-window .modal-body > .form-row{min-width:0}.status-pill.deleted{color:#ccd8de;background:#6a7e8844}@media(max-width:768px){.management-tabs{display:flex;gap:8px;margin:0 0 16px}.management-tabs button{flex:1;min-height:42px;padding:8px;border:1px solid #8be0ec44;background:#13465b88;border-radius:10px;color:#daf5ff}.management-tabs button.active{background:#35dadb;color:#053543}.admin-page .modal-overlay .modal-footer{display:flex;flex-wrap:wrap}.admin-page .modal-overlay .modal-footer button{flex:1;min-width:100px}}
</style>
