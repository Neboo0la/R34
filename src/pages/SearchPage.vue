<template>
  <div class="min-h-screen pb-20 md:pb-0">

    <!-- ── Sticky header ─────────────────────────────────────────── -->
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border transition-transform duration-300"
      :class="navVisible.value ? 'translate-y-0' : '-translate-y-full'">
      <div class="px-4 pt-4 pb-3">
        <h1 class="text-lg font-bold text-white mb-3">Search</h1>
        <div class="flex gap-2">
          <div class="flex-1 min-w-0">
            <SearchBar
              ref="searchBarRef"
              v-model="inputTags"
              placeholder="Tags… (use - to exclude)"
              :showHistory="true"
              @search="doSearch"
              @clear="clearResults"
            />
          </div>
          <!-- Filters toggle -->
          <button
            @click="filtersOpen = !filtersOpen"
            :class="[
              'relative flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex-shrink-0',
              filtersOpen || activeFilterCount > 0
                ? 'bg-accent/15 border-accent/50 text-accent-light'
                : 'bg-bg-secondary border-border text-zinc-400 hover:text-white hover:border-border-light'
            ]"
            aria-label="Toggle filters"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span>Filters</span>
            <span
              v-if="activeFilterCount > 0"
              class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center"
            >{{ activeFilterCount }}</span>
          </button>
        </div>
      </div>

      <!-- ── Collapsible filter panel ──────────────────────────── -->
      <Transition name="filter-panel">
        <div v-if="filtersOpen" class="border-t border-border bg-bg-secondary/50 px-4 py-4 space-y-4">

          <!-- Row 1: Sort + Rating -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Sort by</label>
              <select
                v-model="sortBy"
                class="w-full bg-bg-tertiary border border-border text-sm text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-accent/50 transition-colors"
              >
                <option value="default">Default</option>
                <option value="score:desc">Score — high to low</option>
                <option value="score:asc">Score — low to high</option>
                <option value="id:desc">Newest first</option>
                <option value="id:asc">Oldest first</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Rating</label>
              <select
                v-model="ratingFilter"
                class="w-full bg-bg-tertiary border border-border text-sm text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-accent/50 transition-colors"
              >
                <option value="">Any rating</option>
                <option value="s">Safe</option>
                <option value="q">Questionable</option>
                <option value="e">Explicit</option>
              </select>
            </div>
          </div>

          <!-- Row 2: Score filter -->
          <div>
            <label class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Score</label>
            <div class="flex gap-2">
              <!-- Comparator buttons -->
              <div class="flex rounded-xl overflow-hidden border border-border bg-bg-tertiary flex-shrink-0">
                <button
                  v-for="op in scoreOps"
                  :key="op.value"
                  @click="scoreOp = op.value"
                  :class="[
                    'px-3 py-2 text-xs font-mono font-bold transition-all duration-150 border-r border-border last:border-r-0',
                    scoreOp === op.value
                      ? 'bg-accent text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-bg-hover'
                  ]"
                  :title="op.label"
                >{{ op.value }}</button>
              </div>
              <!-- Score number input -->
              <input
                v-model.number="scoreValue"
                type="number"
                min="0"
                max="100000"
                placeholder="e.g. 100"
                class="flex-1 bg-bg-tertiary border border-border text-sm text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-accent/50 transition-colors placeholder-zinc-600 min-w-0"
                @keydown.enter="applyAndSearch"
              />
              <!-- Clear score -->
              <button
                v-if="scoreValue !== null"
                @click="scoreValue = null"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-tertiary border border-border text-zinc-500 hover:text-white hover:border-border-light transition-all flex-shrink-0"
                aria-label="Clear score filter"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <!-- Score preview tag -->
            <p v-if="scoreValue !== null" class="mt-1.5 text-xs text-zinc-600 font-mono">
              → <span class="text-accent-light">score:{{ scoreOp }}{{ scoreValue }}</span>
            </p>
          </div>

          <!-- Row 3: Time period -->
          <div>
            <label class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Time period
              <span v-if="calibrating" class="ml-2 text-accent-light normal-case tracking-normal font-normal">calibrating…</span>
            </label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="period in timePeriods"
                :key="period.value"
                @click="timePeriod = period.value"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200',
                  timePeriod === period.value
                    ? 'bg-accent/15 border-accent/50 text-accent-light'
                    : 'bg-bg-tertiary border-border text-zinc-400 hover:text-white hover:border-border-light'
                ]"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="period.icon"/>
                </svg>
                {{ period.label }}
              </button>
            </div>
            <p v-if="timePeriod !== 'all' && latestId" class="mt-1.5 text-xs text-zinc-600 font-mono">
              → <span class="text-accent-light">id:>={{ idThreshold }}</span>
            </p>
            <p v-else-if="timePeriod !== 'all' && !latestId && !calibrating" class="mt-1.5 text-xs text-zinc-600">
              Could not calibrate — time filter may be approximate
            </p>
          </div>

          <!-- Apply / Reset row -->
          <div class="flex gap-2 pt-1">
            <button
              @click="applyAndSearch"
              class="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20 active:scale-[0.98]"
            >
              Apply filters
            </button>
            <button
              v-if="activeFilterCount > 0"
              @click="resetFilters"
              class="px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── Active filter chips row ───────────────────────────── -->
      <div
        v-if="filterChips.length > 0"
        class="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar border-t border-border"
      >
        <button
          v-for="chip in filterChips"
          :key="chip.key"
          @click="removeFilterChip(chip)"
          :class="[
            'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
            chip.type === 'score'
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
              : chip.type === 'time'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
              : chip.type === 'rating'
              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
              : 'bg-accent/10 border-accent/20 text-accent-light hover:bg-accent/20'
          ]"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="chip.icon"/>
          </svg>
          <span class="font-mono">{{ chip.label }}</span>
          <svg class="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Results count ─────────────────────────────────────────── -->
    <div v-if="posts.length && !loading" class="flex items-center gap-2 px-4 py-2">
      <p class="text-xs text-zinc-600">{{ posts.length }} post{{ posts.length !== 1 ? 's' : '' }} loaded</p>
    </div>

    <!-- ── Skeleton ──────────────────────────────────────────────── -->
    <div v-if="loading && !posts.length" class="grid px-3 md:px-4 py-3 gap-2.5"
      :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }">
      <SkeletonCard v-for="n in 20" :key="n" :index="n - 1" />
    </div>

    <!-- ── Results grid ──────────────────────────────────────────── -->
    <MasonryGrid v-if="posts.length" :posts="posts" />

    <!-- ── Initial / empty state ────────────────────────────────── -->
    <div v-if="!loading && !posts.length && !hasSearched" class="py-16 px-6">
      <div class="text-center mb-8 animate-fade-up">
        <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h2 class="text-white font-semibold text-xl">Search R34</h2>
        <p class="text-zinc-500 text-sm mt-1">Enter tags to find posts</p>
      </div>

      <div v-if="searchStore.history.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-zinc-400">Recent Searches</h3>
          <button @click="searchStore.clearHistory()" class="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Clear all</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="h in searchStore.history.slice(0, 12)"
            :key="h"
            @click="doSearch(h)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-secondary border border-border text-sm text-zinc-300 hover:text-white hover:border-accent/40 transition-all"
          >
            <svg class="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ h }}
          </button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="!loading && !posts.length && hasSearched"
      title="No results found"
      :description="`No posts match your filters. Try relaxing some conditions.`"
      icon="search"
    >
      <button @click="clearResults" class="mt-4 px-4 py-2 rounded-xl bg-accent/15 text-accent-light text-sm font-medium hover:bg-accent/25 transition-colors">
        Clear search
      </button>
    </EmptyState>

    <!-- ── Infinite scroll sentinel ─────────────────────────────── -->
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
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useSearchStore } from '@/stores/search'
import { useSettingsStore } from '@/stores/settings'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { r34Api } from '@/services/r34Api'
import MasonryGrid from '@/components/MasonryGrid.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'

