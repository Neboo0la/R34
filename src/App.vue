<template>
  <div class="app-root">
    <AppLayout />
    <PostDetailModal v-if="postsStore.selectedPost" />
    <BackToTop />
    <Transition name="toast">
      <div
        v-if="toast.visible"
        class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl bg-bg-secondary border border-border text-sm text-white shadow-xl backdrop-blur-sm animate-fade-up"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, provide } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PostDetailModal from '@/components/PostDetailModal.vue'
import BackToTop from '@/components/BackToTop.vue'
import { usePostsStore } from '@/stores/posts'

const postsStore = usePostsStore()

const toast = reactive({ visible: false, message: '', timer: null })

function showToast(message, duration = 2500) {
  clearTimeout(toast.timer)
  toast.message = message
  toast.visible = true
  toast.timer = setTimeout(() => { toast.visible = false }, duration)
}

provide('showToast', showToast)
</script>
