<template>
  <div class="min-h-screen pb-20 md:pb-0 flex flex-col items-center justify-center">
    <div v-if="loading" class="flex flex-col items-center gap-4 py-20">
      <div class="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p class="text-zinc-500 text-sm">Loading post…</p>
    </div>
    <div v-else-if="error" class="text-center py-20 px-6">
      <p class="text-red-400 font-medium">{{ error }}</p>
      <RouterLink to="/" class="mt-4 inline-block text-accent-light text-sm hover:underline">Go home</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '@/stores/posts'

const route = useRoute()
const postsStore = usePostsStore()

const loading = computed(() => postsStore.loading)
const error = computed(() => postsStore.error)

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    await postsStore.fetchPostById(id)
  }
})
</script>
