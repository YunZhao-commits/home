import { createRouter, createWebHistory } from "vue-router";
import { legacyRouteFromHash } from "../../shared/legacy-route.js";

// Keep existing links such as /#/share?category=tools working after switching
// to readable, crawler-friendly URLs.
const legacyPath = legacyRouteFromHash(window.location.hash);
if (legacyPath) window.history.replaceState(window.history.state, "", legacyPath);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home/index.vue"),
  },
  {
    path: "/share",
    name: "ShareList",
    component: () => import("@/views/Share/List.vue"),
  },
  {
    path: "/share/:id",
    name: "ShareDetail",
    component: () => import("@/views/Share/Detail.vue"),
  },
  {
    path: "/notes",
    name: "Notes",
    component: () => import("@/views/Notes/index.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About/index.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/Admin/index.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
