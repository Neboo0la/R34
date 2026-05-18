import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'r34_settings'

const defaults = {
  gridDensity: 'medium',
  columns: 'auto',
  blacklistedTags: []
}

export const useSettingsStore = defineStore('settings', () => {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
    } catch {
      return { ...defaults }
    }
  }

  const saved = load()

  const gridDensity = ref(saved.gridDensity)
  const columns = ref(saved.columns)
  const blacklistedTags = ref(Array.isArray(saved.blacklistedTags) ? saved.blacklistedTags : [])

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gridDensity: gridDensity.value,
        columns: columns.value,
        blacklistedTags: blacklistedTags.value
      }))
    } catch {}
  }

  const allRefs = { gridDensity, columns, blacklistedTags }
  for (const r of Object.values(allRefs)) {
    watch(r, persist, { deep: true })
  }

  function reset() {
    for (const [key, val] of Object.entries(defaults)) {
      allRefs[key].value = Array.isArray(val) ? [...val] : val
    }
  }

  function addBlacklistedTag(tag) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '_')
    if (t && !blacklistedTags.value.includes(t)) {
      blacklistedTags.value.push(t)
    }
  }

  function removeBlacklistedTag(tag) {
    blacklistedTags.value = blacklistedTags.value.filter(t => t !== tag)
  }

  return {
    gridDensity, columns,
    blacklistedTags, addBlacklistedTag, removeBlacklistedTag, reset
  }
})
