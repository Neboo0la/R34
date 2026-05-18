import { ref, watch } from 'vue'

/** Returns a debounced ref that lags behind `source` by `delay` ms */
export function useDebounce(source, delay = 300) {
  const debounced = ref(typeof source === 'function' ? source() : source.value)
  let timer

  watch(
    typeof source === 'function' ? source : () => source.value,
    (val) => {
      clearTimeout(timer)
      timer = setTimeout(() => { debounced.value = val }, delay)
    }
  )

  return debounced
}
