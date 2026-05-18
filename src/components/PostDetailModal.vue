<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="post"
        ref="overlayRef"
        class="fixed inset-0 z-[100] flex items-stretch lg:items-center lg:justify-center"
        role="dialog"
        aria-modal="true"
        :aria-label="`Post ${post.id}`"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/85 backdrop-blur-sm" @click="close" />

        <!-- Panel -->
        <div
          ref="panelRef"
          :class="[
            'relative z-10 flex flex-col lg:flex-row w-full h-full lg:h-auto lg:max-w-6xl lg:max-h-[92vh] lg:rounded-2xl overflow-hidden',
            'bg-bg-secondary border-0 lg:border lg:border-border shadow-2xl',
            'animate-scale-in'
          ]"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend.passive="onTouchEnd"
        >
          <!-- Media area -->
          <div
            ref="mediaAreaRef"
            class="flex-1 min-h-0 relative bg-black flex items-center justify-center overflow-hidden group"
            :style="{ ...mediaAreaStyle, cursor: dragCursor }"
            @wheel.prevent="onWheel"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
          >
            <!-- Close button (mobile top-right) -->
            <button
              @click="close"
              class="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors lg:hidden"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- Prev / Next arrows (desktop) -->
            <button
              v-if="hasPrev"
              @click="navigateRelative(-1)"
              class="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Previous post"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              v-if="hasNext"
              @click="navigateRelative(1)"
              class="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Next post"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Media content -->
            <Transition name="media-fade" mode="out-in">
              <div :key="post.id" class="absolute inset-0 flex items-center justify-center" ref="zoomTarget"
                :style="{ transform: `scale(${pinchScale}) translate(${pinchOffX}px, ${pinchOffY}px)`, transformOrigin: 'center', transition: pinchScale > 1 ? 'none' : 'transform 0.3s ease' }"
              >
                <!-- Video -->
                <video
                  v-if="isVideo"
                  :src="post.file_url"
                  :autoplay="false"
                  controls
                  loop
                  class="max-w-full max-h-full w-auto h-auto object-contain"
                />
                <!-- GIF / Image -->
                <img
                  v-else
                  :src="imgSrc"
                  :alt="`Post ${post.id}`"
                  class="max-w-full max-h-full w-auto h-auto object-contain select-none"
                  draggable="false"
                  @click="toggleFullSrc"
                  @load="imgLoaded = true"
                />
              </div>
            </Transition>

            <!-- Loading overlay -->
            <div v-if="!imgLoaded && !isVideo" class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>

            <!-- Swipe indicator overlay -->
            <Transition name="fade">
              <div v-if="swipeHint" class="absolute inset-0 flex items-center pointer-events-none">
                <div
                  :class="[
                    'absolute text-white/60 text-4xl font-light',
                    swipeHint === 'left' ? 'right-6' : 'left-6'
                  ]"
                >
                  {{ swipeHint === 'left' ? '›' : '‹' }}
                </div>
              </div>
            </Transition>

          </div>

          <!-- Info panel -->
          <div class="w-full max-h-[45vh] lg:max-h-none lg:w-80 lg:flex-shrink-0 overflow-y-auto bg-bg-secondary flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-bg-secondary z-10">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-zinc-500">#{{ post.id }}</span>
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', ratingBg]">{{ ratingLabel }}</span>
              </div>
              <div class="flex items-center gap-2">
                <!-- Favorite -->
                <button @click="toggleFav" :class="['w-8 h-8 rounded-full flex items-center justify-center transition-all', isFav ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 hover:text-white hover:bg-bg-hover']">
                  <svg class="w-4 h-4" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
                <!-- Download -->
                <a :href="post.file_url" download :title="`Download post ${post.id}`" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-bg-hover transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </a>
                <!-- Open original -->
                <a :href="post.file_url" target="_blank" rel="noopener" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-bg-hover transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
                <!-- Close (desktop) -->
                <button @click="close" class="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-zinc-500 hover:text-white hover:bg-bg-hover transition-all" aria-label="Close">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex-1 px-4 py-3 space-y-4 pb-safe">
              <!-- Stats row -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-bg-tertiary rounded-xl p-2.5 text-center">
                  <div class="text-lg font-bold text-yellow-400">{{ formatScore(post.score) }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wide">Score</div>
                </div>
                <div class="bg-bg-tertiary rounded-xl p-2.5 text-center">
                  <div class="text-sm font-bold text-white truncate">{{ resolution }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wide">Resolution</div>
                </div>
                <div class="bg-bg-tertiary rounded-xl p-2.5 text-center">
                  <div class="text-sm font-bold text-white uppercase">{{ fileExt }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wide">Type</div>
                </div>
                <div class="bg-bg-tertiary rounded-xl p-2.5 text-center">
                  <div class="text-sm font-bold text-white">{{ postDate || '—' }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wide">Posted</div>
                </div>
              </div>

              <!-- Source -->
              <div v-if="post.source" class="space-y-1.5">
                <div class="flex items-center gap-2 text-xs">
                  <svg class="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                  <a :href="post.source.startsWith('http') ? post.source : '#'" target="_blank" rel="noopener"
                    class="text-accent-light hover:underline truncate max-w-[200px]">
                    {{ post.source.replace(/^https?:\/\//, '').slice(0, 40) }}
                  </a>
                </div>
              </div>

              <!-- Artists -->
              <div v-if="artists.length > 0">
                <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Artist</div>
                <div class="flex flex-wrap gap-1.5">
                  <TagChip v-for="a in artists" :key="a" :tag="a" variant="artist" />
                </div>
              </div>

              <!-- Tags -->
              <div v-if="generalTags.length > 0">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tags</div>
                  <span class="text-xs text-zinc-600">{{ generalTags.length }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <TagChip v-for="t in visibleTags" :key="t" :tag="t" />
                </div>
                <button
                  v-if="generalTags.length > 20"
                  @click="showAllTags = !showAllTags"
                  class="mt-2 text-xs text-accent-light hover:text-accent transition-colors"
                >
                  {{ showAllTags ? 'Show less' : `+${generalTags.length - 20} more` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useFavoritesStore } from '@/stores/favorites'
import { usePostUtils } from '@/composables/usePostUtils'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { inject } from 'vue'
import TagChip from './TagChip.vue'

const postsStore = usePostsStore()
const favStore = useFavoritesStore()
const showToast = inject('showToast', () => {})
const { isVideo: _isV, isGif: _isG, formatScore, formatResolution, getRatingLabel, getRatingColor, getFileExt, parseTags, getArtistTags } = usePostUtils()

const post = computed(() => postsStore.selectedPost)
const overlayRef = ref(null)
const panelRef = ref(null)
const zoomTarget = ref(null)
const imgLoaded = ref(false)
const showAllTags = ref(false)
const useFullSrc = ref(false)
const swipeHint = ref(null)

// Zoom / pan state (shared between touch and mouse)
const pinchScale = ref(1)
const pinchOffX = ref(0)
const pinchOffY = ref(0)

// Touch state
let touchStartDist = 0
let touchStartScale = 1
let swipeStartX = 0
let swipeStartY = 0
let swipeDeltaX = 0
let touchPanStartOffX = 0
let touchPanStartOffY = 0

// Mouse state
const isMouseDragging = ref(false)
let hasMoved = false
let mouseDownX = 0
let mouseDownY = 0
let mouseStartOffX = 0
let mouseStartOffY = 0

const dragCursor = computed(() => {
  if (isVideo.value) return 'default'
  if (isMouseDragging.value && pinchScale.value > 1) return 'grabbing'
  if (pinchScale.value > 1) return 'grab'
  return 'zoom-in'
})

const isVideo = computed(() => _isV(post.value))
const isGif = computed(() => _isG(post.value))
const isFav = computed(() => post.value ? favStore.isFavorited(post.value.id) : false)
const resolution = computed(() => formatResolution(post.value))
const fileExt = computed(() => getFileExt(post.value))
const ratingLabel = computed(() => getRatingLabel(post.value?.rating))
const ratingBg = computed(() => {
  const r = post.value?.rating?.toLowerCase()
  if (r === 's' || r === 'safe') return 'bg-green-500/15 text-green-400'
  if (r === 'q' || r === 'questionable') return 'bg-yellow-500/15 text-yellow-400'
  return 'bg-red-500/15 text-red-400'
})

const allTags = computed(() => parseTags(post.value))
const artists = computed(() => {
  return allTags.value.filter(t => t.includes('_(artist)') || t.endsWith('_artist'))
    .map(t => t.replace('_(artist)', '').replace('_artist', ''))
})
const generalTags = computed(() => allTags.value.filter(t => !artists.value.some(a => t.includes(a))))
const visibleTags = computed(() => showAllTags.value ? generalTags.value : generalTags.value.slice(0, 20))

const imgSrc = computed(() => {
  if (!post.value) return ''
  // GIFs must always load file_url — sample_url is often a static JPEG on rule34
  if (isGif.value) return post.value.file_url
  return useFullSrc.value ? post.value.file_url : (post.value.sample_url || post.value.file_url)
})

const mediaAreaStyle = computed(() => ({
  maxHeight: window.innerWidth >= 1024 ? '92vh' : undefined
}))

const currentIdx = computed(() => postsStore.posts.findIndex(p => p.id === post.value?.id))
const hasPrev = computed(() => currentIdx.value > 0)
const hasNext = computed(() => currentIdx.value < postsStore.posts.length - 1)

watch(() => post.value?.id, () => {
  imgLoaded.value = false
  useFullSrc.value = false
  pinchScale.value = 1
  pinchOffX.value = 0
  pinchOffY.value = 0
  showAllTags.value = false
  hasMoved = false
  isMouseDragging.value = false
})

function close() { postsStore.closePost() }

function toggleFav() {
  const added = favStore.toggle(post.value)
  showToast(added ? 'Added to favorites' : 'Removed from favorites')
}

function toggleFullSrc() {
  if (hasMoved) { hasMoved = false; return }
  if (!isVideo.value && !isGif.value) {
    useFullSrc.value = !useFullSrc.value
    imgLoaded.value = false
  }
}

function resetZoom() {
  pinchScale.value = 1
  pinchOffX.value = 0
  pinchOffY.value = 0
}

function onWheel(e) {
  if (isVideo.value) return
  const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2
  const next = Math.max(1, Math.min(8, pinchScale.value * factor))
  pinchScale.value = next
  if (next <= 1) { pinchOffX.value = 0; pinchOffY.value = 0 }
}

function onMouseDown(e) {
  if (e.button !== 0 || isVideo.value) return
  isMouseDragging.value = true
  hasMoved = false
  mouseDownX = e.clientX
  mouseDownY = e.clientY
  mouseStartOffX = pinchOffX.value
  mouseStartOffY = pinchOffY.value
}

function onMouseMove(e) {
  if (!isMouseDragging.value) return
  const dx = e.clientX - mouseDownX
  const dy = e.clientY - mouseDownY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true
  if (pinchScale.value > 1 && hasMoved) {
    pinchOffX.value = mouseStartOffX + dx / pinchScale.value
    pinchOffY.value = mouseStartOffY + dy / pinchScale.value
  }
}

function onMouseUp() {
  isMouseDragging.value = false
}

function navigateRelative(dir) {
  const idx = currentIdx.value + dir
  if (idx >= 0 && idx < postsStore.posts.length) {
    postsStore.openPost(postsStore.posts[idx])
  }
}

const postDate = computed(() => {
  if (!post.value) return null
  const ts = post.value.created_at || post.value.change
  if (!ts) return null
  try {
    const ms = ts > 1e10 ? ts : ts * 1000
    return new Date(ms).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return null }
})

// Touch / swipe handling
function onTouchStart(e) {
  if (e.touches.length === 2) {
    touchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    touchStartScale = pinchScale.value
    return
  }
  swipeStartX = e.touches[0].clientX
  swipeStartY = e.touches[0].clientY
  swipeDeltaX = 0
  touchPanStartOffX = pinchOffX.value
  touchPanStartOffY = pinchOffY.value
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    pinchScale.value = Math.max(1, Math.min(8, touchStartScale * (d / touchStartDist)))
    return
  }
  if (pinchScale.value > 1) {
    const dx = e.touches[0].clientX - swipeStartX
    const dy = e.touches[0].clientY - swipeStartY
    pinchOffX.value = touchPanStartOffX + dx / pinchScale.value
    pinchOffY.value = touchPanStartOffY + dy / pinchScale.value
    return
  }
  swipeDeltaX = e.touches[0].clientX - swipeStartX
  const dy = Math.abs(e.touches[0].clientY - swipeStartY)
  if (Math.abs(swipeDeltaX) > dy && Math.abs(swipeDeltaX) > 30) {
    swipeHint.value = swipeDeltaX < 0 ? 'left' : 'right'
  }
}

function onTouchEnd() {
  if (pinchScale.value <= 1.05) { pinchScale.value = 1 }
  swipeHint.value = null
  if (Math.abs(swipeDeltaX) > 80 && pinchScale.value <= 1) {
    if (swipeDeltaX < 0 && hasNext.value) navigateRelative(1)
    else if (swipeDeltaX > 0 && hasPrev.value) navigateRelative(-1)
  } else if (swipeDeltaX === 0) {
    // swipe down to close on mobile
    const dy = 0
  }
  swipeDeltaX = 0
}

useKeyboardShortcuts({
  Escape: close,
  ArrowRight: () => navigateRelative(1),
  ArrowLeft: () => navigateRelative(-1),
  f: () => toggleFav(),
  d: () => post.value && window.open(post.value.file_url, '_blank')
})

// Prevent body scroll when open
watch(post, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
}, { immediate: true })
onUnmounted(() => { document.body.style.overflow = '' })
</script>
