<template>
  <div class="about-page">
    <div class="about-container">
      <!-- 顶部导航 -->
      <header class="about-header">
        <div class="brand" @click="router.push('/')">
          <img class="avatar" src="/images/avatar.png" alt="Yunchu" />
          <div class="brand-text">
            <span class="main">Yunchu Studio</span>
            <span class="sub">云初工作室</span>
          </div>
        </div>

        <nav class="nav-links">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/share" class="nav-item">精选分享</router-link>
          <router-link to="/about" class="nav-item active">关于本站</router-link>
        </nav>
      </header>

      <!-- 头部说明 -->
      <section class="banner-section">
        <h1 class="page-title">
          <span class="accent-bar"></span>
          <span>关于本站</span>
        </h1>
        <p class="page-subtitle">
          Yunchu Studio 是一个由个人维护的精选分享站，用于整理、筛选并分享在日常学习、工作与生活中发现的优质内容与实用资源。
        </p>
      </section>

      <!-- 双栏卡片网格 -->
      <div class="about-layout">
        <!-- 左侧原则与说明 -->
        <div class="cards-column">
          <div class="info-card card-blur">
            <div class="card-title">
              <span class="icon">🌱</span>
              <span>我为什么整理这些</span>
            </div>
            <p class="card-desc">
              我希望把自己在探索和使用过程中遇到的好工具、优质资源和有价值的内容整理出来，既方便自己随时复用，也希望能为同样有需求的朋友提供一些客观、真实的参考和启发。
            </p>
          </div>

          <div class="info-card card-blur">
            <div class="card-title">
              <span class="icon">🛡️</span>
              <span>内容如何核实</span>
            </div>
            <p class="card-desc">
              本站内容主要基于公开官方信息与个人实际体验进行整理，力求描述清晰、信息完整。内容会不定期检查与更新，页面上的「最后更新」仅表示最近一次手动查看和核对该内容的时间，并不代表对第三方服务的绝对保证。
            </p>
          </div>

          <div class="info-card card-blur">
            <div class="card-title">
              <span class="icon">🔗</span>
              <span>推广与邀请说明</span>
            </div>
            <p class="card-desc">
              为了支持本站的持续维护，部分内容中可能包含邀请链接、推荐链接或其他形式的推广合作。如果你通过这些链接注册、购买或使用相关服务，我可能会获得一定的平台奖励或返利。所有推广均带有明显标识，仅在您知情并自愿的情况下使用。
            </p>
          </div>

          <div class="info-card card-blur">
            <div class="card-title">
              <span class="icon">📚</span>
              <span>内容状态说明</span>
            </div>
            <div class="card-desc">
              为方便访客参考，本站会为收录的内容标注实时状态：
              <ul>
                <li><strong>「正常可用」</strong>：目前可以正常访问或领取的服务；</li>
                <li><strong>「已结束」</strong>：该活动、优惠或服务已截止，或不再有效。</li>
              </ul>
              状态会根据后续查看情况调整，如遇平台规则临时变动，请以第三方最终页面为准。
            </div>
          </div>

          <div class="info-card card-blur">
            <div class="card-title">
              <span class="icon">✉️</span>
              <span>联系方式</span>
            </div>
            <p class="card-desc">
              如果你有内容建议、失效反馈或合作想法，欢迎通过站长公开渠道交流。（联系方式遵循站长个人配置，目前处于本地测试状态）。
            </p>
          </div>
        </div>

        <!-- 右侧元信息卡片 -->
        <aside class="sidebar-column">
          <div class="meta-card card-blur">
            <h3 class="meta-title">ⓘ 站点信息</h3>

            <div class="meta-item">
              <div class="label">👤 站点性质</div>
              <div class="val">个人维护的精选分享站</div>
            </div>

            <div class="meta-item">
              <div class="label">📚 内容范围</div>
              <div class="val">实用工具、效率方法、精选资源等</div>
            </div>

            <div class="meta-item">
              <div class="label">🕒 运营规范</div>
              <div class="val">纯人工实测筛选 · 杜绝虚假推广</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style lang="scss" scoped>
.about-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.5rem 1rem calc(4rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #efefef;

  .about-container {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
  }

  .about-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

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
          font-family: "Pacifico-Regular", cursive;
          font-size: 1.25rem;
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

  .banner-section {
    margin: 2rem 0 1.5rem;

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.85rem;
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
      font-size: 0.95rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }
  }

  .about-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1.5rem;
    align-items: start;
  }

  .cards-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-card {
    background: rgba(8, 28, 36, 0.65);
    border: 1px solid rgba(0, 229, 201, 0.2);
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    backdrop-filter: blur(12px);

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.65rem;

      .icon {
        font-size: 1.2rem;
      }
    }

    .card-desc {
      font-size: 0.9rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;

      ul {
        margin: 0.5rem 0 0 1.25rem;
        padding: 0;
        li {
          margin-bottom: 0.3rem;
        }
      }
    }
  }

  .sidebar-column {
    position: sticky;
    top: 1.5rem;

    .meta-card {
      background: rgba(8, 28, 36, 0.65);
      border: 1px solid rgba(0, 229, 201, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(12px);

      .meta-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: #00e5c9;
        margin: 0 0 1.2rem 0;
      }

      .meta-item {
        margin-bottom: 1.1rem;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 0.25rem;
        }

        .val {
          font-size: 0.9rem;
          color: #ffffff;
          font-weight: 500;
        }
      }
    }
  }

  @media (max-width: 780px) {
    padding: 1rem 0.75rem calc(4.5rem + env(safe-area-inset-bottom, 0px));

    .about-layout {
      grid-template-columns: 1fr;
    }

    .sidebar-column {
      position: static;
    }

    .about-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.9rem;

      .nav-links {
        width: 100%;
        flex-wrap: wrap;
        gap: 0.5rem 1.1rem;
      }
    }

    .info-card { padding: 1rem; }
  }

  @media (max-width: 380px) {
    padding-inline: 0.6rem;
    .about-header .brand-text .main { font-size: 1.05rem; }
    .info-card .card-desc { overflow-wrap: anywhere; }
  }
}
</style>
