import { ref, watch } from 'vue'
import { r34Api } from '@/services/r34Api'
import { useDebounce } from './useDebounce'

export function useAutocomplete() {
  const input = ref('')
  const suggestions = ref([])
  const loading = ref(false)
  const debounced = useDebounce(input, 280)

  watch(debounced, async (val) => {
    const lastTag = val.split(' ').filter(Boolean).at(-1) ?? ''
    if (!lastTag || lastTag.startsWith('-') && lastTag.length < 2) {
      suggestions.value = []
      return
    }
    const q = lastTag.replace(/^-/, '')
    if (q.length < 2) { suggestions.value = []; return }

    loading.value = true
    suggestions.value = await r34Api.autocomplete(q)
    loading.value = false
  })

  function applySuggestion(tag) {
    const parts = input.value.split(' ').filter(Boolean)
    const isExclusion = parts.at(-1)?.startsWith('-')
    parts[parts.length - 1] = isExclusion ? `-${tag.value ?? tag}` : (tag.value ?? tag)
    input.value = parts.join(' ') + ' '
    suggestions.value = []
  }

  function clear() {
    suggestions.value = []
  }

  return { input, suggestions, loading, applySuggestion, clear }
}
