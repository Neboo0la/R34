import { ref, onMounted, onUnmounted } from 'vue'

export function usePinchZoom(target) {
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  let initialDist = 0
  let initialScale = 1
  let initialMidX = 0
  let initialMidY = 0

  function dist(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  }

  function mid(t) {
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2
    }
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      initialDist = dist(e.touches)
      initialScale = scale.value
      const m = mid(e.touches)
      initialMidX = m.x
      initialMidY = m.y
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault()
      const newDist = dist(e.touches)
      const ratio = newDist / initialDist
      scale.value = Math.max(1, Math.min(5, initialScale * ratio))
    }
  }

  function onTouchEnd(e) {
    if (e.touches.length < 2 && scale.value <= 1.05) {
      scale.value = 1
      offsetX.value = 0
      offsetY.value = 0
    }
  }

  function reset() {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
  }

  onMounted(() => {
    const el = target?.value ?? target
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = target?.value ?? target
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  })

  return { scale, offsetX, offsetY, reset }
}