const navVisible = inject('navVisible', { value: true })
const postsStore = usePostsStore()
const searchStore = useSearchStore()
const settingsStore = useSettingsStore()
const route = useRoute()
const router = useRouter()

// ── Search state ────────────────────────────────────────────────
const inputTags = ref('')
const hasSearched = ref(false)
const searchBarRef = ref(null)
const filtersOpen = ref(false)

// ── Filter state ────────────────────────────────────────────────
const sortBy = ref('default')
const ratingFilter = ref('')
const scoreOp = ref('>=')
const scoreValue = ref(null)   // null = disabled
const timePeriod = ref('all')

// ── ID calibration (for time period filter) ─────────────────────
const POSTS_PER_DAY = 5000
const latestId = ref(null)
const calibrating = ref(false)

const timePeriods = [
  { value: 'all',   label: 'All Time', days: null, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { value: 'day',   label: 'Day',      days: 1,    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { value: 'week',  label: 'Week',     days: 7,    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'month', label: 'Month',    days: 30,   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { value: 'year',  label: 'Year',     days: 365,  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
]

const scoreOps = [
  { value: '>=', label: 'At least' },
  { value: '>',  label: 'Greater than' },
  { value: '<=', label: 'At most' },
  { value: '<',  label: 'Less than' },
  { value: ':',  label: 'Exactly' }
]

// Compute the ID threshold for the selected time window
const idThreshold = computed(() => {
  const period = timePeriods.find(p => p.value === timePeriod.value)
  if (!period?.days || !latestId.value) return null
  return Math.max(1, latestId.value - Math.round(period.days * POSTS_PER_DAY))
})

// ── Active filter count (for badge) ─────────────────────────────
const activeFilterCount = computed(() => {
  let n = 0
  if (sortBy.value !== 'default') n++
  if (ratingFilter.value) n++
  if (scoreValue.value !== null) n++
  if (timePeriod.value !== 'all') n++
  return n
})

// ── Active filter chips (displayed below search bar) ─────────────
const filterChips = computed(() => {
  const chips = []
  if (sortBy.value !== 'default') {
    const labels = { 'score:desc': 'score high→low', 'score:asc': 'score low→high', 'id:desc': 'newest', 'id:asc': 'oldest' }
    chips.push({ key: 'sort', type: 'sort', label: labels[sortBy.value] ?? sortBy.value, icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' })
  }
  if (ratingFilter.value) {
    const labels = { s: 'safe', q: 'questionable', e: 'explicit' }
    chips.push({ key: 'rating', type: 'rating', label: labels[ratingFilter.value], icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
  }
  if (scoreValue.value !== null) {
    const opLabel = { '>=': '≥', '>': '>', '<=': '≤', '<': '<', ':': '=' }
    chips.push({ key: 'score', type: 'score', label: `score ${opLabel[scoreOp.value]}${scoreValue.value}`, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' })
  }
  if (timePeriod.value !== 'all') {
    const found = timePeriods.find(p => p.value === timePeriod.value)
    chips.push({ key: 'time', type: 'time', label: found?.label ?? timePeriod.value, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
  }
  return chips
})

// ── Posts ────────────────────────────────────────────────────────
const posts = computed(() => postsStore.posts)
const loading = computed(() => postsStore.loading)
const loadingMore = computed(() => postsStore.loadingMore)
const hasMore = computed(() => postsStore.hasMore)

const { sentinel } = useInfiniteScroll(async () => {
  await postsStore.fetchMore()
})

// ── Calibrate latest post ID ─────────────────────────────────────
async function calibrateLatestId() {
  if (latestId.value) return
  calibrating.value = true
  try {
    const recent = await r34Api.getPosts({ tags: 'sort:id:desc', pid: 0, limit: 1 })
    if (recent.length) latestId.value = recent[0].id
  } catch { /* use no ID filter */ } finally {
    calibrating.value = false
  }
}

// ── Build the full query string from all active filters ──────────
function buildQuery(baseTags) {
  const parts = baseTags.trim().split(' ').filter(Boolean)

  if (sortBy.value !== 'default') parts.push(`sort:${sortBy.value}`)
  if (ratingFilter.value) parts.push(`rating:${ratingFilter.value}`)
  if (scoreValue.value !== null) {
    // Rule34 meta-tag: score:>=100 or score:>100 etc.
    // The ':' comparator means "exactly" → score:100
    const meta = scoreOp.value === ':' ? `score:${scoreValue.value}` : `score:${scoreOp.value}${scoreValue.value}`
    parts.push(meta)
  }
  if (timePeriod.value !== 'all' && idThreshold.value) {
    parts.push(`id:>=${idThreshold.value}`)
  }

  return parts.join(' ')
}

function doSearch(q) {
  inputTags.value = q
  hasSearched.value = true
  searchStore.addToHistory(q)
  router.replace({ path: '/search', query: { q } })
  postsStore.fetchPosts(buildQuery(q), true)
}

async function applyAndSearch() {
  filtersOpen.value = false
  if (timePeriod.value !== 'all') await calibrateLatestId()
  const q = inputTags.value.trim()
  hasSearched.value = true
  if (q) searchStore.addToHistory(q)
  postsStore.fetchPosts(buildQuery(q), true)
}

function clearResults() {
  inputTags.value = ''
  hasSearched.value = false
  postsStore.posts.splice(0)
  router.replace('/search')
}

function resetFilters() {
  sortBy.value = 'default'
  ratingFilter.value = ''
  scoreValue.value = null
  scoreOp.value = '>='
  timePeriod.value = 'all'
  if (hasSearched.value) applyAndSearch()
}

function removeFilterChip(chip) {
  if (chip.key === 'sort') sortBy.value = 'default'
  else if (chip.key === 'rating') ratingFilter.value = ''
  else if (chip.key === 'score') scoreValue.value = null
  else if (chip.key === 'time') timePeriod.value = 'all'
  if (hasSearched.value) applyAndSearch()
}

// Re-run search when filters change (if already searched)
watch([sortBy, ratingFilter], () => {
  if (hasSearched.value) applyAndSearch()
})

// Pre-calibrate when time period is selected
watch(timePeriod, async (val) => {
  if (val !== 'all') await calibrateLatestId()
})

// React to tag-chip navigation even when SearchPage is already mounted
watch(() => route.query.q, (q) => {
  if (q && String(q) !== inputTags.value) {
    inputTags.value = String(q)
    doSearch(String(q))
  }
})

onMounted(() => {
  const q = route.query.q
  if (q) {
    inputTags.value = String(q)
    doSearch(String(q))
  } else {
    postsStore.posts.splice(0)
    setTimeout(() => searchBarRef.value?.focus(), 300)
  }
})
</script>
