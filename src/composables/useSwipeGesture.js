import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Detects swipe gestures on a target element.
 * @param {import('vue').Ref} target - element ref
 * @param {{ onSwipeLeft?: () => void, onSwipeRight?: () => void, onSwipeDown?: () => void, onSwipeUp?: () => void, threshold?: number }} handlers
 */
export function useSwipeGesture(target, handlers = {}) {
  const { onSwipeLeft, onSwipeRight, onSwipeDown, onSwipeUp, threshold = 50 } = handlers

  const startX = ref(0)
  const startY = ref(0)
  const swiping = ref(false)
  const deltaX = ref(0)
  const deltaY = ref(0)

  function onTouchStart(e) {
    startX.value = e.touches[0].clientX
    startY.value = e.touches[0].clientY
    deltaX.value = 0
    deltaY.value = 0
    swiping.value = true
  }

  function onTouchMove(e) {
    if (!swiping.value) return
    deltaX.value = e.touches[0].clientX - startX.value
    deltaY.value = e.touches[0].clientY - startY.value
  }

  function onTouchEnd() {
    if (!swiping.value) return
    swiping.value = false
    const dx = deltaX.value
    const dy = deltaY.value
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx > threshold && absDx > absDy) {
      if (dx < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    } else if (absDy > threshold && absDy > absDx) {
      if (dy < 0) onSwipeUp?.()
      else onSwipeDown?.()
    }

    deltaX.value = 0
    deltaY.value = 0
  }

  onMounted(() => {
    const el = target?.value ?? target
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = target?.value ?? target
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  })

  return { deltaX, deltaY, swiping }
}
