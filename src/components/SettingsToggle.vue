<template>
  <div class="flex items-center justify-between gap-4 px-4 py-3.5">
    <div class="min-w-0">
      <p class="text-sm font-medium text-white">{{ label }}</p>
      <p v-if="description" class="text-xs text-zinc-500 mt-0.5 leading-relaxed">{{ description }}</p>
    </div>
    <button
      role="switch"
      :aria-checked="value"
      @click="$emit('change', !value)"
      :class="[
        'relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200',
        value ? 'bg-accent' : 'bg-bg-tertiary border border-border'
      ]"
    >
      <span :class="[
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
        value ? 'translate-x-5' : 'translate-x-0'
      ]" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' },
  value: { type: Boolean, required: true }
})
defineEmits(['change'])
</script>
