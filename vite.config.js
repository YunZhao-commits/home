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
export default ({ mode }) =>
  defineConfig({
    plugins: [
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
      // ── 以下为原有规则，完全不动 ──
      {
        urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/,
        handler: "CacheFirst",
        options: {
          cacheName: "js-css-cache",
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
  // manifest 块完全不动...
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
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
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
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
          additionalData: `@use "@/src/style/global.scss" as *;`,
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
    },
  });
