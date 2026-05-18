<template>
  <div ref="gridRef" class="masonry-grid px-3 md:px-4 py-3" :style="gridStyle">
    <PostCard
      v-for="(post, i) in filteredPosts"
      :key="post.id"
      :post="post"
      :style="{ animationDelay: `${Math.min(i % 20, 10) * 30}ms` }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import PostCard from './PostCard.vue'

const props = defineProps({ posts: { type: Array, required: true } })

const settingsStore = useSettingsStore()

const filteredPosts = computed(() => {
  const blacklist = settingsStore.blacklistedTags
  if (!blacklist.length) return props.posts
  return props.posts.filter(post => {
    const postTags = post.tags ? post.tags.split(' ') : []
    return !blacklist.some(bt => postTags.includes(bt))
  })
})
const gridRef = ref(null)
const containerWidth = ref(800)

let ro
onMounted(() => {
  ro = new ResizeObserver(e => { containerWidth.value = e[0]?.contentRect.width ?? 800 })
  if (gridRef.value) ro.observe(gridRef.value)
})
onUnmounted(() => ro?.disconnect())

const cols = computed(() => {
  const w = containerWidth.value
  const d = settingsStore.gridDensity
  if (d === 'compact') {
    if (w < 400) return 3
    if (w < 640) return 4
    if (w < 1024) return 5
    return 6
  }
  if (d === 'large') {
    if (w < 640) return 1
    if (w < 1024) return 2
    return 3
  }
  if (w < 480) return 2
  if (w < 768) return 3
  if (w < 1280) return 4
  return 5
})

const gap = '10px'

// CSS columns gives true masonry — items flow top-to-bottom within each column
// with no gaps caused by different heights
const gridStyle = computed(() => ({
  columns: cols.value,
  columnGap: gap.value
}))
</script>
