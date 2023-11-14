const r_rwek8funts = () => import("@/views/index.vue");
const __routes = [
  {
    path: "/",
    name: "_src_views_indexvue_layout",
    meta: { title: "ddd" },
    children: [
      {
        path: "",
        name: "_src_views_indexvue",
        meta: { title: "ddd" },
        component: r_rwek8funts,
      },
    ],
  },
];
export default __routes;
