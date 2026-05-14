/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // HTML 环境变量回退默认值，防止 .env 缺失时 %VITE_XXX% 未被替换导致构建崩溃
  const htmlEnvFallbacks = {
    "%VITE_SITE_NAME%": env.VITE_SITE_NAME || "Yunchu Studio",
    "%VITE_SITE_LOGO%": env.VITE_SITE_LOGO || "/images/avatar.png",
    "%VITE_SITE_APPLE_LOGO%": env.VITE_SITE_APPLE_LOGO || "/images/avatar.png",
    "%VITE_SITE_DES%": env.VITE_SITE_DES || "A Private Digital Infrastructure",
    "%VITE_SITE_KEYWORDS%": env.VITE_SITE_KEYWORDS || "Yunchu, 个人门户",
    "%VITE_SITE_AUTHOR%": env.VITE_SITE_AUTHOR || "Yunchu Studio",
  };

  return defineConfig({
    plugins: [
      // 确保 index.html 中的 %VITE_XXX% 占位符始终有值
      {
        name: "html-env-fallback",
        enforce: "pre",
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_SITE_(?:NAME|LOGO|APPLE_LOGO|DES|KEYWORDS|AUTHOR)%/g,
            (match) => htmlEnvFallbacks[match],
          );
        },
      },
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
  registerType: "autoUpdate",
  workbox: {
    skipWaiting: true,
    clientsClaim: true,

    // ── 新增 1：将 siteLinks.json 从预缓存清单中排除 ──
    // 避免被 precacheAndRoute 锁死版本，交给下方运行时规则接管
    globIgnores: ["**/siteLinks.json"],

    runtimeCaching: [
      // ── 新增 2：siteLinks.json 专用 NetworkFirst 规则 ──
      // 每次优先走网络，3 秒超时后才降级用缓存，确保数据实时性
      {
        urlPattern: /\/siteLinks\.json$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "data-realtime",
          networkTimeoutSeconds: 3,
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      // 字体文件 — 长缓存，静态资源带 hash 可放心使用 CacheFirst
      {
        urlPattern: /(.*?)\.(woff2|woff|ttf)/,
        handler: "CacheFirst",
        options: {
          cacheName: "font-cache",
          cacheableResponse: {
            statuses: [200],
          },
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 一年
          },
        },
      },
      // JS/CSS 代码文件
      {
        urlPattern: /(.*?)\.(js|css)/,
        handler: "CacheFirst",
        options: {
          cacheName: "code-cache",
        },
      },
      {
        urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
        },
      },
    ],
  },
        manifest: {
          name: env.VITE_SITE_NAME,
          short_name: env.VITE_SITE_NAME,
          description: env.VITE_SITE_DES,
          lang: "zh-CN",
          dir: "ltr",
          scope: "/",
          start_url: "/",
          display: "standalone",
          display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
          orientation: "any",
          theme_color: "#424242",
          background_color: "#424242",
          categories: ["personalization", "utilities"],
          screenshots: [
            {
              src: "/screenshots/main.jpg",
              sizes: "1280x720",
              type: "image/jpeg",
            },
            {
              src: "/screenshots/step1.jpg",
              sizes: "1280x720",
              type: "image/jpeg",
            },
            {
              src: "/screenshots/step2.jpg",
              sizes: "1280x720",
              type: "image/jpeg",
            },
          ],
          icons: [
            {
              src: "/images/icon/48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "/images/icon/72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "/images/icon/96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "/images/icon/128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "/images/icon/144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "/images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "3000",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: '@use "@/style/global.scss" as *;',
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-element-plus": ["element-plus"],
            "vendor-swiper": ["swiper"],
            "vendor-marked": ["marked"],
            "vendor-vue": ["vue", "pinia", "pinia-plugin-persistedstate"],
            "vendor-utils": ["axios", "lodash-es", "dayjs"],
          },
        },
      },
    },
  });
};
