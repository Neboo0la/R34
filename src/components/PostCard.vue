<template>
  <article
    @click="handleClick"
    :class="[
      'group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
      'bg-bg-card hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-0.5 active:scale-[0.98]',
      'animate-fade-in break-inside-avoid'
    ]"
    :style="{ marginBottom: gap }"
  >
    <!-- Aspect-ratio box: reserves correct space so there's no layout shift -->
    <div class="relative w-full" :style="{ paddingTop: paddingPct + '%' }">

      <!-- Shimmer while loading -->
      <div v-if="!loaded && !error" class="absolute inset-0 shimmer-bg" />

      <!-- VIDEO: preview still + play icon -->
      <template v-if="isVideo">
        <img
          v-if="post.preview_url"
          :src="post.preview_url"
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          @load="loaded = true"
          @error="error = true"
          :alt="'Video post ' + post.id"
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </template>

      <!-- GIF: load actual file_url so it animates immediately -->
      <template v-else-if="isGif">
        <img
          :src="post.file_url"
          :alt="'GIF post ' + post.id"
          class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          loading="lazy"
          @load="loaded = true"
          @error="handleError"
        />
      </template>

      <!-- IMAGE: blurred preview_url → sample_url progressive load -->
      <template v-else>
        <img
          v-if="post.preview_url && !loaded"
          :src="post.preview_url"
          class="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          :alt="'Preview ' + post.id"
        />
        <img
          :src="post.sample_url || post.file_url"
          :alt="'Post ' + post.id"
          class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          loading="lazy"
          @load="loaded = true"
          @error="handleError"
        />
      </template>

      <!-- Gradient: always visible on mobile/tablet, hover only on desktop -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <!-- Bottom info: always visible on mobile/tablet, hover only on desktop -->
      <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-0 opacity-100 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="text-xs font-semibold text-white">{{ formatScore(post.score) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span v-if="post.width && post.height" class="text-[10px] text-zinc-400 font-mono">{{ formatResolution(post) }}</span>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/10 text-white uppercase tracking-wide">{{ fileExt }}</span>
          </div>
        </div>
      </div>

      <!-- Favorite button -->
      <button
        @click.stop="toggleFavorite"
        :class="[
          'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          'opacity-100 scale-100 lg:opacity-0 lg:group-hover:opacity-100 lg:scale-75 lg:group-hover:scale-100',
          isFav ? 'bg-red-500/90 text-white' : 'bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-black/70'
        ]"
        :aria-label="isFav ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg class="w-4 h-4" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Type badge -->
      <div v-if="isVideo || isGif" class="absolute top-2 left-2 pointer-events-none">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/80 text-white uppercase tracking-wide">
          {{ isVideo ? 'VID' : 'GIF' }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { usePostsStore } from '@/stores/posts'
import { usePostUtils } from '@/composables/usePostUtils'

const props = defineProps({ post: { type: Object, required: true } })

const favStore = useFavoritesStore()
const postsStore = usePostsStore()
const showToast = inject('showToast', () => {})

const { isVideo: _isV, isGif: _isG, formatScore, formatResolution, getFileExt } = usePostUtils()

const loaded = ref(false)
const error = ref(false)

const isVideo = computed(() => _isV(props.post))
const isGif   = computed(() => _isG(props.post))
const isFav   = computed(() => favStore.isFavorited(props.post.id))
const fileExt = computed(() => getFileExt(props.post))

// Compute padding-top % to preserve aspect ratio and prevent layout shift.
// paddingTop of X% = X% of the element's width, which sets the height.
// Formula: (height / width) * 100. Clamped to a sensible range.
const paddingPct = computed(() => {
  const { width, height } = props.post
  if (width && height) {
    const pct = (height / width) * 100
    return Math.min(Math.max(pct, 40), 200) // min 0.5:1, max 2:1
  }
  return 133 // default ~3:4 portrait
})

const gap = '10px'

function handleClick() {
  postsStore.openPost(props.post)
}

function handleError() {
  error.value = true
  loaded.value = true
}

function toggleFavorite() {
  const added = favStore.toggle(props.post)
  showToast(added ? 'Added to favorites' : 'Removed from favorites')
}
</script>
