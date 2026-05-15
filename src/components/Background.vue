<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error.once="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { mainStore } from "@/store";

const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 💥 极客“偷懒”配置区：把你现在有的图片数字全写进这个中括号里，用逗号隔开！💥
// 根据你的截图，目前存活的壁纸是下面这 7 张：
const availableImages = [2, 3, 4, 5, 7, 8, 9]; 

// 系统会直接从上面这个真实存在的列表里随机抽签，绝对不会抽到空号！
const randomIndex = Math.floor(Math.random() * availableImages.length);
const bgRandom = availableImages[randomIndex];

// 更换壁纸链接
const changeBg = (type) => {
  if (type == 0) {
    bgUrl.value = `/images/background${bgRandom}.jpg`;
  } else if (type == 1) {
    bgUrl.value = "https://api.dujin.org/bing/1920.php"; // 必应每日一图
  } else if (type == 2) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/views"; // 随机风景
  } else if (type == 3) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/acg"; // 随机动漫
  }
};

// 安全超时：8 秒后无论图片是否加载完成，直接显示内容
let safetyTimer = null;

const forceShow = () => {
  if (!store.imgLoadStatus) {
    store.setImgLoadStatus(true);
    emit("loadComplete");
  }
};

// 图片加载完成
const imgLoadComplete = () => {
  clearTimeout(safetyTimer);
  imgTimeout.value = setTimeout(
    () => {
      store.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

const imgAnimationEnd = () => {
  emit("loadComplete");
};

// 图片加载失败 — 回退到本地随机壁纸
const imgLoadError = () => {
  clearTimeout(safetyTimer);
  // 依次尝试本地壁纸
  const fallbackIdx = Math.floor(Math.random() * availableImages.length);
  bgUrl.value = `/images/background${availableImages[fallbackIdx]}.jpg`;
  // 重启超时计时器
  safetyTimer = setTimeout(forceShow, 8000);
};

watch(
  () => store.coverType,
  (value) => {
    changeBg(value);
  },
);

onMounted(() => {
  changeBg(store.coverType);
  // 安全超时：8 秒后强制显示内容
  safetyTimer = setTimeout(forceShow, 8000);
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
  clearTimeout(safetyTimer);
});
</script>

<style lang="scss" scoped>
/* 样式部分保持原有高级质感完全不动 */
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
