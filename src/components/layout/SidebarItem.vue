<template>
  <RouterLink
    :to="item.to"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
      isActive
        ? 'bg-accent/15 text-accent-light'
        : 'text-zinc-400 hover:text-white hover:bg-bg-hover'
    ]"
    :title="collapsed ? item.label : ''"
  >
    <!-- Active indicator -->
    <div
      v-if="isActive"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-light rounded-r-full"
    />

    <component :is="iconComponent" class="w-5 h-5 flex-shrink-0" />

    <Transition name="fade">
      <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
    </Transition>
  </RouterLink>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: { type: Object, required: true },
  collapsed: { type: Boolean, default: false }
})

const route = useRoute()
const isActive = computed(() => route.name === props.item.name || route.path === props.item.to)

const icons = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  fire: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7 1.002 2.104 2.42 4.028 4.01 5.659a8.003 8.003 0 011.661 6.998z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
}

const iconComponent = computed(() =>
  defineComponent({
    render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: icons[props.item.icon] ?? icons.home })
    ])
  })
)
</script>
