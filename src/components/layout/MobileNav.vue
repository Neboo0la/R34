<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-xl border-t border-border safe-bottom">
    <div class="flex items-center justify-around px-2 py-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0"
        :class="isActive(item) ? 'text-accent-light' : 'text-zinc-500'"
      >
        <div class="relative">
          <div
            v-if="isActive(item)"
            class="absolute inset-0 bg-accent/20 rounded-lg blur-sm scale-150"
          />
          <svg class="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[item.icon]" />
          </svg>
        </div>
        <span class="text-[10px] font-medium leading-none truncate">{{ item.label }}</span>
      </RouterLink>

      <button
        @click="openSearch"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-zinc-500 active:text-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-[10px] font-medium leading-none">Search</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { to: '/', name: 'home', label: 'Home', icon: 'home' },
  { to: '/hot', name: 'hot', label: 'Hot', icon: 'fire' },
  { to: '/favorites', name: 'favorites', label: 'Saved', icon: 'heart' },
  { to: '/settings', name: 'settings', label: 'Settings', icon: 'settings' }
]

const icons = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  fire: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7 1.002 2.104 2.42 4.028 4.01 5.659a8.003 8.003 0 011.661 6.998z',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
}

function isActive(item) {
  return route.name === item.name || route.path === item.to
}

function openSearch() {
  router.push('/search')
}
</script>
