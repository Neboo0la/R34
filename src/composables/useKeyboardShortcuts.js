import { onMounted, onUnmounted } from 'vue'

/**
 * @param {Record<string, () => void>} shortcuts  e.g. { 'Escape': closeModal, 'ArrowRight': next }
 */
export function useKeyboardShortcuts(shortcuts) {
  function handler(e) {
    // Don't fire when typing in inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
    const fn = shortcuts[e.key]
    if (fn) { e.preventDefault(); fn() }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
