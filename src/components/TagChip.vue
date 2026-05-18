<template>
  <button
    @click="handleClick"
    :class="[
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
      'transition-all duration-150 active:scale-95 whitespace-nowrap max-w-[180px] truncate',
      variantClasses
    ]"
    :title="tag"
  >
    <span class="truncate">{{ displayTag }}</span>
    <svg v-if="removable" @click.stop="$emit('remove', tag)" class="w-3 h-3 flex-shrink-0 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  tag: { type: String, required: true },
  variant: { type: String, default: 'default' }, // default | artist | meta | exclude
  removable: { type: Boolean, default: false },
  clickable: { type: Boolean, default: true }
})

defineEmits(['remove'])
const router = useRouter()

const displayTag = computed(() => props.tag.replace(/_/g, ' '))

const variantClasses = computed(() => {
  if (!props.clickable) return 'bg-bg-tertiary text-zinc-400 cursor-default'
  const map = {
    artist: 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20',
    meta: 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/20',
    exclude: 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20',
    default: 'bg-bg-tertiary text-zinc-300 hover:bg-bg-hover hover:text-white border border-border'
  }
  return map[props.variant] ?? map.default
})

function handleClick() {
  if (!props.clickable) return
  const tag = props.tag.startsWith('-') ? props.tag.slice(1) : props.tag
  router.push({ path: '/search', query: { q: tag } })
}
</script>
