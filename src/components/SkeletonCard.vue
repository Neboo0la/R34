<template>
  <div
    :class="['rounded-2xl overflow-hidden bg-bg-card border border-border', heightClass]"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <div class="w-full h-full shimmer-bg rounded-2xl" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  index: { type: Number, default: 0 }
})

const delay = computed(() => props.index * 50)

const heights = ['h-48', 'h-64', 'h-40', 'h-56', 'h-44', 'h-72', 'h-36', 'h-60']
const heightClass = computed(() => heights[props.index % heights.length])
</script>
