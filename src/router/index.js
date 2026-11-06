import { createRouter, createWebHashHistory } from "vue-router";

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
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
