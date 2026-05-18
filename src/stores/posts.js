import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { r34Api } from '@/services/r34Api'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const hotPosts = ref([])
  const selectedPost = ref(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(null)
  const currentPage = ref(0)
  const hasMore = ref(true)
  const currentTags = ref('')
  const totalCount = ref(0)

  const isEmpty = computed(() => !loading.value && posts.value.length === 0)

  async function fetchPosts(tags = '', reset = true) {
    if (reset) {
      posts.value = []
      currentPage.value = 0
      hasMore.value = true
      currentTags.value = tags
    }
    if (!hasMore.value || loading.value) return

    loading.value = reset
    loadingMore.value = !reset
    error.value = null

    try {
      const limit = 40
      const data = await r34Api.getPosts({
        tags,
        pid: currentPage.value,
        limit
      })
      const items = Array.isArray(data) ? data : []
      if (reset) {
        posts.value = items
      } else {
        posts.value.push(...items)
      }
      if (items.length < limit) hasMore.value = false
      currentPage.value++
    } catch (e) {
      error.value = e.message || 'Failed to load posts'
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function fetchMore() {
    if (loadingMore.value || !hasMore.value) return
    await fetchPosts(currentTags.value, false)
  }

  async function fetchHotPosts() {
    loading.value = true
    error.value = null
    try {
      const data = await r34Api.getPosts({ tags: 'sort:score:desc', pid: 0, limit: 40 })
      hotPosts.value = Array.isArray(data) ? data : []
    } catch (e) {
      error.value = e.message || 'Failed to load hot posts'
    } finally {
      loading.value = false
    }
  }

  async function fetchPostById(id) {
    loading.value = true
    error.value = null
    try {
      const data = await r34Api.getPost(id)
      if (data && data.length > 0) {
        selectedPost.value = data[0]
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchRandomPost() {
    loading.value = true
    try {
      // sort:random asks the API to randomise across the entire database
      const data = await r34Api.getPosts({ tags: 'sort:random', pid: 0, limit: 1 })
      if (data && data.length > 0) {
        selectedPost.value = data[0]
        return data[0]
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function openPost(post) {
    selectedPost.value = post
  }

  function closePost() {
    selectedPost.value = null
  }

  return {
    posts, hotPosts, selectedPost, loading, loadingMore,
    error, currentPage, hasMore, currentTags, totalCount, isEmpty,
    fetchPosts, fetchMore, fetchHotPosts, fetchPostById, fetchRandomPost,
    openPost, closePost
  }
})
