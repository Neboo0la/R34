import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'r34_favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(loadFromStorage())

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  watch(favorites, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {}
  }, { deep: true })

  const favoriteIds = computed(() => new Set(favorites.value.map(p => p.id)))

  function isFavorited(id) {
    return favoriteIds.value.has(id)
  }

  function toggle(post) {
    if (isFavorited(post.id)) {
      favorites.value = favorites.value.filter(p => p.id !== post.id)
      return false
    } else {
      favorites.value.unshift(post)
      return true
    }
  }

  function remove(id) {
    favorites.value = favorites.value.filter(p => p.id !== id)
  }

  function clear() {
    favorites.value = []
  }

  return { favorites, favoriteIds, isFavorited, toggle, remove, clear }
})
