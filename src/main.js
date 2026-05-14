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

// 仅在 Vue 成功挂载后隐藏系统光标；JS 故障时光标保持可见
const cursorStyle = document.createElement("style");
cursorStyle.textContent = "body { cursor: none !important; }";
document.head.appendChild(cursorStyle);

// PWA
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // 弹出更新提醒
  ElMessage("站点已更新，刷新后生效");
});
