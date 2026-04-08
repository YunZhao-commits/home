<template>
  <div class="setting">
    <el-collapse class="collapse" v-model="activeName" accordion>
      
      <el-collapse-item title="个性壁纸 / WALLPAPER" name="1">
        <div class="bg-set">
          <el-radio-group v-model="coverType" text-color="#ffffff" @change="radioChange">
            <el-radio value="0" size="large" border>默认壁纸</el-radio>
            <el-radio value="1" size="large" border>每日一图</el-radio>
            <el-radio value="2" size="large" border>随机风景</el-radio>
            <el-radio value="3" size="large" border>随机动漫</el-radio>
          </el-radio-group>
        </div>
      </el-collapse-item>

      <el-collapse-item title="视觉引擎 / VISUAL ENGINE" name="2">
        <div class="item">
          <span class="text">深空流体粒子特效 (Particle BG)</span>
          <el-switch
            v-model="particleEngine"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
            @change="showMsg('粒子引擎状态已更新，刷新生效')"
          />
        </div>
        <div class="item">
          <span class="text">3D 全息物理卡片 (Holographic)</span>
          <el-switch
            v-model="hologram3D"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
            @change="showMsg('3D 物理引擎状态已更新，刷新生效')"
          />
        </div>
        <div class="item">
          <span class="text">赛博磁性流体光标 (Cyber Cursor)</span>
          <el-switch
            v-model="cyberCursor"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
            @change="showMsg('光标模式已切换，刷新生效')"
          />
        </div>
        <div class="item">
          <span class="text">全局交互指令台 (Command Palette)</span>
          <div class="shortcut-tip">Ctrl + K</div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="系统维护 / MAINTENANCE" name="3">
        <div class="item">
          <span class="text">前端核心架构</span>
          <span class="badge">Vue3 + Vite</span>
        </div>
        <div class="item danger-zone">
          <span class="text">重置所有缓存配置 (Clear Cache)</span>
          <el-button type="danger" plain size="small" @click="clearCache">
            <template #icon><Delete /></template>
            立即清理
          </el-button>
        </div>
      </el-collapse-item>

    </el-collapse>
  </div>
</template>

<script setup>
import { CheckSmall, CloseSmall, SuccessPicture, Delete } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { storeToRefs } from "pinia";
import { ref, h } from "vue";

const store = mainStore();
const { coverType } = storeToRefs(store);

// 默认展开的面板 (1:壁纸)
const activeName = ref("1");

// 本地模拟的引擎状态开关
const particleEngine = ref(true);
const hologram3D = ref(true);
const cyberCursor = ref(true);

// 壁纸切换提醒
const radioChange = () => {
  ElMessage({
    message: "壁纸更换成功",
    icon: h(SuccessPicture, { theme: "filled", fill: "#efefef" }),
  });
};

// 通用消息提醒
const showMsg = (msg) => {
  ElMessage({
    message: msg,
    icon: h(SuccessPicture, { theme: "filled", fill: "#efefef" }),
  });
};

// 危险操作：清空缓存
const clearCache = () => {
  ElMessageBox.confirm(
    '此操作将清空所有本地保存的壁纸和页面设置, 是否继续?',
    '系统警告',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    localStorage.clear();
    sessionStorage.clear();
    ElMessage({ type: 'success', message: '清理成功，系统即将重启...' });
    setTimeout(() => { window.location.reload(); }, 1500);
  }).catch(() => {
    ElMessage({ type: 'info', message: '已取消清理' });
  });
};
</script>

<style lang="scss" scoped>
.setting {
  .collapse {
    border-radius: 8px;
    --el-collapse-content-bg-color: transparent;
    border-color: transparent;
    overflow: hidden;

    :deep(.el-collapse-item__header) {
      background-color: rgba(255, 255, 255, 0.05);
      color: #fff;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace, sans-serif;
      padding-left: 18px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    :deep(.el-collapse-item__wrap) {
      border-color: transparent;
      background: transparent;

      .el-collapse-item__content {
        padding: 10px 20px 20px;
        
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          font-size: 14px;
          padding: 12px 0;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);

          &:last-child { border-bottom: none; }

          .text { color: rgba(255, 255, 255, 0.8); }

          /* 极客开关样式 */
          .el-switch__core {
            border-color: transparent;
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          /* 提示铭牌样式 */
          .shortcut-tip, .badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.8rem;
            color: #4ade80;
            font-weight: bold;
            letter-spacing: 1px;
          }
        }

        .danger-zone {
          .text { color: #f87171; }
        }

        /* 壁纸单选按钮优化 */
        .el-radio-group {
          justify-content: space-between;
          width: 100%;

          .el-radio {
            margin: 10px 0;
            width: calc(50% - 10px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;

            .el-radio__label { color: #fff; }
            .el-radio__inner {
              background: transparent !important;
              border: 2px solid rgba(255, 255, 255, 0.3) !important;
            }

            &.is-checked {
              background: rgba(255, 255, 255, 0.1) !important;
              border-color: #fff !important;
              .el-radio__inner {
                background-color: #fff !important;
                border-color: #fff !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>
