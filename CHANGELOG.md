# Changelog

## 2026-05-14 — 安全性 & PWA 完善

### 移除外部字体 CDN 依赖

- **`index.html`** — 移除 B 站 CDN（`s1.hdslb.com`）HarmonyOS Sans 字体外链，消除第三方不可控风险及防盗链失效隐患
- **`public/font/`** — 新增 `HarmonyOS_Regular.a.woff2` ~ `HarmonyOS_Regular.j.woff2`（10 个拆分文件），改为本地自托管
- **`src/style/style.scss`** — 新增 10 个 `@font-face` 声明（按 Unicode 区间拆分加载），body 添加中文字体回退栈：`PingFang SC → Microsoft YaHei → Hiragino Sans GB → Noto Sans SC`
- **`src/components/Player.vue`** — 同步更新 `font-family` 回退栈

### 启用 Content Security Policy

- **`index.html`** — 取消注释 CSP meta 标签，启用 `upgrade-insecure-requests`
- **`public/_headers`**（新增）— Cloudflare Pages 部署用安全头：
  - `Content-Security-Policy` — 限制 script/style/img/font/connect 来源
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — 禁用 camera/microphone/geolocation

### 完善 PWA 配置

- **`vite.config.js`** — manifest 新增字段：
  - `lang`, `dir`, `scope`, `display_override`, `orientation`
  - `categories: ["personalization", "utilities"]`
  - `screenshots`（安装提示预览图）
  - 192/512 图标添加 `purpose: "any maskable"`（Android 自适应图标）
  - Service Worker 字体文件独立缓存规则（365 天过期）
