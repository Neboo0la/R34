<template>
  <div class="space-y-0.5">
    <div class="flex items-center gap-2.5 px-1 mb-3">
      <span class="w-1 h-4 rounded-full bg-accent flex-shrink-0"></span>
      <h2 class="text-sm font-bold text-white">{{ title }}</h2>
    </div>
    <div class="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } })
</script>
