<template>
  <aside
    :class="[
      'flex flex-col h-screen bg-bg-secondary border-r border-border transition-all duration-300 ease-in-out overflow-hidden',
      collapsed ? 'w-[64px]' : 'w-56'
    ]"
  >
    <!-- Header -->
    <div class="flex-shrink-0 border-b border-border">
      <!-- Collapsed: logo centred, click to expand -->
      <button
        v-if="collapsed"
        @click="collapsed = false"
        class="w-full flex items-center justify-center py-[18px] hover:bg-bg-hover transition-colors"
        aria-label="Expand sidebar"
      >
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg shadow-accent/30 flex-shrink-0">
          <span class="text-white font-bold text-sm">R</span>
        </div>
      </button>

      <!-- Expanded: logo + title + collapse button -->
      <div v-else class="flex items-center gap-3 px-4 py-5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg shadow-accent/30 flex-shrink-0">
          <span class="text-white font-bold text-sm">R</span>
        </div>
        <span class="font-bold text-white text-base tracking-tight truncate flex-1">R34 Browser</span>
        <button
          @click="collapsed = true"
          class="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
          aria-label="Collapse sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Nav Items -->
    <nav class="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
      <SidebarItem
        v-for="item in navItems"
        :key="item.to"
        :item="item"
        :collapsed="collapsed"
      />
    </nav>

    <!-- Random Post -->
    <div class="px-2 py-3 border-t border-border flex-shrink-0">
      <button
        @click="randomPost"
        :class="[
          'w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200',
          'text-zinc-400 hover:text-white hover:bg-bg-hover active:scale-[0.97]',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
        ]"
        :title="collapsed ? 'Random Post' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 14l6 6M4 20l6-6" />
        </svg>
        <span v-if="!collapsed">Random</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useSettingsStore } from '@/stores/settings'
import SidebarItem from './SidebarItem.vue'

const collapsed = ref(false)
const postsStore = usePostsStore()

const navItems = [
  { to: '/', name: 'home', label: 'Home', icon: 'home' },
  { to: '/hot', name: 'hot', label: 'Hot Posts', icon: 'fire' },
  { to: '/trending', name: 'trending', label: 'Trending', icon: 'trending' },
  { to: '/search', name: 'search', label: 'Search', icon: 'search' },
  { to: '/favorites', name: 'favorites', label: 'Favorites', icon: 'heart' },
  { to: '/settings', name: 'settings', label: 'Settings', icon: 'settings' }
]

const settingsStore = useSettingsStore()

async function randomPost() {
  const blacklist = settingsStore.blacklistedTags
  for (let i = 0; i < 10; i++) {
    const post = await postsStore.fetchRandomPost()
    if (!post) break
    const tags = post.tags ? post.tags.split(' ') : []
    if (!blacklist.length || !blacklist.some(bt => tags.includes(bt))) {
      postsStore.openPost(post)
      return
    }
  }
}
</script>
