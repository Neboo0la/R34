<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <!-- Header -->
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7 1.002 2.104 2.42 4.028 4.01 5.659a8.003 8.003 0 011.661 6.998z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-white">Hot Posts</h1>
          <p class="text-xs text-zinc-500">{{ activeTab.label }} · top rated</p>
        </div>
        <button
          @click="load"
          :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all', loading ? 'text-orange-400 animate-spin' : 'text-zinc-500 hover:text-white hover:bg-bg-hover']"
          aria-label="Refresh"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      <!-- Time period tabs -->
      <div class="flex items-stretch gap-0 px-4 pb-0 border-b border-border overflow-x-auto no-scrollbar">
        <button
          v-for="tab in timeTabs"
          :key="tab.value"
          @click="selectTab(tab)"
          :class="[
            'relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
            activeTab.value === tab.value
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          ]"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.label }}
          <!-- Active underline indicator -->
          <span
            v-if="activeTab.value === tab.value"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-light rounded-t-full"
          />
        </button>
      </div>
    </div>

    <!-- Calibrating notice while fetching latest ID -->
    <Transition name="fade">
      <div v-if="calibrating" class="flex items-center gap-2.5 mx-4 mt-4 px-4 py-3 rounded-2xl bg-bg-secondary border border-border text-sm text-zinc-400">
        <div class="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin flex-shrink-0" />
        <span>Calibrating time window…</span>
      </div>
    </Transition>

    <!-- Error -->
    <div v-if="postsStore.error && !loading" class="p-4">
      <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <p class="text-red-400 font-medium text-sm">Failed to load posts</p>
          <p class="text-red-400/70 text-xs mt-0.5">{{ postsStore.error }}</p>
          <button @click="load" class="mt-2 text-xs text-accent-light hover:underline">Try again</button>
        </div>
      </div>
    </div>

    <!-- Skeleton -->
    <div
      v-if="loading && !posts.length"
      class="grid px-3 md:px-4 py-3 gap-2.5"
      :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }"
    >
      <SkeletonCard v-for="n in 20" :key="n" :index="n - 1" />
    </div>

    <!-- Grid -->
    <MasonryGrid v-if="posts.length" :posts="posts" />

    <!-- Empty -->
    <EmptyState
      v-if="!loading && !posts.length && !postsStore.error && !calibrating"
      title="No posts found"
      :description="`No top-rated posts for ${activeTab.label.toLowerCase()}.`"
      icon="fire"
    />

    <!-- Infinite scroll sentinel -->
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
import { ref, computed, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useSettingsStore } from '@/stores/settings'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { r34Api } from '@/services/r34Api'
import MasonryGrid from '@/components/MasonryGrid.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const postsStore = usePostsStore()
const settingsStore = useSettingsStore()

// ─── Time tabs ────────────────────────────────────────────────────
const timeTabs = [
  {
    value: 'day',
    label: 'Daily',
    days: 1,
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    value: 'week',
    label: 'Weekly',
    days: 7,
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    value: 'month',
    label: 'Monthly',
    days: 30,
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    value: 'year',
    label: 'Yearly',
    days: 365,
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    value: 'all',
    label: 'All Time',
    days: null,
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
  }
]

const activeTab = ref(timeTabs[2]) // Default: Monthly
const calibrating = ref(false)
const latestId = ref(null)

// Rule34 posts about ~5000/day average (conservative estimate keeps results relevant)
const POSTS_PER_DAY = 5000

const posts = computed(() => postsStore.posts)
const loading = computed(() => postsStore.loading)
const loadingMore = computed(() => postsStore.loadingMore)
const hasMore = computed(() => postsStore.hasMore)

const { sentinel } = useInfiniteScroll(async () => {
  await postsStore.fetchMore()
})

// Fetch the most recent post to anchor our time-window estimates
async function getLatestId() {
  if (latestId.value) return latestId.value
  calibrating.value = true
  try {
    const recent = await r34Api.getPosts({ tags: 'sort:id:desc', pid: 0, limit: 1 })
    if (recent.length) latestId.value = recent[0].id
  } catch {
    // Fall back to no ID filter if we can't calibrate
    latestId.value = null
  } finally {
    calibrating.value = false
  }
  return latestId.value
}

function buildTagsForTab(tab) {
  if (tab.days === null || !latestId.value) {
    // All Time — no ID filter, just sort by score
    return 'sort:score:desc'
  }
  // Estimate the minimum post ID for the chosen time window
  const threshold = Math.max(1, latestId.value - Math.round(tab.days * POSTS_PER_DAY))
  return `id:>=${threshold} sort:score:desc`
}

async function load() {
  await getLatestId()
  const tags = buildTagsForTab(activeTab.value)
  postsStore.fetchPosts(tags, true)
}

function selectTab(tab) {
  activeTab.value = tab
  load()
}

onMounted(load)
</script>
