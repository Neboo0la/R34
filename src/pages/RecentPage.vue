<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-white">Recent</h1>
          <p class="text-xs text-zinc-500">Newest uploads</p>
        </div>
        <button @click="load" :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all', loading ? 'text-accent animate-spin' : 'text-zinc-500 hover:text-white hover:bg-bg-hover']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading && !posts.length" class="grid px-3 md:px-4 py-3 gap-2.5" :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }">
      <SkeletonCard v-for="n in 20" :key="n" :index="n - 1" />
    </div>

    <MasonryGrid v-if="posts.length" :posts="posts" />

    <EmptyState v-if="!loading && !posts.length" title="No posts" description="Could not load recent posts." icon="clock" />

    <div ref="sentinel" class="h-4" />
    <div v-if="loadingMore" class="flex justify-center py-6">
      <div class="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
    <div v-if="!hasMore && posts.length" class="flex justify-center py-8">
      <span class="text-xs text-zinc-600">— End of results —</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useSettingsStore } from '@/stores/settings'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import MasonryGrid from '@/components/MasonryGrid.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const postsStore = usePostsStore()
const settingsStore = useSettingsStore()

const posts = computed(() => postsStore.posts)
const loading = computed(() => postsStore.loading)
const loadingMore = computed(() => postsStore.loadingMore)
const hasMore = computed(() => postsStore.hasMore)

const { sentinel } = useInfiniteScroll(async () => {
  await postsStore.fetchMore()
})

function load() {
  postsStore.fetchPosts('sort:id:desc', true)
}

onMounted(load)
</script>
