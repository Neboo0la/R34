<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-white">Trending</h1>
          <p class="text-xs text-zinc-500">Popular tags right now</p>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 space-y-2">
      <button
        v-for="tag in trendingTags"
        :key="tag.name"
        @click="searchTag(tag.name)"
        class="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border hover:border-accent/40 hover:bg-bg-hover transition-all duration-200 group animate-fade-up"
        :style="{ animationDelay: `${tag.rank * 30}ms` }"
      >
        <!-- Rank badge -->
        <div :class="[
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
          tag.rank === 1 ? 'bg-gradient-to-br from-yellow-500/30 to-amber-500/20' :
          tag.rank === 2 ? 'bg-gradient-to-br from-zinc-400/20 to-zinc-500/10' :
          tag.rank === 3 ? 'bg-gradient-to-br from-amber-700/30 to-orange-800/10' :
          'bg-bg-tertiary'
        ]">
          <!-- Top-3 get a trophy/medal SVG; rest get numeric label -->
          <svg v-if="tag.rank === 1" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3h14l-1.5 9H6.5L5 3zm7 10a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM8 21h8v-1H8v1z"/>
          </svg>
          <svg v-else-if="tag.rank === 2" class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg v-else-if="tag.rank === 3" class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
          <span v-else class="text-xs font-semibold text-zinc-600">#{{ tag.rank }}</span>
        </div>

        <!-- Tag info -->
        <div class="flex-1 min-w-0 text-left">
          <div class="text-sm font-medium text-white group-hover:text-accent-light transition-colors truncate">
            {{ tag.label ?? tag.name.replace(/_/g, ' ') }}
          </div>
          <div class="text-xs text-zinc-600">{{ formatCount(tag.count) }} posts</div>
        </div>

        <!-- Progress bar -->
        <div class="w-24 hidden sm:block">
          <div class="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
              :style="{ width: `${(tag.count / trendingTags[0].count) * 100}%` }"
            />
          </div>
        </div>

        <svg class="w-4 h-4 text-zinc-700 group-hover:text-accent-light transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { r34Api } from '@/services/r34Api'

const router = useRouter()
const trendingTags = ref(r34Api.getTrendingTags())

function searchTag(name) {
  router.push({ path: '/search', query: { q: name } })
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>
