import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// swiper
import "swiper/css";
import { ElMessage } from "element-plus";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.mount("#app");

// 仅在桌面端隐藏系统光标；移动端保留原生触摸体验
if (window.innerWidth >= 768) {
  const cursorStyle = document.createElement("style");
  cursorStyle.textContent = "body { cursor: none !important; }";
  document.head.appendChild(cursorStyle);
}

// PWA
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // 弹出更新提醒
  ElMessage("站点已更新，刷新后生效");
});
