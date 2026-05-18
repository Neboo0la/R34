<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <div class="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div class="flex items-center gap-3 px-4 py-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-border">
          <svg class="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-white">Settings</h1>
          <p class="text-xs text-zinc-500">Customize your experience</p>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 space-y-6 max-w-lg">
      <!-- Display section -->
      <SettingsSection title="Display">
        <SettingsRow label="Grid density" description="Controls how many columns are shown">
          <div class="flex gap-1.5">
            <button
              v-for="d in densities"
              :key="d.value"
              @click="settings.gridDensity = d.value"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                settings.gridDensity === d.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-zinc-400 hover:text-white'
              ]"
            >{{ d.label }}</button>
          </div>
        </SettingsRow>
      </SettingsSection>

      <!-- Blacklist section -->
      <SettingsSection title="Tag Blacklist">
        <div class="px-4 py-4 space-y-3">
          <p class="text-xs text-zinc-500">Posts containing any of these tags will be hidden from all feeds.</p>

          <!-- Add tag input -->
          <form @submit.prevent="addTag" class="flex gap-2">
            <input
              v-model="blacklistInput"
              type="text"
              placeholder="e.g. scat, gore…"
              class="flex-1 bg-bg-tertiary border border-border text-sm text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-accent/50 transition-colors placeholder-zinc-600 min-w-0"
              @keydown.enter.prevent="addTag"
            />
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors flex-shrink-0 disabled:opacity-40"
              :disabled="!blacklistInput.trim()"
            >Add</button>
          </form>

          <!-- Blacklisted tag chips -->
          <div v-if="settings.blacklistedTags.length" class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in settings.blacklistedTags"
              :key="tag"
              @click="settings.removeBlacklistedTag(tag)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors group"
            >
              <span>{{ tag }}</span>
              <svg class="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p v-else class="text-xs text-zinc-700 italic">No blacklisted tags yet</p>
        </div>
      </SettingsSection>

      <!-- Data section -->
      <SettingsSection title="Data">
        <SettingsRow horizontal label="Favorites" :description="`${favStore.favorites.length} saved posts`" />
        <SettingsRow horizontal label="Search history" :description="`${searchStore.history.length} entries`">
          <button
            v-if="searchStore.history.length"
            @click="searchStore.clearHistory()"
            class="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >Clear</button>
        </SettingsRow>
      </SettingsSection>

      <!-- App info -->
      <div class="text-center py-4 space-y-1">
        <p class="text-xs text-zinc-700">R34 Browser v0.1.0</p>
        <p class="text-xs text-zinc-800">Powered by Rule34 API</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFavoritesStore } from '@/stores/favorites'
import { useSearchStore } from '@/stores/search'
import SettingsSection from '@/components/SettingsSection.vue'
import SettingsToggle from '@/components/SettingsToggle.vue'
import SettingsRow from '@/components/SettingsRow.vue'

const settings = useSettingsStore()
const favStore = useFavoritesStore()
const searchStore = useSearchStore()
const blacklistInput = ref('')

function addTag() {
  if (!blacklistInput.value.trim()) return
  settings.addBlacklistedTag(blacklistInput.value)
  blacklistInput.value = ''
}

const densities = [
  { value: 'compact', label: 'Compact' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
]


</script>
