<template>
  <div class="flex h-screen overflow-hidden bg-bg-primary">
    <!-- Desktop Sidebar -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 overflow-y-auto overscroll-contain" id="main-scroll">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>

      <!-- Mobile Bottom Nav -->
      <MobileNav class="md:hidden" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
</script>
