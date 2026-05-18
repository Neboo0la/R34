<template>
  <!-- Horizontal: label left, slot right (used for Data rows with action buttons) -->
  <div v-if="horizontal" class="flex items-center justify-between gap-4 px-4 py-3.5">
    <div class="min-w-0">
      <p class="text-sm font-medium text-white">{{ label }}</p>
      <p v-if="description" class="text-xs text-zinc-500 mt-0.5">{{ description }}</p>
    </div>
    <div class="flex-shrink-0"><slot /></div>
  </div>

  <!-- Vertical: label header on top, controls below (used for multi-control rows) -->
  <div v-else class="px-4 py-3.5 space-y-2.5">
    <div>
      <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{{ label }}</p>
      <p v-if="description" class="text-xs text-zinc-600 mt-0.5">{{ description }}</p>
    </div>
    <div><slot /></div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' },
  horizontal: { type: Boolean, default: false }
})
</script>
