<template>
  <div class="relative" ref="containerRef">
    <div :class="[
      'flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200',
      focused ? 'bg-bg-hover ring-1 ring-accent/40' : 'bg-bg-tertiary'
    ]">
      <svg class="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="inputRef"
        v-model="input"
        type="text"
        :placeholder="placeholder"
        class="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none min-w-0"
        @focus="focused = true"
        @blur="handleBlur"
        @keydown.enter.prevent="handleSubmit"
        @keydown.escape="clear"
        @keydown.down.prevent="moveSuggestion(1)"
        @keydown.up.prevent="moveSuggestion(-1)"
        @keydown.tab.prevent="applyCurrent"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <button v-if="input" @click="clear" class="text-zinc-500 hover:text-white transition-colors flex-shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div v-if="loading" class="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin flex-shrink-0" />
    </div>

    <!-- Autocomplete dropdown -->
    <Transition name="dropdown">
      <div
        v-if="focused && (suggestions.length > 0 || (showHistory && history.length > 0))"
        class="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-border bg-bg-secondary shadow-2xl overflow-hidden"
      >
        <!-- History -->
        <template v-if="showHistory && !input && history.length > 0">
          <div class="flex items-center justify-between px-3 py-2 border-b border-border">
            <span class="text-xs text-zinc-500 font-medium uppercase tracking-wide">Recent</span>
            <button @click="clearHistory" class="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Clear</button>
          </div>
          <button
            v-for="(h, i) in history.slice(0, 6)"
            :key="i"
            @mousedown.prevent="selectHistory(h)"
            :class="['w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-bg-hover transition-colors text-left', selectedIdx === i ? 'bg-bg-hover' : '']"
          >
            <svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-zinc-300 truncate flex-1">{{ h }}</span>
            <button @click.stop="removeHistory(h)" class="text-zinc-700 hover:text-zinc-400 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>
        </template>

        <!-- Suggestions -->
        <template v-if="suggestions.length > 0">
          <div class="flex items-center px-3 py-1.5 border-b border-border" v-if="showHistory && !input">
            <span class="text-xs text-zinc-500 font-medium uppercase tracking-wide">Suggestions</span>
          </div>
          <button
            v-for="(s, i) in suggestions.slice(0, 8)"
            :key="s.value ?? s.label ?? i"
            @mousedown.prevent="applySuggestion(s)"
            :class="[
              'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-bg-hover transition-colors text-left',
              selectedIdx === i + historyLen ? 'bg-bg-hover' : ''
            ]"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="text-white truncate">{{ s.label ?? s.value ?? s }}</span>
            </div>
            <span v-if="s.post_count" class="text-xs text-zinc-600 flex-shrink-0">{{ formatCount(s.post_count) }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAutocomplete } from '@/composables/useAutocomplete'
import { useSearchStore } from '@/stores/search'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search tags…' },
  showHistory: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchStore = useSearchStore()
const { input, suggestions, loading, applySuggestion: _apply, clear: _clearSuggestions } = useAutocomplete()

const focused = ref(false)
const selectedIdx = ref(-1)
const inputRef = ref(null)
const containerRef = ref(null)

watch(() => props.modelValue, v => { if (v !== input.value) input.value = v })
watch(input, v => emit('update:modelValue', v))

const history = computed(() => searchStore.history)
const historyLen = computed(() => (!input.value && props.showHistory) ? Math.min(history.value.length, 6) : 0)

function handleBlur() {
  setTimeout(() => { focused.value = false; selectedIdx.value = -1 }, 150)
}

function handleSubmit() {
  if (selectedIdx.value >= 0) {
    applyCurrent()
    return
  }
  if (!input.value.trim()) return
  searchStore.addToHistory(input.value.trim())
  emit('search', input.value.trim())
  focused.value = false
  _clearSuggestions()
}

function clear() {
  input.value = ''
  _clearSuggestions()
  emit('clear')
  inputRef.value?.focus()
}

function moveSuggestion(dir) {
  const total = historyLen.value + suggestions.value.slice(0, 8).length
  selectedIdx.value = Math.max(-1, Math.min(total - 1, selectedIdx.value + dir))
}

function applyCurrent() {
  if (selectedIdx.value < 0) return
  const hLen = historyLen.value
  if (selectedIdx.value < hLen) {
    selectHistory(history.value[selectedIdx.value])
  } else {
    _apply(suggestions.value[selectedIdx.value - hLen])
  }
  selectedIdx.value = -1
}

function selectHistory(h) {
  input.value = h
  emit('search', h)
  focused.value = false
}

function applySuggestion(s) {
  _apply(s)
  emit('update:modelValue', input.value)
}

function clearHistory() {
  searchStore.clearHistory()
}

function removeHistory(h) {
  searchStore.removeFromHistory(h)
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>
