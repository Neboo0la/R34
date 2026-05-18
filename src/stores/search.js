import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const HISTORY_KEY = 'r34_search_history'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const suggestions = ref([])
  const loadingSuggestions = ref(false)
  const history = ref(loadHistory())
  const sortBy = ref('default')
  const ratingFilter = ref('all')

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  watch(history, (val) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(val.slice(0, 30)))
    } catch {}
  }, { deep: true })

  function addToHistory(q) {
    if (!q.trim()) return
    history.value = [q, ...history.value.filter(h => h !== q)].slice(0, 30)
  }

  function removeFromHistory(q) {
    history.value = history.value.filter(h => h !== q)
  }

  function clearHistory() {
    history.value = []
  }

  const builtQuery = computed(() => {
    let tags = query.value.trim()
    if (sortBy.value !== 'default') tags += ` sort:${sortBy.value}`
    if (ratingFilter.value !== 'all') tags += ` rating:${ratingFilter.value}`
    return tags.trim()
  })

  function setQuery(q) {
    query.value = q
  }

  return {
    query, suggestions, loadingSuggestions, history,
    sortBy, ratingFilter, builtQuery,
    addToHistory, removeFromHistory, clearHistory, setQuery
  }
})
