import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// 引入路由
import router from "@/router";
// swiper
import "swiper/css";
import { ElMessage } from "element-plus";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount("#app");

// 仅在桌面端隐藏系统光标；移动端保留原生触摸体验
if (window.innerWidth >= 768) {
  const cursorStyle = document.createElement("style");
  cursorStyle.textContent = "body { cursor: none !important; }";
  document.head.appendChild(cursorStyle);
}

// PWA
// 首次接管页面时不提示，避免刚打开站点就遮住内容；只有已有控制器被替换时才提示。
let hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (hadServiceWorkerController) {
    ElMessage({
      message: "站点已更新，请刷新页面",
      duration: 2500,
      offset: window.innerWidth <= 760 ? 84 : 76,
      customClass: "site-update-message",
    });
  }
  hadServiceWorkerController = true;
});
