<template>
  <div class="flex h-screen overflow-hidden bg-bg-primary">
    <!-- Desktop Sidebar -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 overflow-y-auto overscroll-contain" id="main-scroll" @scroll.passive="onScroll">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>

      <!-- Mobile Bottom Nav -->
      <MobileNav class="md:hidden" :visible="navVisible" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import MobileNav from './MobileNav.vue'

const route = useRoute()

const pageOrder = ['home', 'hot', 'trending', 'search', 'favorites', 'recent', 'settings']

const transitionName = computed(() => {
  const names = pageOrder
  const fromIdx = names.indexOf(route.meta?.from ?? '')
  const toIdx = names.indexOf(route.name ?? '')
  if (fromIdx < 0 || toIdx < 0) return 'fade'
  return toIdx > fromIdx ? 'slide-left' : 'slide-right'
})

const navVisible = ref(true)
provide('navVisible', navVisible)
let lastScrollY = 0

function onScroll(e) {
  const y = e.target.scrollTop
  if (Math.abs(y - lastScrollY) < 8) return
  navVisible.value = y < lastScrollY || y < 60
  lastScrollY = y
}
</script>
