<template>
  <Transition name="fade-scale">
    <div class="command-overlay" v-show="isVisible" @click.self="closePalette">
      <div class="command-palette">
        <div class="search-header">
          <Search theme="outline" size="20" fill="rgba(255,255,255,0.6)" />
          <input 
            ref="searchInput"
            v-model="searchQuery"
            placeholder="搜索应用或执行指令... (输入 '>' 探索机密)" 
            @keydown="handleKeydown"
          />
          <div class="shortcut-hint">ESC</div>
        </div>
        
        <div class="command-list">
          <div class="group-title">建议与指令 / SUGGESTIONS</div>
          <div 
            v-for="(item, index) in filteredCommands" 
            :key="index"
            class="command-item"
            :class="{ active: selectedIndex === index }"
            @mouseover="selectedIndex = index"
            @click="execute(item)"
          >
            <div class="cmd-left">
              <component :is="iconMap[item.icon] || Terminal" theme="outline" size="18" :stroke-width="3" />
              <span class="cmd-name">{{ item.name }}</span>
            </div>
            <div class="cmd-right">
              <span class="badge" :class="item.type">{{ item.type }}</span>
            </div>
          </div>
          <div v-if="filteredCommands.length === 0" class="no-result">
            [!] 404 UNKNOWN COMMAND 
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { mainStore } from "@/store";
import { Search, Terminal, Pic, User, Code, Folder, Notebook, Cpu, Earth, Picture, ChartLine } from '@icon-park/vue-next';
import siteLinks from '@/assets/siteLinks.json';

// 动态加载图标集
const iconMap = { Folder, Notebook, Cpu, Earth, Picture, ChartLine, Search, Terminal, Pic, User, Code };

const store = mainStore();
const isVisible = ref(false);
const searchQuery = ref('');
const searchInput = ref(null);
const selectedIndex = ref(0);

// 提取原有的站点导航链接并转化为指令
const linkCommands = siteLinks.map(link => ({
  name: `Launch: ${link.name}`,
  action: () => {
    if (link.url.startsWith('http')) window.open(link.url, '_blank');
    else window.location.href = link.url;
  },
  icon: link.icon,
  type: 'APP'
}));

// 独家定制的极客系统指令与彩蛋
const systemCommands = [
  {
    name: 'Toggle Wallpaper Mode',
    action: () => { store.backgroundShow = !store.backgroundShow; },
    icon: 'Pic',
    type: 'SYSTEM'
  },
  {
    name: 'Print Author Identity',
    action: () => {
      if (typeof ElMessage !== 'undefined') {
        ElMessage({ message: 'Identity Confirmed: Yunchu Studio 主理人', type: 'success' });
      } else {
        alert('Identity Confirmed: Yunchu Studio 主理人');
      }
    },
    icon: 'User',
    type: 'SECRET'
  },
  {
    name: 'System Diagnostic',
    action: () => {
      if (typeof ElMessage !== 'undefined') {
        ElMessage({ message: 'All systems green. Edge Node is secure.', type: 'info' });
      }
    },
    icon: 'Code',
    type: 'SYSTEM'
  }
];

const allCommands = [...systemCommands, ...linkCommands];

// 搜索引擎算法
const filteredCommands = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return allCommands;
  return allCommands.filter(cmd => cmd.name.toLowerCase().includes(q) || cmd.type.toLowerCase().includes(q));
});

// 控制器逻辑
const closePalette = () => {
  isVisible.value = false;
  searchQuery.value = '';
  selectedIndex.value = 0;
};

const execute = (item) => {
  item.action();
  closePalette();
};

const handleKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (filteredCommands.value[selectedIndex.value]) {
      execute(filteredCommands.value[selectedIndex.value]);
    }
  } else if (e.key === 'Escape') {
    closePalette();
  }
};

// 监听全局快捷键 Ctrl+K / Cmd+K
const globalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    isVisible.value = !isVisible.value;
    if (isVisible.value) {
      nextTick(() => { searchInput.value?.focus(); });
    } else {
      closePalette();
    }
  } else if (e.key === 'Escape' && isVisible.value) {
    closePalette();
  }
};

onMounted(() => window.addEventListener('keydown', globalKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', globalKeydown));
</script>

<style lang="scss" scoped>
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.command-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 999999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
}

.command-palette {
  width: 90%;
  max-width: 640px;
  background: rgba(18, 18, 25, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 1.15rem;
    margin-left: 14px;
    font-family: 'JetBrains Mono', monospace, sans-serif;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .shortcut-hint {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
  }
}

.command-list {
  max-height: 380px;
  overflow-y: auto;
  padding: 12px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

  .group-title {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 8px 12px;
    letter-spacing: 1px;
    font-weight: bold;
  }

  .command-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 4px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &.active, &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.05);
      transform: translateX(4px);
    }

    .cmd-left {
      display: flex;
      align-items: center;
      gap: 14px;
      color: rgba(255, 255, 255, 0.9);

      .cmd-name {
        font-size: 0.95rem;
        font-weight: 500;
        font-family: inherit;
      }
    }

    .cmd-right {
      .badge {
        font-size: 0.7rem;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.5);
        font-weight: bold;

        &.APP { color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
        &.SYSTEM { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
        &.SECRET { color: #34d399; background: rgba(52, 211, 153, 0.1); }
      }
    }
  }

  .no-result {
    text-align: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.3);
    font-family: monospace;
    letter-spacing: 1px;
  }
}
</style>
