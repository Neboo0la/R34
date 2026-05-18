import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Calls `onLoadMore` when the sentinel element scrolls into view.
 * @param {() => Promise<void>} onLoadMore
 * @param {{ threshold?: number, rootMargin?: string }} opts
 */
export function useInfiniteScroll(onLoadMore, opts = {}) {
  const sentinel = ref(null)
  const { threshold = 0.1, rootMargin = '200px' } = opts

  let observer

  onMounted(() => {
    if (!sentinel.value) return
    observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0]?.isIntersecting) {
          await onLoadMore()
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(sentinel.value)
  })

  onUnmounted(() => { observer?.disconnect() })

  return { sentinel }
}
