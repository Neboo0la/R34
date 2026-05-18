<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <!-- Header -->
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-3">
        <div class="flex-1">
          <h1 class="text-lg font-bold text-white">Home</h1>
          <p class="text-xs text-zinc-500">Most recent posts</p>
        </div>
        <button
          @click="refresh"
          :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all', loading ? 'text-accent animate-spin' : 'text-zinc-500 hover:text-white hover:bg-bg-hover']"
          aria-label="Refresh"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      <!-- Quick search bar -->
      <div class="px-4 pb-3">
        <SearchBar
          v-model="quickSearch"
          placeholder="Quick search tags…"
          @search="doSearch"
          @clear="clearSearch"
        />
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error && !loading" class="p-4">
      <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <p class="text-red-400 font-medium text-sm">Failed to load posts</p>
          <p class="text-red-400/70 text-xs mt-0.5">{{ error }}</p>
          <button @click="refresh" class="mt-2 text-xs text-accent-light hover:underline">Try again</button>
        </div>
      </div>
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading && !posts.length" class="grid px-3 md:px-4 py-3 gap-2.5"
      :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }">
      <SkeletonCard v-for="n in 20" :key="n" :index="n - 1" />
    </div>

    <!-- Posts grid -->
    <MasonryGrid v-if="posts.length" :posts="posts" />

    <!-- Empty state -->
    <EmptyState
      v-if="!loading && !error && !posts.length"
      title="No posts found"
      description="Try searching for something else or check back later."
      icon="grid"
    />

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" class="h-4" />

    <!-- Load more spinner -->
    <div v-if="loadingMore" class="flex justify-center py-6">
      <div class="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <!-- End of results -->
    <div v-if="!hasMore && posts.length > 0" class="flex justify-center py-8">
      <span class="text-xs text-zinc-600">— End of results —</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import MasonryGrid from '@/components/MasonryGrid.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'

const postsStore = usePostsStore()
const router = useRouter()

const posts = computed(() => postsStore.posts)
const loading = computed(() => postsStore.loading)
const loadingMore = computed(() => postsStore.loadingMore)
const error = computed(() => postsStore.error)
const hasMore = computed(() => postsStore.hasMore)

const quickSearch = ref('')

const { sentinel } = useInfiniteScroll(async () => {
  await postsStore.fetchMore()
})

onMounted(() => {
  postsStore.fetchPosts('sort:id:desc', true)
})

function refresh() {
  postsStore.fetchPosts('sort:id:desc', true)
}

function doSearch(q) {
  router.push({ path: '/search', query: { q } })
}

function clearSearch() {
  quickSearch.value = ''
}
</script>
