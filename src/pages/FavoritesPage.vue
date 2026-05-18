<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-white">Favorites</h1>
          <p class="text-xs text-zinc-500">{{ favStore.favorites.length }} saved post{{ favStore.favorites.length !== 1 ? 's' : '' }}</p>
        </div>
        <button
          v-if="favStore.favorites.length"
          @click="confirmClear"
          class="text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          Clear all
        </button>
      </div>

      <!-- Search favorites -->
      <div v-if="favStore.favorites.length > 6" class="px-4 pb-3">
        <div class="flex items-center gap-2 bg-bg-secondary border border-border rounded-xl px-3 py-2">
          <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="filterText"
            type="text"
            placeholder="Filter favorites…"
            class="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Grid of favorites -->
    <MasonryGrid v-if="filteredFavorites.length" :posts="filteredFavorites" />

    <!-- Empty state -->
    <EmptyState
      v-if="!favStore.favorites.length"
      title="No favorites yet"
      description="Tap the heart icon on any post to save it here."
      icon="heart"
    >
      <RouterLink to="/" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/15 text-accent-light text-sm font-medium hover:bg-accent/25 transition-colors">
        Browse posts
      </RouterLink>
    </EmptyState>

    <!-- No filter results -->
    <EmptyState
      v-if="favStore.favorites.length > 0 && filteredFavorites.length === 0"
      title="No matches"
      :description="`No favorites match &quot;${filterText}&quot;`"
      icon="search"
    />

    <!-- Clear confirmation modal -->
    <Transition name="modal">
      <div v-if="showClearConfirm" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showClearConfirm = false" />
        <div class="relative z-10 bg-bg-secondary border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-scale-in">
          <h3 class="text-white font-semibold text-base mb-2">Clear all favorites?</h3>
          <p class="text-zinc-400 text-sm mb-4">This will remove all {{ favStore.favorites.length }} saved posts. This cannot be undone.</p>
          <div class="flex gap-2">
            <button @click="showClearConfirm = false" class="flex-1 py-2.5 rounded-xl bg-bg-hover text-sm text-zinc-300 hover:text-white transition-colors">Cancel</button>
            <button @click="clearAll" class="flex-1 py-2.5 rounded-xl bg-red-500 text-sm text-white font-medium hover:bg-red-600 transition-colors">Clear all</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { inject } from 'vue'
import MasonryGrid from '@/components/MasonryGrid.vue'
import EmptyState from '@/components/EmptyState.vue'

const favStore = useFavoritesStore()
const showToast = inject('showToast', () => {})
const showClearConfirm = ref(false)
const filterText = ref('')

const filteredFavorites = computed(() => {
  if (!filterText.value) return favStore.favorites
  const q = filterText.value.toLowerCase()
  return favStore.favorites.filter(p => p.tags?.toLowerCase().includes(q) || String(p.id).includes(q))
})

function confirmClear() { showClearConfirm.value = true }
function clearAll() {
  favStore.clear()
  showClearConfirm.value = false
  showToast('Favorites cleared')
}
</script>
