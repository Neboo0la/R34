import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/hot',
    name: 'hot',
    component: () => import('@/pages/HotPostsPage.vue'),
    meta: { title: 'Hot Posts' }
  },
  {
    path: '/trending',
    name: 'trending',
    component: () => import('@/pages/TrendingTagsPage.vue'),
    meta: { title: 'Trending Tags' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/SearchPage.vue'),
    meta: { title: 'Search' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/pages/FavoritesPage.vue'),
    meta: { title: 'Favorites' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: 'Settings' }
  },
  {
    path: '/post/:id',
    name: 'post',
    component: () => import('@/pages/PostPage.vue'),
    meta: { title: 'Post' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — R34 Browser` : 'R34 Browser'
})

export default router
